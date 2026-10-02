"""Blocking between two people (MIGRENT_MASTER_AUDIT MIG-032).

Either side's block stops messages, enquiries and applications between
them. The check fails closed: if the table cannot be read, the action is
refused, because a person who blocked someone has usually done it for their
safety. Blocks are written only through the API (/hub/blocks); migration
046 removes the browser's direct access to the table.
"""

import logging

from fastapi import HTTPException

logger = logging.getLogger(__name__)

BLOCKED_DETAIL = "You can't contact this person on Migrent."


def block_state(sb, user_id: str, other_id: str) -> dict:
    """{"by_me": user blocked other, "by_them": other blocked user}. Raises
    if the table cannot be read."""
    rows = (
        sb.table("blocked_users")
        .select("blocker_id, blocked_id")
        .or_(f"and(blocker_id.eq.{user_id},blocked_id.eq.{other_id}),and(blocker_id.eq.{other_id},blocked_id.eq.{user_id})")
        .execute()
        .data
        or []
    )
    return {
        "by_me": any(str(r["blocker_id"]) == str(user_id) for r in rows),
        "by_them": any(str(r["blocker_id"]) == str(other_id) for r in rows),
    }


def require_not_blocked(sb, user_id: str, other_id: str) -> None:
    try:
        state = block_state(sb, user_id, other_id)
    except Exception:
        logger.exception("block check failed between %s and %s", user_id, other_id)
        raise HTTPException(status_code=503, detail="This can't be sent right now. Please try again in a minute.")
    if state["by_me"] or state["by_them"]:
        raise HTTPException(status_code=403, detail=BLOCKED_DETAIL)
