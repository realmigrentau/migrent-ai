"""
An in-memory stand-in for the supabase-py client.

It implements the subset of the PostgREST query builder the MigRent backend
uses (select / insert / update / upsert / delete, eq / neq / gt / gte / lt /
lte / ilike / in_ / is_ / or_, order / range / limit, count="exact") plus the
auth.get_user, auth.admin.get_user_by_id and storage APIs the routes call.

It exists so authorisation, data-contract and payment-webhook behaviour can be
tested without a database and without production credentials. It is not a
SQL engine: comparisons are Python comparisons on the stored values.
"""

from __future__ import annotations

import copy
import re
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from types import SimpleNamespace
from typing import Any, Callable, Optional


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class _Result:
    data: Any
    count: Optional[int] = None


_OPS: dict[str, Callable[[Any, Any], bool]] = {
    "eq": lambda a, b: str(a) == str(b) if a is not None else b is None,
    "neq": lambda a, b: str(a) != str(b),
    "gt": lambda a, b: a is not None and _cmp(a, b) > 0,
    "gte": lambda a, b: a is not None and _cmp(a, b) >= 0,
    "lt": lambda a, b: a is not None and _cmp(a, b) < 0,
    "lte": lambda a, b: a is not None and _cmp(a, b) <= 0,
    "ilike": lambda a, b: a is not None and re.fullmatch(_like_to_regex(b), str(a), re.IGNORECASE) is not None,
    "is": lambda a, b: (a is None) if str(b).lower() == "null" else (a == b),
    "in": lambda a, b: a in b,
}


def _cmp(a: Any, b: Any) -> int:
    try:
        fa, fb = float(a), float(b)
        return (fa > fb) - (fa < fb)
    except (TypeError, ValueError):
        sa, sb = str(a), str(b)
        return (sa > sb) - (sa < sb)


def _like_to_regex(pattern: str) -> str:
    return "".join(".*" if ch == "%" else "." if ch == "_" else re.escape(ch) for ch in str(pattern))


def _parse_or(expr: str) -> Callable[[dict], bool]:
    """Parse a PostgREST `or=` expression such as
    ``a.eq.1,b.is.null`` or ``and(x.eq.1,y.eq.2),and(x.eq.2,y.eq.1)``."""
    parts = _split_top_level(expr)
    clauses = [_parse_clause(p) for p in parts]
    return lambda row: any(c(row) for c in clauses)


def _parse_and(expr: str) -> Callable[[dict], bool]:
    parts = _split_top_level(expr)
    clauses = [_parse_clause(p) for p in parts]
    return lambda row: all(c(row) for c in clauses)


def _parse_clause(clause: str) -> Callable[[dict], bool]:
    clause = clause.strip()
    if clause.startswith("and(") and clause.endswith(")"):
        return _parse_and(clause[4:-1])
    if clause.startswith("or(") and clause.endswith(")"):
        return _parse_or(clause[3:-1])
    field_name, op, value = clause.split(".", 2)
    if op == "in":
        value = [v.strip() for v in value.strip("()").split(",")]
    fn = _OPS[op]
    return lambda row: fn(row.get(field_name), value)


def _split_top_level(expr: str) -> list[str]:
    out, depth, cur = [], 0, []
    for ch in expr:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if ch == "," and depth == 0:
            out.append("".join(cur))
            cur = []
        else:
            cur.append(ch)
    if cur:
        out.append("".join(cur))
    return out


