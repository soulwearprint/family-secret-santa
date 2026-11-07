import email
import email.policy
import json
import random
import re
from pathlib import Path

from app import themes

ART = Path(__file__).resolve().parent.parent / "app" / "static" / "art"


def test_every_option_has_artwork_in_both_formats():
    names = set()
    for a in themes.ANIMALS:
        if a != "none":
            names |= {themes.art_file(a), themes.art_file(a, hat=True)}
    for d in themes.DECORATIONS:
        for acc in themes.ACCENTS:
            names.add(themes.art_file(d, acc))
    for n in names:
        assert (ART / "svg" / f"{n}.svg").exists(), n
        assert (ART / "png" / f"{n}.png").exists(), n


def test_normalize_repairs_anything():
    assert themes.normalize(None) == themes.DEFAULT
    t = themes.normalize({"base": "nordic", "accent": "nope", "font": 3, "animal": "seal", "animal_hat": 1,
                          "decorations": ["star", "star", "lava", "sleigh"]})
    assert t == {"base": "nordic", "accent": "red", "font": "classic", "animal": "seal", "animal_hat": True,
                 "decorations": ["star", "sleigh"]}


def test_random_themes_are_valid():
    for seed in range(50):
        t = themes.random_theme(random.Random(seed))
        assert themes.normalize(t) == t and t["animal"] != "none" and t["decorations"]


def test_tokens_pick_tinted_ornament_and_hat():
    tk = themes.tokens({"accent": "plum", "animal": "llama", "animal_hat": True, "decorations": ["ornament", "santa_full"]})
    assert tk["band"] == ["ornament_plum"] and tk["animal"] == "llama_hat" and tk["santa_full"]


# ── API ──

def ok(r):
    assert r.status_code < 300, r.text
    return r.json() if "json" in r.headers.get("content-type", "") else r.text


def setup(c):
    ok(c.post("/api/setup", json={"name": "Mom", "password": "secret1"}))
    for n in ["Anna", "Bela", "Csilla"]:
        ok(c.post("/api/members", json={"name": n, "email": f"{n.lower()}@fam.test"}))
    ok(c.post("/api/years", json={"year": 2026}))


def test_theme_saved_per_year_copied_to_next_and_used_in_mail(client, tmp_path, monkeypatch):
    monkeypatch.setenv("PUBLIC_URL", "https://santa.example")
    c = client
    setup(c)
    assert ok(c.get("/api/years/2026"))["theme"] == themes.DEFAULT
    design = {"base": "nordic", "accent": "ice", "font": "storybook", "animal": "polar_bear", "animal_hat": True,
              "decorations": ["snowflake", "ornament", "sleigh", "santa_full"]}
    saved = ok(c.put("/api/years/2026/theme", json={"theme": {**design, "junk": 1}}))
    assert saved == design and ok(c.get("/api/years/2026"))["theme"] == design
    ok(c.post("/api/years", json={"year": 2027}))
    assert ok(c.get("/api/years/2027"))["theme"] == design  # starts from last year's look

    ok(c.post("/api/years/2026/draw", json={}))
    ok(c.post("/api/years/2026/notify", json={}))
    msg = email.message_from_bytes(next((tmp_path / "outbox").glob("2026_*.eml")).read_bytes(), policy=email.policy.default)
    html = msg.get_body(("html",)).get_content()
    base = themes.BASES["nordic"]
    assert base["bg"] in html and themes.ACCENTS["ice"][1] in html and "Book Antiqua" in html
    imgs = set(re.findall(r'src="https://santa\.example/static/art/png/([a-z_]+)\.png"', html))
    assert {"polar_bear_hat", "snowflake", "ornament_ice", "sleigh", "santa_full"} <= imgs
    # every image has alt text for clients that block images
    assert all('alt="' in tag for tag in re.findall(r"<img [^>]+>", html))


def test_preview_endpoints(client):
    c = client
    setup(c)
    t = {"base": "gingerbread", "accent": "copper", "animal": "reindeer", "decorations": ["gift", "holly"]}
    for kind in ("postcard", "invite", "digest"):
        for lang in ("hu", "en"):
            html = ok(c.post("/api/themes/preview", json={"theme": t, "kind": kind, "lang": lang, "year": 2026}))
            assert "/static/art/png/reindeer.png" in html and themes.BASES["gingerbread"]["bg"] in html
            assert "Anna" not in html  # sample names only, never real members
    c.post("/api/logout")
    assert c.post("/api/themes/preview", json={"theme": t}).status_code == 401
    # the personal-page preview helper is public but only maps a design to colours
    tk = ok(c.get("/api/themes/tokens", params={"t": json.dumps(t)}))
    assert tk["animal"] == "reindeer" and tk["paper"] == themes.BASES["gingerbread"]["paper"]
    assert ok(c.get("/api/themes/tokens", params={"t": "{broken"}))["theme"] == themes.DEFAULT
    assert c.get("/p/demo").status_code == 200
    assert c.get("/static/art/svg/samoyed_hat.svg").status_code == 200
