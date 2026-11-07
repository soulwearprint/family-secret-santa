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
