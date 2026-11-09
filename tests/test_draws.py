import email
import email.policy

import pytest


def ok(r):
    assert r.status_code < 300, r.text
    return r.json()


def people(c, names):
    return {n: ok(c.post("/api/members", json={"name": n, "email": f"{n.lower()}@fam.test"}))["id"] for n in names}


def reveal(c, draw):
    return {p["giver"]: p["receiver"] for p in ok(c.post(f"/api/years/{draw}/reveal", json={"password": "secret1"}))}


@pytest.fixture()
def fam(client):
    ok(client.post("/api/setup", json={"name": "Mom", "password": "secret1"}))
    ids = people(client, ["Anna", "Bela", "Csilla", "Dani", "Eva", "Feri", "Gabi", "Hanna", "Ivan", "Jozsi"])
    return client, ids


def test_groups_and_parallel_named_draws(fam, tmp_path):
    c, ids = fam
    circle = [ids[n] for n in ["Anna", "Bela", "Csilla", "Dani", "Eva"]]
    gid = ok(c.post("/api/groups", json={"name": "Family circle", "member_ids": circle}))["id"]
    assert c.post("/api/groups", json={"name": "family CIRCLE", "member_ids": []}).status_code == 409
    ok(c.post("/api/groups", json={"name": "Cousins", "member_ids": [ids["Anna"], ids["Feri"]]}))
    groups = {g["name"]: g for g in ok(c.get("/api/groups"))}
    assert set(groups["Family circle"]["member_ids"]) == set(circle) and ids["Anna"] in groups["Cousins"]["member_ids"]

    small = ok(c.post("/api/draws", json={"cal_year": 2026, "name": "Family circle", "source": "group", "group_id": gid}))["year"]
    big = ok(c.post("/api/draws", json={"cal_year": 2026, "name": "Everyone", "source": "everyone"}))["year"]
    lucky = ok(c.post("/api/draws", json={"cal_year": 2026, "name": "Lucky 4", "source": "random", "count": 4}))["year"]
    assert len({small, big, lucky}) == 3
    assert c.post("/api/draws", json={"cal_year": 2026, "name": "everyone", "source": "none"}).status_code == 409
    assert c.post("/api/draws", json={"cal_year": 2026, "name": "Too many", "source": "random", "count": 99}).status_code == 422

    listed = {d["label"]: d for d in ok(c.get("/api/years"))}
    assert listed["2026 · Family circle"]["participants"] == 5
    assert listed["2026 · Everyone"]["participants"] == 10 and listed["2026 · Lucky 4"]["participants"] == 4

    ok(c.put(f"/api/years/{small}", json={"budget": "15 000 Ft", "exchange_date": "", "note": ""}))
    ok(c.post(f"/api/years/{small}/draw", json={}))
    ok(c.post(f"/api/years/{big}/draw", json={}))
    s_pairs, b_pairs = reveal(c, small), reveal(c, big)
    # the same person never gets the same giftee in two draws of the same year
    assert all(b_pairs[g] != r for g, r in s_pairs.items())

    # each draw sends its own, clearly labelled postcard
    ok(c.post(f"/api/years/{small}/notify", json={}))
    ok(c.post(f"/api/years/{big}/notify", json={}))
    anna = [email.message_from_bytes(f.read_bytes(), policy=email.policy.default)
            for f in (tmp_path / "outbox").glob("*_anna_fam_test.eml")]
    subjects = sorted(str(m["Subject"]) for m in anna)
    assert len(anna) == 2 and any("Family circle" in x for x in subjects) and any("Everyone" in x for x in subjects)
    small_card = next(m for m in anna if "Family circle" in str(m["Subject"])).get_body(("plain",)).get_content()
    assert "15 000 Ft" in small_card and "2026 karácsonyán" in small_card  # calendar year, not the draw id
    assert str(small) not in small_card or small == 2026