class FakeQuery:
    def __init__(self, db: "FakeSupabase", table: str):
        self._db = db
        self._table = table
        self._filters: list[Callable[[dict], bool]] = []
        self._select: Optional[str] = None
        self._count = False
        self._order: list[tuple[str, bool]] = []
        self._range: Optional[tuple[int, int]] = None
        self._limit: Optional[int] = None
        self._op: str = "select"
        self._payload: Any = None
        self._single = False

    # ---- verbs -------------------------------------------------------
    def select(self, cols: str = "*", count: Optional[str] = None):
        self._select = cols
        self._count = count == "exact"
        return self

    def insert(self, payload):
        self._op = "insert"
        self._payload = payload
        return self

    def update(self, payload: dict):
        self._op = "update"
        self._payload = payload
        return self

    def upsert(self, payload: dict):
        self._op = "upsert"
        self._payload = payload
        return self

    def delete(self):
        self._op = "delete"
        return self

    # ---- filters -----------------------------------------------------
    def _add(self, fn):
        self._filters.append(fn)
        return self

    def eq(self, col, val):
        return self._add(lambda r: _OPS["eq"](r.get(col), val))

    def neq(self, col, val):
        return self._add(lambda r: _OPS["neq"](r.get(col), val))

    def gt(self, col, val):
        return self._add(lambda r: _OPS["gt"](r.get(col), val))

    def gte(self, col, val):
        return self._add(lambda r: _OPS["gte"](r.get(col), val))

    def lt(self, col, val):
        return self._add(lambda r: _OPS["lt"](r.get(col), val))

    def lte(self, col, val):
        return self._add(lambda r: _OPS["lte"](r.get(col), val))

    def ilike(self, col, val):
        return self._add(lambda r: _OPS["ilike"](r.get(col), val))

    def in_(self, col, vals):
        vals = [str(v) for v in vals]
        return self._add(lambda r: str(r.get(col)) in vals)

    def is_(self, col, val):
        return self._add(lambda r: _OPS["is"](r.get(col), val))

    def or_(self, expr: str):
        return self._add(_parse_or(expr))

    def order(self, col, desc: bool = False):
        self._order.append((col, desc))
        return self

    def range(self, start: int, end: int):
        self._range = (start, end)
        return self

    def limit(self, n: int):
        self._limit = n
        return self

    def single(self):
        self._single = True
        return self

    def maybe_single(self):
        self._single = True
        return self

    # ---- execution ---------------------------------------------------
    def _matching(self, rows):
        return [r for r in rows if all(f(r) for f in self._filters)]

    def _project(self, row: dict) -> dict:
        if not self._select or self._select.strip() == "*":
            return copy.deepcopy(row)
        cols = [c.strip() for c in self._select.replace("\n", " ").split(",")]
        out = {}
        for c in cols:
            if not c:
                continue
            key = c.split("(")[0].strip()
            if key in row:
                out[key] = copy.deepcopy(row[key])
        return out

    def execute(self) -> _Result:
        table = self._db.tables.setdefault(self._table, [])
        if self._op == "select":
            rows = self._matching(table)
            for col, desc in reversed(self._order):
                rows.sort(key=lambda r: (r.get(col) is None, r.get(col)), reverse=desc)
            total = len(rows)
            if self._range:
                s, e = self._range
                rows = rows[s : e + 1]
            if self._limit is not None:
                rows = rows[: self._limit]
            data = [self._project(r) for r in rows]
            if self._single:
                data = data[0] if data else None
            return _Result(data=data, count=total if self._count else None)

        if self._op == "insert":
            payloads = self._payload if isinstance(self._payload, list) else [self._payload]
            inserted = []
            for p in payloads:
                row = copy.deepcopy(p)
                row.setdefault("id", str(uuid.uuid4()))
                row.setdefault("created_at", _now_iso())
                row.setdefault("updated_at", _now_iso())
                for hook in self._db.insert_hooks.get(self._table, []):
                    hook(row, table)
                table.append(row)
                inserted.append(copy.deepcopy(row))
            return _Result(data=inserted)

        if self._op == "upsert":
            p = self._payload
            existing = next((r for r in table if str(r.get("id")) == str(p.get("id"))), None)
            if existing is None:
                row = copy.deepcopy(p)
                row.setdefault("id", str(uuid.uuid4()))
                table.append(row)
                return _Result(data=[copy.deepcopy(row)])
            existing.update(copy.deepcopy(p))
            return _Result(data=[copy.deepcopy(existing)])

        if self._op == "update":
            updated = []
            for r in self._matching(table):
                for hook in self._db.update_hooks.get(self._table, []):
                    hook(r, self._payload)
                r.update(copy.deepcopy(self._payload))
                r["updated_at"] = _now_iso()
                updated.append(copy.deepcopy(r))
            return _Result(data=updated)

        if self._op == "delete":
            keep, removed = [], []
            for r in table:
                (removed if all(f(r) for f in self._filters) else keep).append(r)
            self._db.tables[self._table] = keep
            return _Result(data=removed)

        raise RuntimeError(f"unsupported op {self._op}")


