"""The admin panel is bilingual: every English text it can show must have a Hungarian translation in i18n.js."""
import re
from pathlib import Path

from app import themes

ROOT = Path(__file__).resolve().parent.parent
STATIC = ROOT / "app" / "static"


def _hu_keys() -> set:
    src = (STATIC / "i18n.js").read_text(encoding="utf-8")
    body = src.split("const HU = {", 1)[1].split("\n};", 1)[0]
    return {m.group(1) for m in re.finditer(r'^\s*"((?:[^"\\]|\\.)*)":', body, re.M)}


def _patterns() -> list:
    src = (STATIC / "i18n.js").read_text(encoding="utf-8")
    body = src.split("const HU_PATTERNS = [", 1)[1].split("\n];", 1)[0]
    return [re.compile(m.group(1)) for m in re.finditer(r"\[/(.+?)/, ", body)]


def test_every_admin_panel_text_has_hungarian():
    keys = set(re.findall(r'\bt\("((?:[^"\\]|\\.)*)"', (STATIC / "app.js").read_text(encoding="utf-8")))
    keys |= set(re.findall(r'\bt\("((?:[^"\\]|\\.)*)"', (STATIC / "i18n.js").read_text(encoding="utf-8")))
    assert len(keys) > 200
    missing = sorted(keys - _hu_keys())
    assert not missing, missing


def test_theme_option_labels_have_hungarian():
    opts = themes.options()
    labels = {o["label"] for k in ("bases", "accents", "fonts", "animals", "band_decorations", "feature_decorations") for o in opts[k]}
    missing = sorted(labels - _hu_keys())
    assert not missing, missing


def test_server_messages_have_hungarian():
    main = (ROOT / "app" / "main.py").read_text(encoding="utf-8")
    plain = set(re.findall(r'HTTPException\(\d+, "([^"]+)"', main))
    plain |= set(re.findall(r'_google_fail\("([^"]+)"', main))
    plain |= set(re.findall(r'db\.audit\(conn, [^,]+, "([^"]+)"', main))
    plain |= {"draw", "reshuffle (everyone)", "partial reshuffle"}  # audit kinds chosen at runtime
    missing = sorted(plain - _hu_keys())
    assert not missing, missing
    from app.draw import IMPOSSIBLE
    assert IMPOSSIBLE in _hu_keys()
    # messages with values in them are matched by regex patterns
    samples = ["At most 5 ideas.", "Maximum of 5 admins reached.", "Pick between 2 and 7 people for a random draw.",
               "There is already a draw called “Cousins” in 2026.", "Anna has no e-mail and no helper with an e-mail address.",
               "x@example.com is not an admin of this Secret Santa."]
    pats = _patterns()
    for s in samples:
        assert any(p.search(s) for p in pats), s


def test_guide_has_hungarian_version(client):
    en = client.get("/guide")
    hu = client.get("/guide?lang=hu")
    assert en.status_code == hu.status_code == 200
    assert '<html lang="en">' in en.text and '<html lang="hu">' in hu.text
    assert "/guide?lang=hu" in en.text and "/guide?lang=en" in hu.text
    # both versions have the same sections
    ids = lambda html: re.findall(r'<section class="card" id="(\w+)"', html)
    assert ids(en.text) == ids(hu.text) and len(ids(en.text)) >= 13