def test_series_no_repeat_uses_last_years_draw_of_same_name(fam):
    c, ids = fam
    gid = ok(c.post("/api/groups", json={"name": "Circle", "member_ids": [ids[n] for n in ["Anna", "Bela", "Csilla", "Dani", "Eva", "Feri"]]}))["id"]
    d25 = ok(c.post("/api/draws", json={"cal_year": 2025, "name": "Circle", "source": "group", "group_id": gid}))["year"]
    ok(c.post(f"/api/years/{d25}/draw", json={}))
    p25 = reveal(c, d25)
    d26 = ok(c.post("/api/draws", json={"cal_year": 2026, "name": "Circle", "source": "previous"}))["year"]
    assert len(ok(c.get(f"/api/years/{d26}"))["participants"]) == 6  # copied from last year's Circle
    ok(c.post(f"/api/years/{d26}/draw", json={}))
    p26 = reveal(c, d26)
    assert all(p26[g] != p25[g] for g in p25)


def test_legacy_unnamed_draw_keeps_year_as_id(fam):
    c, _ = fam
    assert ok(c.post("/api/years", json={"year": 2026}))["year"] == 2026
    second = ok(c.post("/api/draws", json={"cal_year": 2026, "name": "Kids", "source": "none"}))["year"]
    assert second > 100000
    d = ok(c.get(f"/api/years/{second}"))
    assert d["cal_year"] == 2026 and d["label"] == "2026 · Kids" and d["participants"] == []
    ok(c.put(f"/api/years/{second}", json={"budget": "", "exchange_date": "", "note": "", "name": "Little ones"}))
    assert ok(c.get(f"/api/years/{second}"))["label"] == "2026 · Little ones"


def test_admin_edits_gift_ideas_with_the_same_rules(fam, tmp_path):
    from app import main
    c, ids = fam
    d = ok(c.post("/api/draws", json={"cal_year": 2026, "name": "", "source": "everyone"}))["year"]
    # before the draw: add and freely remove
    w = ok(c.post(f"/api/years/{d}/wishes/{ids['Anna']}", json={"text": "Puzzle"}))["wishes"]
    w = ok(c.post(f"/api/years/{d}/wishes/{ids['Anna']}", json={"text": "Typo"}))["wishes"]
    ok(c.delete(f"/api/years/{d}/wishes/{ids['Anna']}/{w[1]['id']}"))
    listing = {p["name"]: p["wishes"] for p in ok(c.get(f"/api/years/{d}/wishes"))}
    assert [x["text"] for x in listing["Anna"]] == ["Puzzle"]
    assert c.post(f"/api/years/{d}/wishes/99999", json={"text": "x"}).status_code == 404

    ok(c.post(f"/api/years/{d}/draw", json={}))
    ok(c.post(f"/api/years/{d}/notify", json={}))  # card lists Puzzle -> now "sent"
    puzzle = listing["Anna"][0]["id"]
    assert c.delete(f"/api/years/{d}/wishes/{ids['Anna']}/{puzzle}").status_code == 409
    ok(c.post(f"/api/years/{d}/wishes/{ids['Anna']}/{puzzle}/obsolete", json={"obsolete": True, "reason": "got_it"}))
    ok(c.post(f"/api/years/{d}/wishes/{ids['Anna']}", json={"text": "Scarf"}))
    # the admin's edits reach Anna's Secret Santa in the digest, like her own would
    assert main.run_digest()["sent"] == 1
    santa = next(g for g, r in reveal(c, d).items() if r == "Anna")
    (notice,) = (tmp_path / "outbox").glob("*_ideas_*.eml")
    msg = email.message_from_bytes(notice.read_bytes(), policy=email.policy.default)
    text = msg.get_body(("plain",)).get_content()
    assert email.utils.parseaddr(msg["To"])[0] == santa and "Scarf" in text and "Puzzle" in text
    log = [a["action"] for a in ok(c.get("/api/audit"))]
    assert "gift ideas edited by admin" in log


