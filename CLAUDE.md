# Family Secret Santa / Pereputty Angyalkázás — rules for Claude

Family Secret Santa app (FastAPI + SQLite + vanilla JS). Deployed by the owner on Railway from `main`.

## Standing rules
- **Every change updates the docs, in both languages, in the same PR:**
  - `app/static/guide.html` (English) and `app/static/guide.hu.html` (Hungarian) — keep the same sections/ids
    (a test compares them);
  - `README.md`.
- **Admin panel is bilingual.** Every visible string in `app/static/app.js` goes through `t("English text", {vars})`
  and needs a Hungarian entry in `app/static/i18n.js` (`HU`). New server error messages (`HTTPException`),
  audit-log actions and theme option labels also need one. `tests/test_i18n.py` enforces this.
- **Don't rewrite the Hungarian participant texts** (e-mails in `app/mailer.py`, `app/static/participant.html`):
  they keep the "titkos Mikulás" / "a Mikulás" wording whatever the app is called.
- **App name per language:** "Family Secret Santa" in English, "Pereputty Angyalkázás" in Hungarian
  (admin panel via `t("Family Secret Santa")`, guide titles, README).
- Never show the internal draw id (e.g. 100002) to people; use the draw label (`_label` / `_draw_label`).
- Merge only when the owner says so.

## Checks
`python -m pytest -q` (all tests must pass).
