import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("SANTA_DB", str(tmp_path / "s.db"))
    monkeypatch.setenv("SANTA_OUTBOX", str(tmp_path / "outbox"))
    monkeypatch.delenv("SMTP_HOST", raising=False)
    monkeypatch.delenv("RESEND_API_KEY", raising=False)
    monkeypatch.delenv("PUBLIC_URL", raising=False)
    monkeypatch.setenv("SANTA_DIGEST_SCHEDULER", "0")  # tests call run_digest() themselves
    monkeypatch.setenv("SANTA_SERVER_KEY_FILE", str(tmp_path / "server.key"))
    from app import main
    main._sessions.clear()
    with TestClient(main.app) as c:
        yield c