def test_copy_gift_ideas_from_another_draw(fam, tmp_path):
    from app import main
    c, ids = fam
    big = ok(c.post("/api/draws", json={"cal_year": 2026, "name": "Everyone", "source": "everyone"}))["year"]
    gid = ok(c.post("/api/groups", json={"name": "Circle", "member_ids": [ids[n] for n in ["Anna", "Bela", "Csilla", "Dani"]]}))["id"]
    small = ok(c.post("/api/draws", json={"cal_year": 2026, "name": "Circle", "source": "group", "group_id": gid}))["year"]
    for t in ["Puzzle", "Sál", "Krimi"]:
        ok(c.post(f"/api/years/{big}/wishes/{ids['Anna']}", json={"text": t}))
    w = ok(c.post(f"/api/years/{small}/wishes/{ids['Anna']}", json={"text": "puzzle"}))["wishes"]  # same idea, other case

    # admin side: sources list the other draw; copying skips the duplicate
    srcs = ok(c.get(f"/api/years/{small}/wishes/{ids['Anna']}/copy-sources"))
    assert [x["label"] for x in srcs] == ["2026 · Everyone"] and srcs[0]["count"] == 3
    out = ok(c.post(f"/api/years/{small}/wishes/{ids['Anna']}/copy", json={"draw": big}))
    assert out["copied"] == 2 and out["skipped"] == 1
    assert sorted(x["text"] for x in out["wishes"]) == ["Krimi", "Sál", "puzzle"]
    # copying again adds nothing; a draw Anna has no ideas in can't be a source
    assert ok(c.post(f"/api/years/{small}/wishes/{ids['Anna']}/copy", json={"draw": big}))["copied"] == 0
    assert c.post(f"/api/years/{small}/wishes/{ids['Anna']}/copy", json={"draw": small}).status_code == 404

    # participant side, through Anna's personal link in the small draw
    ok(c.post(f"/api/years/{small}/draw", json={}))
    ok(c.post(f"/api/years/{small}/notify", json={}))
    card = next(f for f in (tmp_path / "outbox").glob("*_Circle_anna_fam_test.eml"))
    msg = email.message_from_bytes(card.read_bytes(), policy=email.policy.default)
    token = msg.get_body(("plain",)).get_content().split("/p/")[1].split()[0].split("#")[0]
    ok(c.post(f"/api/years/{big}/wishes/{ids['Anna']}", json={"text": "Bögre"}))
    c.post("/api/logout")
    assert [x["draw"] for x in ok(c.get(f"/api/p/{token}/copy-sources"))] == [big]
    out = ok(c.post(f"/api/p/{token}/copy", json={"draw": big}))
    assert out["copied"] == 1 and "Bögre" in [x["text"] for x in out["my_wishes"]]
    # the copied idea is new for this draw's Secret Santa -> goes into the digest
    assert main.run_digest()["sent"] == 1
    # the limit of 5 still holds when copying
    ok(c.post("/api/login", json={"name": "Mom", "password": "secret1"}))
    for t in ["x1", "x2", "x3", "x4"]:
        ok(c.post(f"/api/years/{big}/wishes/{ids['Bela']}", json={"text": t}))
    ok(c.post(f"/api/years/{small}/wishes/{ids['Bela']}", json={"text": "own idea"}))
    ok(c.post(f"/api/years/{small}/wishes/{ids['Bela']}", json={"text": "another"}))
    out = ok(c.post(f"/api/years/{small}/wishes/{ids['Bela']}/copy", json={"draw": big}))
    assert out["copied"] == 3 and out["skipped"] == 1
    assert len([x for x in out["wishes"] if not x["obsolete"]]) == 5


