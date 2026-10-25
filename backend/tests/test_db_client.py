"""
The shared service-role client (db.get_supabase_admin).

The other tests swap create_client for the in-memory fake, so they never
build a real supabase client. These do, so a library upgrade that changes
how the client is put together fails here instead of on the live API.
"""

import httpx

import db


def _admin_client(monkeypatch, handler):
    monkeypatch.setattr(db, "SUPABASE_SERVICE_ROLE_KEY", "sb_secret_test")
    monkeypatch.setattr(db, "_admin_client", None)
    monkeypatch.setattr(db, "_shared_http_client", lambda: httpx.Client(transport=httpx.MockTransport(handler)))
    return db.get_supabase_admin()


def test_database_storage_and_auth_share_one_connection_pool(monkeypatch):
    client = _admin_client(monkeypatch, lambda request: httpx.Response(200, json={}))
    pool = client.options.httpx_client
    assert client.postgrest.session is pool
    assert client.storage._client is pool
    assert client.auth._http_client is pool
    assert db.get_supabase_admin() is client


def test_new_style_secret_keys_are_sent_to_every_service(monkeypatch):
    seen = []

    def handler(request):
        seen.append(request)
        return httpx.Response(200, json={} if request.url.path.startswith("/auth/") else [])

    client = _admin_client(monkeypatch, handler)
    client.table("profiles").select("id").limit(1).execute()
    client.storage.from_("docs").list()
    client.auth._request("GET", "health")

    assert [r.url.path for r in seen] == ["/rest/v1/profiles", "/storage/v1/object/list/docs", "/auth/v1/health"]
    for request in seen:
        assert request.url.host == httpx.URL(db.SUPABASE_URL).host
        assert request.headers["apikey"] == "sb_secret_test"
        assert request.headers["authorization"] == "Bearer sb_secret_test"