class _FakeStorageBucket:
    def __init__(self, db: "FakeSupabase", name: str):
        self._db = db
        self._name = name

    def upload(self, path: str, file: bytes, file_options=None, **kwargs):
        self._db.storage_objects.setdefault(self._name, {})[path] = file
        return {"path": path}

    def create_signed_url(self, path: str, expires_in: int):
        return {"signedURL": f"https://storage.test/{self._name}/{path}?token=signed&exp={expires_in}"}

    def get_public_url(self, path: str):
        return f"https://storage.test/{self._name}/{path}"

    def remove(self, paths):
        for p in paths:
            self._db.storage_objects.get(self._name, {}).pop(p, None)
        return paths


class _FakeStorage:
    def __init__(self, db: "FakeSupabase"):
        self._db = db

    def from_(self, name: str):
        return _FakeStorageBucket(self._db, name)

    def get_bucket(self, name):
        return {"id": name}

    def create_bucket(self, name, options=None):
        return {"id": name}


class _FakeAuthAdmin:
    def __init__(self, db: "FakeSupabase"):
        self._db = db

    def get_user_by_id(self, user_id: str):
        u = self._db.users.get(str(user_id))
        return SimpleNamespace(user=u)

    def delete_user(self, user_id: str):
        self._db.users.pop(str(user_id), None)


class _FakeAuth:
    def __init__(self, db: "FakeSupabase"):
        self._db = db
        self.admin = _FakeAuthAdmin(db)

    def get_user(self, token: str):
        user_id = self._db.tokens.get(token)
        if not user_id:
            raise RuntimeError("invalid token")
        return SimpleNamespace(user=self._db.users[user_id])


@dataclass
class FakeSupabase:
    tables: dict[str, list[dict]] = field(default_factory=dict)
    users: dict[str, Any] = field(default_factory=dict)
    tokens: dict[str, str] = field(default_factory=dict)
    storage_objects: dict[str, dict[str, bytes]] = field(default_factory=dict)
    insert_hooks: dict[str, list[Callable]] = field(default_factory=dict)
    update_hooks: dict[str, list[Callable]] = field(default_factory=dict)

    def __post_init__(self):
        self.auth = _FakeAuth(self)
        self.storage = _FakeStorage(self)

    def table(self, name: str) -> FakeQuery:
        return FakeQuery(self, name)

    def rpc(self, name: str, params=None):
        raise RuntimeError("rpc not supported in fake")

    # ---- helpers for tests ------------------------------------------
    def add_user(self, user_id: str, email: str, *, user_metadata: Optional[dict] = None, token: Optional[str] = None):
        user = SimpleNamespace(
            id=user_id,
            email=email,
            user_metadata=user_metadata or {},
            app_metadata={"provider": "email"},
            email_confirmed_at=_now_iso(),
        )
        self.users[user_id] = user
        self.tokens[token or f"tok-{user_id}"] = user_id
        return user

    def seed(self, table: str, rows: list[dict]):
        for r in rows:
            r.setdefault("id", str(uuid.uuid4()))
            r.setdefault("created_at", _now_iso())
        self.tables.setdefault(table, []).extend(copy.deepcopy(rows))

    def rows(self, table: str) -> list[dict]:
        return self.tables.get(table, [])