def test_exclusions_are_per_draw(fam):
    c, ids = fam
    a, b = ids["Anna"], ids["Bela"]
    circle = ok(c.post("/api/draws", json={"cal_year": 2026, "name": "Circle", "source": "none"}))["year"]
    big = ok(c.post("/api/draws", json={"cal_year": 2026, "name": "Everyone", "source": "none"}))["year"]
    # small 4-person draws, so an Anna/Bela pairing turns up often when it is allowed
    for d in (circle, big):
        ok(c.put(f"/api/years/{d}/participants", json={"member_ids": [a, b, ids["Csilla"], ids["Dani"]]}))
        ok(c.put(f"/api/years/{d}", json={"budget": "", "exchange_date": "", "note": "", "avoid_parallel": False}))
    ok(c.post(f"/api/years/{circle}/exclusions", json={"a_id": a, "b_id": b}))
    assert ok(c.get(f"/api/years/{big}/exclusions")) == []  # no spill-over

    seen_ab_in_big = False
    for _ in range(30):
        ok(c.post(f"/api/years/{circle}/draw", json={"everyone": True, "confirm": True}))
        ok(c.post(f"/api/years/{big}/draw", json={"everyone": True, "confirm": True}))
        pc, pb = reveal(c, circle), reveal(c, big)
        assert pc["Anna"] != "Bela" and pc["Bela"] != "Anna"
        seen_ab_in_big |= pb["Anna"] == "Bela" or pb["Bela"] == "Anna"
    assert seen_ab_in_big  # allowed (and happens) in the other draw

    # copying rules from another draw is explicit, and only adds
    ok(c.post(f"/api/years/{big}/exclusions", json={"a_id": ids["Csilla"], "b_id": ids["Dani"]}))
    assert ok(c.post(f"/api/years/{big}/exclusions/copy", json={"draw": circle}))["added"] == 1
    assert {(x["a_name"], x["b_name"]) for x in ok(c.get(f"/api/years/{big}/exclusions"))} == {("Anna", "Bela"), ("Csilla", "Dani")}
    assert c.post(f"/api/years/{big}/exclusions/copy", json={"draw": big}).status_code == 422
    ok(c.delete(f"/api/years/{big}/exclusions/{b}/{a}"))  # order doesn't matter
    assert len(ok(c.get(f"/api/years/{big}/exclusions"))) == 1

    # next year's "Circle" inherits Circle's rules only
    nxt = ok(c.post("/api/draws", json={"cal_year": 2027, "name": "Circle", "source": "previous"}))["year"]
    assert [(x["a_name"], x["b_name"]) for x in ok(c.get(f"/api/years/{nxt}/exclusions"))] == [("Anna", "Bela")]
    other = ok(c.post("/api/draws", json={"cal_year": 2027, "name": "New one", "source": "none"}))["year"]
    assert ok(c.get(f"/api/years/{other}/exclusions")) == []


def test_old_global_exclusions_are_migrated_into_every_draw(tmp_path, monkeypatch):
    import sqlite3
    monkeypatch.setenv("SANTA_DB", str(tmp_path / "m.db"))
    from app import db
    db.init()
    conn = sqlite3.connect(tmp_path / "m.db")
    conn.execute("INSERT INTO members (id, name, email, created_at) VALUES (1,'A','a@x.y',''),(2,'B','b@x.y','')")
    conn.execute("INSERT INTO years (year, cal_year, name, created_at) VALUES (2025, 2025, '', ''), (2026, 2026, '', '')")
    conn.execute("INSERT INTO exclusions (a_id, b_id) VALUES (1, 2)")  # a pre-upgrade global rule
    conn.commit()
    db.init()  # the next start migrates it
    assert sorted(conn.execute("SELECT year, a_id, b_id FROM draw_exclusions").fetchall()) == [(2025, 1, 2), (2026, 1, 2)]
    assert conn.execute("SELECT COUNT(*) FROM exclusions").fetchone()[0] == 0
    db.init()  # idempotent
    assert conn.execute("SELECT COUNT(*) FROM draw_exclusions").fetchone()[0] == 2


def test_guide_page_is_public(client):
    r = client.get("/guide")
    assert r.status_code == 200 and "Draw rules" in r.text and "Purpose and goal" in r.text


def test_log_names_the_draw_not_its_internal_id(fam):
    c, ids = fam
    d = ok(c.post("/api/draws", json={"cal_year": 2026, "name": "Cousins", "source": "everyone"}))["year"]
    assert d > 100000  # new draws get an internal id that means nothing to people
    ok(c.post(f"/api/years/{d}/draw", json={}))
    row = next(r for r in ok(c.get("/api/audit")) if r["action"] == "draw")
    assert row["detail"].startswith("2026 · Cousins:") and str(d) not in row["detail"]
