"""The API's front door: who counts as one person for rate limits, the
default limit on every route, security headers, and the request size cap."""

from types import SimpleNamespace

import pytest
from starlette.datastructures import Headers

import limiter as limiter_mod
from tests.conftest import SEEKER_ID, auth


def _request(headers: dict, peer: str = "203.0.113.9"):
    return SimpleNamespace(headers=Headers(headers), client=SimpleNamespace(host=peer))


def test_a_made_up_forwarded_for_does_not_change_who_you_are():
    # The leftmost X-Forwarded-For entry is whatever the caller typed.
    a = _request({"x-forwarded-for": "10.0.0.1, 198.51.100.7"})
    b = _request({"x-forwarded-for": "10.0.0.2, 198.51.100.7"})
    assert limiter_mod.client_ip(a) == limiter_mod.client_ip(b) == "198.51.100.7"


def test_the_edge_header_wins_over_forwarded_for():
    req = _request({"cf-connecting-ip": "198.51.100.20", "x-forwarded-for": "1.1.1.1, 2.2.2.2"})
    assert limiter_mod.client_ip(req) == "198.51.100.20"


def test_garbage_headers_fall_back_to_the_socket():
    req = _request({"cf-connecting-ip": "not-an-ip", "x-forwarded-for": "also, nonsense"})
    assert limiter_mod.client_ip(req) == "203.0.113.9"


def test_ipv6_is_counted_per_64_block():
    a = _request({"cf-connecting-ip": "2001:db8:1:2::1"})
    b = _request({"cf-connecting-ip": "2001:db8:1:2:ffff::9"})
    assert limiter_mod.client_ip(a) == limiter_mod.client_ip(b) == "2001:db8:1:2::/64"


def test_every_route_has_a_limit_unless_exempt():
    import main

    assert limiter_mod.limiter._default_limits, "routes without their own limit must get the default"
    exempt = limiter_mod.limiter._exempt_routes
    assert "routes_deals.stripe_webhook" in exempt
    assert "main.health" in exempt
    assert any(d.dependency is limiter_mod.default_limit for d in main.app.router.dependencies)


def test_default_limit_applies_to_an_undecorated_route(client, monkeypatch):
    from slowapi.wrappers import LimitGroup

    limiter = limiter_mod.limiter
    tight = [LimitGroup("3/minute", limiter._key_func, None, False, None, None, None, 1, False)]
    monkeypatch.setattr(limiter, "_default_limits", tight)
    limiter.enabled = True
    limiter.reset()
    try:
        codes = [client.get("/hub/features", headers={"cf-connecting-ip": "198.51.100.77"}).status_code for _ in range(4)]
    finally:
        limiter.enabled = False
        limiter.reset()
    assert 429 not in codes[:3]
    assert codes[3] == 429


def test_too_many_requests_is_a_plain_message(client, monkeypatch):
    limiter = limiter_mod.limiter
    limiter.enabled = True
    limiter.reset()
    try:
        last = None
        for _ in range(35):
            last = client.get("/health/ip", headers={"cf-connecting-ip": "198.51.100.88"})
        assert last.status_code == 429
        assert last.json() == {"detail": "Too many requests. Please wait a minute and try again."}
        assert last.headers["retry-after"] == "60"
    finally:
        limiter.enabled = False
        limiter.reset()


def test_health_ip_reports_the_counted_address(client):
    res = client.get("/health/ip", headers={"x-forwarded-for": "6.6.6.6, 198.51.100.5"})
    assert res.json() == {"ip": "198.51.100.5"}


def test_security_headers_on_every_answer(client):
    res = client.get("/health")
    assert res.headers["x-content-type-options"] == "nosniff"
    assert res.headers["x-frame-options"] == "DENY"
    assert res.headers["referrer-policy"] == "no-referrer"
    assert "frame-ancestors 'none'" in res.headers["content-security-policy"]
    assert "cache-control" not in res.headers  # public answers may be cached


def test_signed_in_answers_are_never_cached(client):
    res = client.get("/hub/me", headers=auth(SEEKER_ID))
    assert res.headers.get("cache-control") == "no-store"


def test_cors_preflight_still_works(client):
    res = client.options(
        "/hub/me",
        headers={"Origin": "https://migrent.vercel.app", "Access-Control-Request-Method": "GET", "Access-Control-Request-Headers": "authorization"},
    )
    assert res.status_code == 200
    assert res.headers["access-control-allow-origin"] == "https://migrent.vercel.app"


@pytest.mark.parametrize("size", [13 * 1024 * 1024])
def test_oversized_bodies_are_refused_before_reading(client, size):
    res = client.post("/support/contact", content=b"x" * size, headers={"content-type": "application/json"})
    assert res.status_code == 413
    assert res.json() == {"detail": "That upload is too large."}
