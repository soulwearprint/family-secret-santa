"use strict";
/* Pereputty Angyalkázás — vanilla JS front end. All data comes from /api.
   Every visible string goes through t() (see i18n.js), so the admin panel works in Hungarian and English. */

const $ = (sel, el = document) => el.querySelector(sel);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (iso) => (iso ? new Date(iso).toLocaleString(I18N.locale()) : "");

const state = { status: null, tab: "years", year: null, hashError: "", revealYear: null };
const LANG_LABEL = { hu: "🇭🇺 Magyar", en: "🇬🇧 English" };
const langSelect = (cur = "hu") => `<select name="lang">${Object.entries(LANG_LABEL)
  .map(([k, v]) => `<option value="${k}" ${k === cur ? "selected" : ""}>${v}</option>`).join("")}</select>`;
const googleBtn = (label, href = "/auth/google/start?purpose=login") =>
  `<a class="gbtn" href="${esc(href)}"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.2l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.4 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6.1C6.6 42.6 14.6 48 24 48z"/></svg>${esc(label)}</a>`;
const CANCEL = (extra = {}) => ({ label: t("Cancel"), value: "", cls: "secondary", ...extra });

try { state.tab = localStorage.getItem("santa.tab") || "years"; } catch (_) {}

async function api(path, opts = {}) {
  const res = await fetch(path, {
    method: opts.method || "GET",
    headers: opts.body ? { "Content-Type": "application/json" } : {},
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: "same-origin",
  });
  const data = res.headers.get("content-type")?.includes("json") ? await res.json() : await res.text();
  if (!res.ok) {
    if (res.status === 401 && !opts.noAuthRedirect) { await boot(); }
    const detail = data?.detail;
    throw new Error(Array.isArray(detail) ? detail.map((d) => d.msg).join("; ") : I18N.serverError(detail || res.statusText));
  }
  return data;
}

/* ── Dialog helper: resolves with {action, form} ───────────────────────── */
function dialog(bodyHtml, buttons) {
  const dlg = $("#dlg");
  $("#dlg-body").innerHTML = bodyHtml;
  $("#dlg-actions").innerHTML = buttons
    .map((b) => `<button value="${esc(b.value)}" class="${esc(b.cls || "")}" ${b.formnovalidate ? "formnovalidate" : ""}>${esc(b.label)}</button>`)
    .join("");
  dlg.returnValue = "";
  dlg.showModal();
  return new Promise((resolve) => {
    dlg.addEventListener("close", () => resolve({ action: dlg.returnValue, form: $("#dlg-form") }), { once: true });
  });
}
const alertBox = (html) => dialog(html, [{ label: t("OK"), value: "ok" }]);

/* ── Boot / auth screens ───────────────────────────────────────────────── */
function readHash() {
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.get("error")) state.hashError = h.get("error");
  if (h.get("reveal")) state.revealYear = +h.get("reveal");
  if (location.hash) history.replaceState(null, "", location.pathname);
}

async function boot() {
  I18N.applyStatic();
  readHash();
  state.status = await api("/api/status", { noAuthRedirect: true });
  const s = state.status;
  $("#who").innerHTML = s.logged_in
    ? `${t("Admin")}: <b>${esc(s.admin.name)}</b> &nbsp;<button class="small secondary" id="logout">${t("Log out")}</button>`
    : "";
  if (s.logged_in) $("#logout").onclick = async () => { await api("/api/logout", { method: "POST" }); boot(); };
  if (!s.setup_done) return renderSetup();
  if (!s.logged_in) return renderLogin();
  renderMain();
  if (state.hashError) { const m = I18N.serverError(state.hashError); state.hashError = ""; alertBox(`<p class="err">${esc(m)}</p>`); }
  if (state.revealYear) { const y = state.revealYear; state.revealYear = null; state.year = y; showReveal({}); }
}

function renderSetup() {
  $("#app").innerHTML = `
    <section class="card">
      <h2>${t("Welcome! Create the first admin")}</h2>
      <p class="muted">${t("The first admin is mandatory. Admins manage the participants, run the draws, send the postcards and — only if really needed — can unlock who drew whom (every unlock is logged). You can add up to 4 more admins later.")}</p>
      ${state.status.google_setup ? `<p>${googleBtn(t("Set up with Google"))}</p>
        <p class="hint">${t("Only the Google account set as SANTA_FIRST_ADMIN_EMAIL on the server can do this.")}</p>` : `
      <form id="f">
        <div class="row">
          <div><label>${t("Your name")}</label><input name="name" required maxlength="60"></div>
          <div><label>${t("Password (min. 6 characters)")}</label><input name="password" type="password" required minlength="6"></div>
          <button>${t("Create admin")}</button>
        </div>
        <p class="hint">${t("⚠️ There is no password reset: the matches are encrypted with the admins' passwords. Add a second admin later as a backup.")}</p>
      </form>`}
      <div class="err" id="err">${esc(I18N.serverError(state.hashError))}</div>
    </section>`;
  state.hashError = "";
  if ($("#f")) $("#f").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try { await api("/api/setup", { method: "POST", body: Object.fromEntries(fd) }); boot(); }
    catch (err) { $("#err").textContent = err.message; }
  };
}

function renderLogin() {
  $("#app").innerHTML = `
    <section class="card">
      <h2>${t("Admin login")}</h2>
      ${state.status.google_enabled ? `<p>${googleBtn(t("Sign in with Google"))}</p><p class="hint">${t("…or with a name and password:")}</p>` : ""}
      <form id="f">
        <div class="row">
          <div><label>${t("Admin name")}</label><input name="name" required autocomplete="username"></div>
          <div><label>${t("Password")}</label><input name="password" type="password" required autocomplete="current-password"></div>
          <button>${t("Log in")}</button>
        </div>
        <div class="err" id="err">${esc(I18N.serverError(state.hashError))}</div>
      </form>
    </section>`;
  state.hashError = "";
  $("#f").onsubmit = async (e) => {
    e.preventDefault();
    try { await api("/api/login", { method: "POST", body: Object.fromEntries(new FormData(e.target)), noAuthRedirect: true }); boot(); }
    catch (err) { $("#err").textContent = err.message; }
  };
}

/* ── Main shell ────────────────────────────────────────────────────────── */
const TABS = () => ({ years: t("🎁 Draws"), design: t("🎨 Card design"), family: t("👥 Participants"), admins: t("🔑 Admins"), log: t("📜 Log") });

function renderMain() {
  const modeBanner = state.status.mail_mode === "outbox"
    ? `<div class="banner info">${t("📭 <b>Outbox mode:</b> sending is not configured, so postcards are saved as .eml files in <code>data/outbox/</code> instead of being e-mailed. See README to set up sending.")}</div>` : "";
  $("#app").innerHTML = `${modeBanner}
    <nav class="tabs">${Object.entries(TABS()).map(([k, v]) =>
      `<button data-tab="${k}" class="${state.tab === k ? "active" : ""}">${v}</button>`).join("")}</nav>
    <div id="view"></div>`;
  document.querySelectorAll("nav.tabs button").forEach((b) => (b.onclick = () => {
    state.tab = b.dataset.tab;
    try { localStorage.setItem("santa.tab", state.tab); } catch (_) {}
    renderMain();
  }));
  ({ years: viewYears, design: viewDesign, family: viewFamily, admins: viewAdmins, log: viewLog })[state.tab]().catch((e) => {
    $("#view").innerHTML = `<p class="err">${esc(e.message)}</p>`;
  });
}

/* ── Participants ──────────────────────────────────────────────────────── */
// People without e-mail (small children, elderly) get a helper: their mail goes to the helper.
const helperSelect = (people, cur = null) => `<select name="helper_id"><option value="">${t("— none —")}</option>${people
  .filter((p) => p.email).map((p) => `<option value="${p.id}" ${p.id === cur ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select>`;
function memberBody(form) {
  const b = Object.fromEntries(new FormData(form));
  b.helper_id = b.helper_id ? +b.helper_id : null;
  return b;
}
async function viewFamily() {
  const [members, groups] = await Promise.all([api("/api/members"), api("/api/groups")]);
  const active = members.filter((m) => !m.archived), archived = members.filter((m) => m.archived);
  const rowHtml = (m) => `<tr>
      <td>${esc(m.name)}</td><td>${m.email ? esc(m.email)
        : `<span class="pill">${t("👋 via {name}", { name: esc(members.find((x) => x.id === m.helper_id)?.name || "?") })}</span>`}</td><td>${LANG_LABEL[m.lang] || ""}</td>
      <td style="text-align:right;white-space:nowrap">
        <button class="small secondary" data-edit="${m.id}">${m.archived ? t("Restore / edit") : t("Edit")}</button>
        ${m.archived ? "" : `<button class="small secondary" data-del="${m.id}">${t("Remove")}</button>`}
      </td></tr>`;
  $("#view").innerHTML = `
    <section class="card">
      <h2>${t("Participants")}</h2>
      <form id="add" class="row">
        <div><label>${t("Name")}</label><input name="name" required maxlength="80"></div>
        <div><label>${t("E-mail (only this person should read it)")}</label><input name="email" type="email" placeholder="${t("leave empty if they have none")}"></div>
        <div><label>${t("…or helper who gets their mail")}</label>${helperSelect(active)}</div>
        <div style="flex:0 1 140px"><label>${t("Postcard")}</label>${langSelect()}</div>
        <button>${t("Add")}</button>
      </form>
      <div class="err" id="err"></div>
      <table style="margin-top:14px"><thead><tr><th>${t("Name")}</th><th>${t("E-mail")}</th><th>${t("Postcard")}</th><th></th></tr></thead>
        <tbody>${active.map(rowHtml).join("") || `<tr><td colspan="4" class="muted">${t("Nobody yet.")}</td></tr>`}</tbody></table>
      ${archived.length ? `<h3 class="muted">${t("Archived (kept for past years)")}</h3>
        <table><tbody>${archived.map(rowHtml).join("")}</tbody></table>` : ""}
    </section>
    <section class="card">
      <h2>${t("💑 Never draw each other")}</h2>
      <p class="hint">${t("These rules are now set <b>per draw</b> (on each draw's page), so a pair can be excluded in one draw and allowed in another. People with a helper never draw their helper in any draw — otherwise the helper, who reads their postcard, would learn who their own Secret Santa is.")}</p>
    </section>`;
  // ── groups ──
  const nameOf = (id) => members.find((m) => m.id === id)?.name || "?";
  $("#view").insertAdjacentHTML("beforeend", `<section class="card">
      <h2>${t("👥 Groups")}</h2>
      <p class="hint">${t("Named lists of people you can start a draw from (e.g. “Family circle”, “Cousins”). Anyone can be in any number of groups.")}</p>
      <table><tbody>${groups.map((g) => `<tr><td><b>${esc(g.name)}</b> <span class="muted">(${g.member_ids.length})</span><br>
        <span class="hint">${g.member_ids.map((i) => esc(nameOf(i))).join(", ") || t("empty")}</span></td>
        <td style="text-align:right;white-space:nowrap"><button class="small secondary" data-gedit="${g.id}">${t("Edit")}</button>
        <button class="small secondary" data-gdel="${g.id}">${t("Delete")}</button></td></tr>`).join("")
        || `<tr><td class="muted">${t("No groups yet.")}</td></tr>`}</tbody></table>
      <div class="actions"><button class="secondary" id="gnew">${t("＋ New group")}</button></div>
    </section>`);
  const groupDialog = async (g) => {
    const r = await dialog(`<h2>${g ? t("Edit group") : t("New group")}</h2>
      <label>${t("Name")}</label><input name="gname" value="${esc(g?.name || "")}" maxlength="60" required>
      <label>${t("Members")}</label><div class="checks">${active.map((m) => `<label><input type="checkbox" name="gm" value="${m.id}"
        ${g?.member_ids.includes(m.id) ? "checked" : ""}> ${esc(m.name)}</label>`).join("")}</div>`,
      [CANCEL({ formnovalidate: true }), { label: t("Save"), value: "save" }]);
    if (r.action !== "save") return;
    const body = { name: r.form.elements.gname.value, member_ids: [...r.form.querySelectorAll("input[name=gm]:checked")].map((i) => +i.value) };
    try { await api(g ? `/api/groups/${g.id}` : "/api/groups", { method: g ? "PUT" : "POST", body }); }
    catch (err) { await alertBox(`<p class="err">${esc(err.message)}</p>`); }
    viewFamily();
  };
  $("#gnew").onclick = () => groupDialog(null);
  document.querySelectorAll("[data-gedit]").forEach((b) => (b.onclick = () => groupDialog(groups.find((g) => g.id === +b.dataset.gedit))));
  document.querySelectorAll("[data-gdel]").forEach((b) => (b.onclick = async () => {
    const g = groups.find((x) => x.id === +b.dataset.gdel);
    const r = await dialog(`<h2>${t("Delete group “{name}”?", { name: esc(g.name) })}</h2><p>${t("Draws already created from it keep their people.")}</p>`,
      [CANCEL(), { label: t("Delete"), value: "del" }]);
    if (r.action === "del") { await api(`/api/groups/${g.id}`, { method: "DELETE" }); viewFamily(); }
  }));
  $("#add").onsubmit = async (e) => {
    e.preventDefault();
    try { await api("/api/members", { method: "POST", body: memberBody(e.target) }); viewFamily(); }
    catch (err) { $("#err").textContent = err.message; }
  };
  document.querySelectorAll("[data-edit]").forEach((b) => (b.onclick = async () => {
    const m = members.find((x) => x.id == b.dataset.edit);
    const r = await dialog(`<h2>${t("Edit {name}", { name: esc(m.name) })}</h2>
      <label>${t("Name")}</label><input name="name" value="${esc(m.name)}" required>
      <label>${t("E-mail (empty if they have none)")}</label><input name="email" type="email" value="${esc(m.email)}">
      <label>${t("Helper who gets their mail (only used without e-mail)")}</label>${helperSelect(active.filter((x) => x.id !== m.id), m.helper_id)}
      <label>${t("Postcard language")}</label>${langSelect(m.lang)}`,
      [CANCEL({ formnovalidate: true }), { label: t("Save"), value: "save" }]);
    if (r.action !== "save") return;
    try { await api(`/api/members/${m.id}`, { method: "PUT", body: memberBody(r.form) }); }
    catch (err) { await alertBox(`<p class="err">${esc(err.message)}</p>`); }
    viewFamily();
  }));
  document.querySelectorAll("[data-del]").forEach((b) => (b.onclick = async () => {
    const m = members.find((x) => x.id == b.dataset.del);
    const r = await dialog(`<h2>${t("Remove {name}?", { name: esc(m.name) })}</h2><p>${t("If they took part in a past year they are archived (history is kept) and won't be added to new years. This does not change any existing draw — remove them from a draw's participant list for that.")}</p>`,
      [CANCEL(), { label: t("Remove"), value: "del" }]);
    if (r.action === "del") { await api(`/api/members/${m.id}`, { method: "DELETE" }); viewFamily(); }
  }));
}

/* ── Admins ────────────────────────────────────────────────────────────── */
async function viewAdmins() {
  const admins = await api("/api/admins");
  $("#view").innerHTML = `
    <section class="card">
      <h2>${t("Admins ({n}/5)", { n: admins.length })}</h2>
      <p class="muted">${t("Admins can manage everything and unlock the matches. Admin #1 is permanent. Each unlock is recorded in the log, so everyone can see if somebody peeked.")}</p>
      <table><thead><tr><th>#</th><th>${t("Name")}</th><th>${t("Signs in with")}</th><th></th></tr></thead><tbody>
        ${admins.map((a) => `<tr><td>${a.slot}</td><td>${esc(a.name)}${a.slot === 1 ? ` <span class="pill">${t("mandatory")}</span>` : ""}</td>
          <td>${a.google_email ? `<span class="pill ok">Google: ${esc(a.google_email)}</span> ` : ""}${a.has_password ? `<span class="pill">${t("password")}</span>` : ""}</td>
          <td style="text-align:right;white-space:nowrap"><button class="small secondary" data-google="${a.id}">${t("Google e-mail")}</button>
            ${a.slot === 1 ? "" : `<button class="small secondary" data-del="${a.id}">${t("Remove")}</button>`}</td></tr>`).join("")}
      </tbody></table>
      ${admins.length < 5 ? `<h3>${t("Add an admin")}</h3>
        <form id="add" class="row">
          <div><label>${t("Name")}</label><input name="name" required maxlength="60"></div>
          <div><label>${state.status.google_enabled ? t("Google e-mail") : t("Google e-mail (Google sign-in not configured)")}</label><input name="google_email" type="email" placeholder="name@gmail.com"></div>
          <div><label>${t("…and/or initial password")}</label><input name="password" type="password" minlength="6"></div>
          <button>${t("Add admin")}</button>
        </form>
        <p class="hint">${t("Fill in at least one. With Google, the admin just signs in with that Google account — no password to share.")}</p>` : ""}
      <div class="err" id="err"></div>
    </section>
    <section class="card">
      <h2>${state.status.admin.has_password ? t("Change my password") : t("Set a backup password")}</h2>
      <form id="pw" class="row">
        ${state.status.admin.has_password ? `<div><label>${t("Current password")}</label><input name="current" type="password" required></div>` : ""}
        <div><label>${t("New password")}</label><input name="new" type="password" minlength="6" required></div>
        <button>${t("Change")}</button>
      </form>
      <div id="pwmsg" class="hint"></div>
    </section>`;
  if ($("#add")) $("#add").onsubmit = async (e) => {
    e.preventDefault();
    try { await api("/api/admins", { method: "POST", body: Object.fromEntries(new FormData(e.target)) }); viewAdmins(); }
    catch (err) { $("#err").textContent = err.message; }
  };
  $("#pw").onsubmit = async (e) => {
    e.preventDefault();
    try { await api("/api/admins/me/password", { method: "POST", body: Object.fromEntries(new FormData(e.target)) });
      e.target.reset(); $("#pwmsg").textContent = t("Password saved."); state.status = await api("/api/status"); }
    catch (err) { $("#pwmsg").textContent = err.message; }
  };
  document.querySelectorAll("[data-google]").forEach((b) => (b.onclick = async () => {
    const a = admins.find((x) => x.id == b.dataset.google);
    const r = await dialog(`<h2>${t("Google account for {name}", { name: esc(a.name) })}</h2>
      <label>${t("Google e-mail (empty = remove)")}</label><input name="google_email" type="email" value="${esc(a.google_email)}">`,
      [CANCEL({ formnovalidate: true }), { label: t("Save"), value: "save" }]);
    if (r.action !== "save") return;
    try { await api(`/api/admins/${a.id}/google`, { method: "PUT", body: { google_email: r.form.elements.google_email.value } }); }
    catch (err) { await alertBox(`<p class="err">${esc(err.message)}</p>`); }
    viewAdmins();
  }));
  document.querySelectorAll("[data-del]").forEach((b) => (b.onclick = async () => {
    const r = await dialog(`<h2>${t("Remove this admin?")}</h2>`, [CANCEL(), { label: t("Remove"), value: "del" }]);
    if (r.action === "del") { await api(`/api/admins/${b.dataset.del}`, { method: "DELETE" }); viewAdmins(); }
  }));
}

/* ── Log ───────────────────────────────────────────────────────────────── */
async function viewLog() {
  const rows = await api("/api/audit");
  $("#view").innerHTML = `<section class="card"><h2>${t("Activity log")}</h2>
    <table><thead><tr><th>${t("When")}</th><th>${t("Admin")}</th><th>${t("What")}</th></tr></thead><tbody>
    ${rows.map((r) => `<tr><td class="muted" style="white-space:nowrap">${fmt(r.at)}</td><td>${esc(r.admin_name)}</td>
      <td>${r.action === "MATCHES REVEALED" ? `<span class="pill bad">🔓 ${esc(t(r.action))}</span>` : esc(t(r.action))}
      <span class="muted">${esc(r.detail)}</span></td></tr>`).join("")}
    </tbody></table></section>`;
}

/* ── Draws ─────────────────────────────────────────────────────────────── */
async function viewYears() {
  const [years, groups] = await Promise.all([api("/api/years"), api("/api/groups")]);
  const thisYear = new Date().getFullYear();
  if (!state.year || !years.some((y) => y.year === state.year)) state.year = years[0]?.year ?? null;
  $("#view").innerHTML = `
    <section class="card">
      <div class="row">
        <div><label>${t("Draw")}</label>
          <select id="ysel">${years.map((y) => `<option value="${y.year}" ${y.year === state.year ? "selected" : ""}>
            ${esc(y.label)} — ${t("{n} people", { n: y.participants })}${y.drawn ? (y.in_sync ? t(" · drawn") : t(" · ⚠ list changed")) : ""}</option>`).join("")
            || `<option>${t("No draws yet")}</option>`}</select></div>
        <div style="flex:0 0 auto"><button class="secondary" id="newdraw">${t("＋ New draw")}</button></div>
      </div>
      <p class="hint">${t("Run as many draws side by side as you like, e.g. a small family circle, everyone, and a random few. Each has its own people, budget, design and postcards; someone in two draws gets two cards.")}</p>
      <div class="err" id="err"></div>
    </section>
    <div id="year"></div>`;
  $("#ysel").onchange = (e) => { state.year = +e.target.value; renderYear(); };
  $("#newdraw").onclick = async () => {
    const r = await dialog(`<h2>${t("New draw")}</h2>
      <div class="row">
        <div><label>${t("Year")}</label><input name="cal_year" type="number" min="2000" max="2200" value="${thisYear}" required></div>
        <div style="flex:2 1 200px"><label>${t("Name (e.g. Family circle, Everyone)")}</label><input name="name" maxlength="60"
          placeholder="${t("leave empty for the main draw")}"></div>
      </div>
      <label>${t("Who takes part")}</label>
      <select name="source" id="nsrc">
        <option value="previous">${t("Same people as last year's draw with this name")}</option>
        <option value="everyone">${t("All participants")}</option>
        ${groups.length ? `<option value="group">${t("A group…")}</option>` : ""}
        <option value="random">${t("A random set of people…")}</option>
        <option value="none">${t("Nobody yet (I'll tick them)")}</option>
      </select>
      <div class="row" id="nextra" hidden>
        <div id="ngroupw"><label>${t("Group")}</label><select name="group_id">
          <option value="" data-any>${t("Everyone")}</option>${groups.map((g) => `<option value="${g.id}">${esc(g.name)} (${g.member_ids.length})</option>`).join("")}</select></div>
        <div id="ncountw"><label>${t("How many people")}</label><input name="count" type="number" min="2" value="5"></div>
      </div>
      <p class="hint">${t("Budget, rules and card design start from last year's draw with the same name. You can change the list afterwards.")}</p>`,
      [CANCEL({ formnovalidate: true }), { label: t("Create draw"), value: "go" }]);
    // (the dialog is already closed here; the listeners below are set before it closes)
    if (r.action !== "go") return;
    const f = r.form.elements;
    const body = { cal_year: +f.cal_year.value, name: f.name.value, source: f.source.value,
      group_id: f.group_id.value ? +f.group_id.value : null, count: +f.count.value || 0 };
    try { const res = await api("/api/draws", { method: "POST", body }); state.year = res.year; viewYears(); }
    catch (err) { $("#err").textContent = err.message; }
  };
  if (state.year) renderYear();
}

// show/hide the group + count fields of the "New draw" dialog
document.addEventListener("change", (e) => {
  if (e.target.id !== "nsrc") return;
  const v = e.target.value;
  $("#nextra").hidden = !(v === "group" || v === "random");
  $("#ncountw").hidden = v !== "random";
  const any = document.querySelector("#ngroupw [data-any]");
  if (any) any.hidden = v === "group";
  if (v === "group" && any && any.selected) any.nextElementSibling && (any.nextElementSibling.selected = true);
});

async function renderYear() {
  const [y, members, digest, fixed, groups, excl, allDraws] = await Promise.all([api(`/api/years/${state.year}`), api("/api/members"),
    api("/api/digest"), api(`/api/years/${state.year}/fixed`), api("/api/groups"), api(`/api/years/${state.year}/exclusions`),
    api("/api/years")]);
  const otherDraws = allDraws.filter((d) => d.year !== state.year);
  state.label = y.label;
  const inYear = new Set(y.participants.map((p) => p.id));
  const choosable = members.filter((m) => !m.archived || inYear.has(m.id));
  const pending = y.participants.filter((p) => p.has_match && !p.notified_at).length;
  const names = (list) => `<b>${list.map((p) => esc(p.name)).join(", ")}</b>`;

  let statusHtml;
  const uninvited = y.participants.filter((p) => !p.invited && !p.notified_at).length;
  const invitedN = y.participants.filter((p) => p.invited).length;
  const ideasN = y.participants.filter((p) => p.wishes).length;
  if (!y.drawn) {
    statusHtml = `<div class="banner info">${t("Names have not been drawn yet for {label}.", { label: esc(y.label) })}
      ${invitedN ? `<br>${t("✉️ {invited} of {total} invited to add gift ideas · 🎁 {ideas} have added some.", { invited: invitedN, total: y.participants.length, ideas: ideasN })}` : ""}</div>
      <p class="hint">${t("Tip: invite everyone to add gift ideas first, so the postcards can already list their giftee's ideas. Set the gift budget below before inviting — it is shown in the invitation.")}</p>
      <div class="actions">
        <button id="invite" class="secondary" ${uninvited ? "" : "disabled"}>${t("✉️ Send wish-list invitations ({n})", { n: uninvited })}</button>
        <button id="draw" ${y.participants.length < 2 ? "disabled" : ""}>${t("🎲 Draw names for {n} people", { n: y.participants.length })}</button>
      </div>`;
  } else if (!y.in_sync) {
    statusHtml = `<div class="banner">${t("⚠ The participant list changed after the draw.")}
      ${y.added.length ? `<br>${t("Joined: {names}", { names: names(y.added) })}` : ""}
      ${y.removed.length ? `<br>${t("Left: {names}", { names: names(y.removed) })}` : ""}
      <br>${t("Choose who should be reshuffled before sending postcards.")}</div>
      <button id="reshuffle">${t("Choose who to reshuffle…")}</button>`;
  } else {
    statusHtml = `<div class="banner info">${t("✅ Names are drawn and secret.")} ${pending ? t("{n} postcard(s) not sent yet.", { n: pending }) : t("All postcards sent.")}</div>
      <div class="actions">
        <button id="sendall" ${pending ? "" : "disabled"}>${t("📮 Send {n} pending postcard(s)", { n: pending })}</button>
        <button id="reshuffle" class="secondary">${t("Reshuffle…")}</button>
        <button id="reveal" class="secondary">${t("🔓 Unlock matches")}</button>
      </div>`;
  }

  $("#year").innerHTML = `
    <section class="card">
      <h2>🎄 ${esc(y.label)}</h2>
      ${statusHtml}
    </section>

    <section class="card">
      <h2>${t("💑 Never draw each other")}</h2>
      <p class="hint">${t("Rules for <b>this draw only</b> — they don't affect your other draws. Works both ways. Last year's draw with the same name passes its rules on to a new one. A rule added after the draw applies at the next reshuffle.")}</p>
      <form id="excl" class="row">
        <div><label>${t("Person")}</label><select name="a">${y.participants.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></div>
        <div><label>${t("and")}</label><select name="b">${y.participants.map((p, i) => `<option value="${p.id}" ${i === 1 ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></div>
        <button class="secondary">${t("Add rule")}</button>
      </form>
      <div class="err" id="exerr"></div>
      <table style="margin-top:8px"><tbody>${excl.map((x) => `<tr><td>${esc(x.a_name)} ↔ ${esc(x.b_name)}</td>
        <td style="text-align:right"><button class="small secondary" data-unex="${x.a_id}-${x.b_id}">${t("Remove")}</button></td></tr>`).join("")
        || `<tr><td class="muted">${t("No rules in this draw.")}</td></tr>`}</tbody></table>
      ${otherDraws.length ? `<div class="row" style="margin-top:10px"><div><label>${t("Copy rules from another draw")}</label>
        <select id="excopy">${otherDraws.map((d) => `<option value="${d.year}">${esc(d.label)}</option>`).join("")}</select></div>
        <div style="flex:0 0 auto"><button class="small secondary" type="button" id="excopybtn">${t("Copy")}</button></div></div>` : ""}
    </section>

    <section class="card">
      <h2>${t("📌 Fixed pairs")}</h2>
      <p class="hint">${t("Set by hand before the random draw, e.g. Grandma gives to little Peti. Everyone else is drawn randomly. Fixed pairs are visible to all admins and win over every other rule. Adding one after the draw applies at the next reshuffle.")}</p>
      <form id="fixed" class="row">
        <div><label>${t("Gives")}</label><select name="g">${y.participants.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></div>
        <div><label>${t("to")}</label><select name="r">${y.participants.map((p, i) => `<option value="${p.id}" ${i === 1 ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></div>
        <button class="secondary">${t("Add fixed pair")}</button>
      </form>
      <div class="err" id="fxerr"></div>
      <table style="margin-top:8px"><tbody>${fixed.map((f) => `<tr><td>${esc(f.giver)} → ${esc(f.receiver)}</td>
        <td style="text-align:right"><button class="small secondary" data-unfix="${f.giver_id}">${t("Remove")}</button></td></tr>`).join("")
        || `<tr><td class="muted">${t("No fixed pairs.")}</td></tr>`}</tbody></table>
    </section>

    <section class="card">
      <h2>${t("Who takes part?")}</h2>
      ${groups.length ? `<div class="row" style="margin-bottom:10px"><div><label>${t("Quick add a group")}</label>
        <select id="addgroup"><option value="">${t("— choose —")}</option>${groups.map((g) => `<option value="${g.id}">${esc(g.name)}</option>`).join("")}</select></div>
        <div style="flex:0 0 auto"><button class="small secondary" type="button" id="addgroupbtn">${t("Tick its members")}</button></div></div>` : ""}
      <form id="parts">
        <div class="checks">${choosable.map((m) => `<label><input type="checkbox" name="m" value="${m.id}" ${inYear.has(m.id) ? "checked" : ""}>
          ${esc(m.name)}</label>`).join("") || `<span class="muted">${t("Add people in the Participants tab first.")}</span>`}</div>
        <div class="actions"><button class="secondary">${t("Save participant list")}</button></div>
      </form>
    </section>

    <section class="card">
      <h2>${t("🎁 Gift ideas")}</h2>
      <p class="hint">${t("You can edit anyone's ideas, e.g. for small children or grandparents. The same rules apply as on their own page: ideas not yet sent to their Secret Santa can be removed; sent ones can only be marked “no longer wanted”. Changes go into the daily digest.")}</p>
      <div class="checks">${y.participants.map((p) => `<label style="justify-content:space-between">
        <span>${esc(p.name)} <span class="muted">${p.wishes ? `· 🎁 ${p.wishes}` : ""}</span></span>
        <button type="button" class="small secondary" data-wedit="${p.id}">${t("✏️ Edit")}</button></label>`).join("")
        || `<span class="muted">${t("Nobody in this draw yet.")}</span>`}</div>
    </section>

    ${y.drawn ? `<section class="card">
      <h2>${t("Postcards")}</h2>
      <p class="hint">${t("Each person gets their own e-mail; nobody else is in To/CC/BCC. The admin sending them never sees the content. Each card links to a private page where the person adds gift ideas, sees their giftee's ideas and can switch language. Resending a card replaces its link. Changes to gift ideas reach each Secret Santa in one daily digest e-mail (around {hour}:00, {tz}).", { hour: digest.hour, tz: esc(digest.tz) })}</p>
      <p class="hint">${t("📬 {n} wish-list update(s) waiting for the next digest", { n: digest.pending })}
        ${digest.pending ? `<button class="small secondary" id="digestnow">${t("Send digest now")}</button>` : ""}</p>
      <table><thead><tr><th>${t("Name")}</th><th>${t("Status")}</th><th>${t("Gift ideas")}</th><th></th></tr></thead><tbody>
      ${y.participants.map((p) => `<tr><td>${esc(p.name)}</td>
        <td>${!p.has_match ? `<span class="pill bad">${t("not in draw")}</span>`
          : p.notified_at ? `<span class="pill ok">${t("sent {when}", { when: fmt(p.notified_at) })}</span>` : `<span class="pill wait">${t("not sent")}</span>`}</td>
        <td>${p.wishes ? `🎁 ${p.wishes}` : '<span class="muted">—</span>'}</td>
        <td style="text-align:right">${p.has_match && y.in_sync ? `<button class="small secondary" data-send="${p.id}">${p.notified_at ? t("Resend") : t("Send")}</button>` : ""}</td></tr>`).join("")}
      </tbody></table>
      <p class="hint">${t("Preview the postcard (sample names only):")}
        <a href="/api/postcard/preview?lang=hu" target="_blank" rel="noopener">magyar</a> ·
        <a href="/api/postcard/preview?lang=en" target="_blank" rel="noopener">English</a></p>
    </section>` : ""}

    <section class="card">
      <h2>${t("Details on the postcard")}</h2>
      <form id="details">
        <label>${t("Draw name (shown on the cards; empty for the main draw)")}</label>
        <input name="name" value="${esc(y.name)}" maxlength="60">
        <div class="row">
          <div><label>${t("Gift budget")}</label><input name="budget" value="${esc(y.budget)}" placeholder="${t("e.g. €30")}"></div>
          <div><label>${t("Gift exchange")}</label><input name="exchange_date" value="${esc(y.exchange_date)}" placeholder="${t("e.g. 24 Dec, at Grandma's")}"></div>
        </div>
        <label>${t("Extra note from Santa (optional, shown as written)")}</label><textarea name="note" rows="2" maxlength="600">${esc(y.note)}</textarea>
        <label style="display:flex;gap:8px;align-items:center;color:inherit;margin-top:10px">
          <input type="checkbox" name="avoid_repeat" style="width:auto" ${y.avoid_repeat ? "checked" : ""}>
          ${t("Nobody draws the same person as in last year's “{name}” draw", { name: esc(y.name || t("main")) })}</label>
        <label style="display:flex;gap:8px;align-items:center;color:inherit;margin-top:6px">
          <input type="checkbox" name="avoid_parallel" style="width:auto" ${y.avoid_parallel ? "checked" : ""}>
          ${t("Nobody draws the same person as in another {year} draw", { year: y.cal_year })}</label>
        <p class="hint">${t("Rules apply to the next draw or reshuffle. “Never draw each other” pairs for this draw are further up.")}</p>
        <div class="actions"><button class="secondary">${t("Save details")}</button><span id="dmsg" class="hint"></span></div>
      </form>
      <p class="hint" style="margin-top:14px"><button class="small secondary" id="dely">${t("Delete this draw")}</button></p>
    </section>`;

  $("#details").onsubmit = async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    body.avoid_repeat = e.target.elements.avoid_repeat.checked;
    body.avoid_parallel = e.target.elements.avoid_parallel.checked;
    try { await api(`/api/years/${y.year}`, { method: "PUT", body }); }
    catch (err) { $("#dmsg").textContent = err.message; return; }
    $("#dmsg").textContent = t("Saved.");
    if (body.name !== y.name) viewYears();
  };
  if ($("#addgroupbtn")) $("#addgroupbtn").onclick = () => {
    const g = groups.find((x) => x.id === +$("#addgroup").value);
    if (!g) return;
    document.querySelectorAll("#parts input[name=m]").forEach((i) => { if (g.member_ids.includes(+i.value)) i.checked = true; });
  };
  document.querySelectorAll("[data-wedit]").forEach((b) => (b.onclick = () => wishEditor(y, +b.dataset.wedit)));
  $("#excl").onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    try { await api(`/api/years/${y.year}/exclusions`, { method: "POST", body: { a_id: +f.get("a"), b_id: +f.get("b") } }); renderYear(); }
    catch (err) { $("#exerr").textContent = err.message; }
  };
  document.querySelectorAll("[data-unex]").forEach((b) => (b.onclick = async () => {
    const [a, c] = b.dataset.unex.split("-");
    await api(`/api/years/${y.year}/exclusions/${a}/${c}`, { method: "DELETE" }); renderYear();
  }));
  if ($("#excopybtn")) $("#excopybtn").onclick = async () => {
    try {
      const res = await api(`/api/years/${y.year}/exclusions/copy`, { method: "POST", body: { draw: +$("#excopy").value } });
      await renderYear();
      $("#exerr").innerHTML = `<span class="ok" style="color:var(--green)">${t("✓ {n} rule(s) added.", { n: res.added })}</span>`;
    } catch (err) { $("#exerr").textContent = err.message; }
  };
  $("#parts").onsubmit = async (e) => {
    e.preventDefault();
    const ids = [...e.target.querySelectorAll("input[name=m]:checked")].map((i) => +i.value);
    const res = await api(`/api/years/${y.year}/participants`, { method: "PUT", body: { member_ids: ids } });
    await viewYears();
    if (res.needs_reshuffle) await reshuffleDialog();
  };
  $("#dely").onclick = async () => {
    const r = await dialog(`<h2>${t("Delete {label}?", { label: esc(y.label) })}</h2><p>${t("This removes its participant list, matches and gift ideas. It cannot be undone.")}</p>`,
      [CANCEL(), { label: t("Delete"), value: "del" }]);
    if (r.action === "del") { await api(`/api/years/${y.year}`, { method: "DELETE" }); state.year = null; viewYears(); }
  };
  if ($("#draw")) $("#draw").onclick = async () => {
    const r = await dialog(`<h2>${t("Draw names for {label}?", { label: esc(y.label) })}</h2><p>${t("Everyone in the list ({n} people) gets exactly one giftee, never themselves. Nobody — including you — will see the result.", { n: y.participants.length })}</p>`,
      [CANCEL(), { label: t("🎲 Draw"), value: "go" }]);
    if (r.action !== "go") return;
    try { await api(`/api/years/${y.year}/draw`, { method: "POST", body: {} }); }
    catch (err) { return alertBox(`<p class="err">${esc(err.message)}</p>`); }
    await viewYears();
    await offerSend(t("Names drawn! 🎉"));
  };
  if ($("#reshuffle")) $("#reshuffle").onclick = reshuffleDialog;
  $("#fixed").onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    try { await api(`/api/years/${y.year}/fixed`, { method: "POST", body: { giver_id: +f.get("g"), receiver_id: +f.get("r") } }); renderYear(); }
    catch (err) { $("#fxerr").textContent = err.message; }
  };
  document.querySelectorAll("[data-unfix]").forEach((b) => (b.onclick = async () => {
    await api(`/api/years/${y.year}/fixed/${b.dataset.unfix}`, { method: "DELETE" }); renderYear();
  }));
  if ($("#digestnow")) $("#digestnow").onclick = async () => {
    const res = await api("/api/digest/run", { method: "POST" });
    await alertBox(`<h2>${res.mode === "outbox" ? t("📬 Digest saved to outbox") : t("📬 Digest sent")}</h2><p>${t("{n} e-mail(s)", { n: res.sent })}${res.failed ? `, <span class="err">${t("{n} failed", { n: res.failed })}</span>` : ""}.</p>`);
    renderYear();
  };
  if ($("#invite")) $("#invite").onclick = async () => {
    const r = await dialog(`<h2>${t("Send wish-list invitations?")}</h2>
      <p>${t("{n} people get an e-mail with a private link where they can add gift ideas (optional).", { n: uninvited })}
      ${y.budget ? t("The e-mail shows the gift budget (<b>{budget}</b>).", { budget: esc(y.budget) }) : t("The e-mail shows the gift budget — none is set yet.")}
      ${t("Nothing is drawn yet.")}</p>`,
      [CANCEL(), { label: t("✉️ Send"), value: "go" }]);
    if (r.action !== "go") return;
    let res;
    try { res = await api(`/api/years/${y.year}/invite`, { method: "POST", body: {} }); }
    catch (err) { return alertBox(`<p class="err">${esc(err.message)}</p>`); }
    const bad = res.results.filter((x) => !x.ok);
    await alertBox(`<h2>${res.mode === "outbox" ? t("📭 Saved to outbox") : t("✉️ Invitations sent")}</h2>
      ${sentSummary(res.mode, res.results.length - bad.length, bad)}`);
    renderYear();
  };
  if ($("#sendall")) $("#sendall").onclick = () => sendPostcards(null);
  if ($("#reveal")) $("#reveal").onclick = revealDialog;
  document.querySelectorAll("[data-send]").forEach((b) => (b.onclick = () => sendPostcards([+b.dataset.send])));
}

// "3 sent, 1 failed." plus one line per failure
const sentSummary = (mode, okCount, bad) =>
  `<p>${mode === "outbox" ? t("{n} saved", { n: okCount }) : t("{n} sent", { n: okCount })}${bad.length ? `, <span class="err">${t("{n} failed", { n: bad.length })}</span>` : ""}.</p>
   ${bad.map((b) => `<p class="err">${esc(b.name)}: ${esc(I18N.serverError(b.error))}</p>`).join("")}`;

async function reshuffleDialog() {
  const y = await api(`/api/years/${state.year}`);
  const added = new Set(y.added.map((p) => p.id));
  const others = y.participants.filter((p) => !added.has(p.id));
  const names = (list) => `<b>${list.map((p) => esc(p.name)).join(", ")}</b>`;
  const r = await dialog(`
    <h2>${t("Who should be reshuffled?")}</h2>
    ${y.added.length || y.removed.length ? `<div class="banner">
      ${y.added.length ? `${t("Joined: {names} — always included.", { names: names(y.added) })}<br>` : ""}
      ${y.removed.length ? t("Left: {names} — whoever was giving to them must get a new giftee. They are included automatically <b>without being shown</b>, mixed with a few random people, so nobody can work out who had whom.", { names: names(y.removed) }) : ""}</div>` : ""}
    <label style="display:flex;gap:8px;align-items:center;color:inherit;margin:10px 0">
      <input type="checkbox" name="everyone" style="width:auto"> ${t("<b>Reshuffle everyone</b> (completely new draw)")}</label>
    <p class="hint">${t("…or tick the people who should get a new giftee. Everyone else keeps theirs (useful if gifts are already bought).")}</p>
    <div class="checks" id="rs-checks">
      ${y.added.map((p) => `<label><input type="checkbox" checked disabled> ${esc(p.name)} <span class="pill">${t("new")}</span></label>`).join("")}
      ${others.map((p) => `<label><input type="checkbox" name="sel" value="${p.id}"> ${esc(p.name)}</label>`).join("")}
    </div>
    <p class="hint">${t("Everyone who is reshuffled gets a fresh postcard (even if they happen to draw the same person again).")}</p>`,
    [CANCEL(), { label: t("Reshuffle"), value: "go" }]);
  if (r.action !== "go") return;
  const everyone = r.form.elements.everyone.checked;
  const selected_ids = [...r.form.querySelectorAll("input[name=sel]:checked")].map((i) => +i.value);
  let res;
  try { res = await api(`/api/years/${state.year}/draw`, { method: "POST", body: { everyone, selected_ids, confirm: true } }); }
  catch (err) { return alertBox(`<p class="err">${esc(err.message)}</p>`); }
  await viewYears();
  await offerSend(t("Reshuffled {a} of {b} people", { a: res.reshuffled, b: res.total })
    + (res.hidden_count ? t(" (including {n} not shown, for secrecy)", { n: res.hidden_count }) : "") + ".");
}

async function offerSend(headline) {
  const y = await api(`/api/years/${state.year}`);
  const pending = y.participants.filter((p) => p.has_match && !p.notified_at).length;
  if (!pending) return alertBox(`<h2>${esc(headline)}</h2>`);
  const r = await dialog(`<h2>${esc(headline)}</h2><p>${t("{n} postcard(s) are ready. Send them now?", { n: pending })}</p>`,
    [{ label: t("Later"), value: "", cls: "secondary" }, { label: t("📮 Send {n}", { n: pending }), value: "send" }]);
  if (r.action === "send") await sendPostcards(null);
}

async function sendPostcards(ids) {
  let res;
  try { res = await api(`/api/years/${state.year}/notify`, { method: "POST", body: { member_ids: ids } }); }
  catch (err) { return alertBox(`<p class="err">${esc(err.message)}</p>`); }
  const ok = res.results.filter((x) => x.ok), bad = res.results.filter((x) => !x.ok);
  await alertBox(`<h2>${res.mode === "outbox" ? t("📭 Saved to outbox") : t("📮 Postcards sent")}</h2>
    ${sentSummary(res.mode, ok.length, bad)}`);
  renderYear();
}

async function revealDialog() {
  const me = state.status.admin;
  const canGoogle = state.status.google_enabled && me.google_email;
  const r = await dialog(`<h2>${t("🔓 Unlock the matches for {label}?", { label: esc(state.label || t("this draw")) })}</h2>
    <p>${t("This shows who drew whom — the secret is spoiled for you. It is recorded in the log, visible to all admins.")}</p>
    ${canGoogle ? `<p>${googleBtn(t("Confirm with Google"), `/auth/google/start?purpose=reveal&year=${state.year}`)}</p>` : ""}
    ${me.has_password ? `<label>${canGoogle ? t("…or re-enter your password") : t("Re-enter your password")}</label>
      <input name="password" type="password" ${canGoogle ? "" : "required"} autocomplete="current-password">` : ""}`,
    [CANCEL({ formnovalidate: true }), ...(me.has_password ? [{ label: t("Unlock"), value: "go" }] : [])]);
  if (r.action !== "go") return;
  await showReveal({ password: r.form.elements.password.value });
}

async function showReveal(body) {
  let pairs;
  try { pairs = await api(`/api/years/${state.year}/reveal`, { method: "POST", body }); }
  catch (err) { return alertBox(`<p class="err">${esc(err.message)}</p>`); }
  await alertBox(`<h2>${t("Matches · {label}", { label: esc(state.label || t("this draw")) })}</h2>
    <table class="reveal"><thead><tr><th>${t("Secret Santa")}</th><th>${t("gives to")}</th></tr></thead><tbody>
    ${pairs.map((p) => `<tr><td>${esc(p.giver)}</td><td>${esc(p.receiver)}</td></tr>`).join("")}</tbody></table>`);
}


/* ── Card design studio ─────────────────────────────────────────────────── */
// Mix and match a base theme, accent colour, font, animal and decorations for a
// draw, with a live preview of every e-mail and of the personal page.
const design = { opts: null, theme: null, saved: null, kind: "postcard", lang: "hu", timer: null };

async function viewDesign() {
  const years = await api("/api/years");
  if (!years.length) {
    $("#view").innerHTML = `<section class="card"><p class="muted">${t("Create a draw in the “Draws” tab first.")}</p></section>`;
    return;
  }
  if (!state.year || !years.some((y) => y.year === state.year)) state.year = years[0].year;
  const [opts, y] = await Promise.all([design.opts || api("/api/themes/options"), api(`/api/years/${state.year}`)]);
  design.opts = opts;
  design.saved = JSON.stringify(y.theme);
  design.theme = JSON.parse(design.saved);
  const art = (n) => `/static/art/svg/${n}.svg`;
  const decoArt = (id) => (id === "ornament" ? `ornament_${design.theme.accent}` : id);
  $("#view").innerHTML = `
    <section class="card">
      <div class="row">
        <div><label>${t("Design for draw")}</label>
          <select id="dyear">${years.map((x) => `<option value="${x.year}" ${x.year === state.year ? "selected" : ""}>${esc(x.label)}</option>`).join("")}</select></div>
        <div class="actions" style="flex:2 1 300px;justify-content:flex-end;margin:0">
          <button class="secondary" id="dsurprise">${t("🎲 Surprise me")}</button>
          <button class="secondary" id="dreset">${t("↺ Undo changes")}</button>
          <button id="dsave">${t("💾 Save design")}</button>
        </div>
      </div>
      <p class="hint" id="dstate"></p>
    </section>
    <div class="studio">
      <div class="controls">
        <section class="card"><h3>${t("1 · Base theme")}</h3><div class="tiles" id="dbase"></div></section>
        <section class="card"><h3>${t("2 · Accent colour")}</h3><div class="swatches" id="daccent"></div></section>
        <section class="card"><h3>${t("3 · Font")}</h3><div class="fonts" id="dfont"></div>
          <p class="hint">${t("Only fonts built into Windows, macOS and iPhones. Android/Gmail shows its own closest match.")}</p></section>
        <section class="card"><h3>${t("4 · Theme animal")}</h3><div class="animals" id="danimal"></div>
          <label class="inline"><input type="checkbox" id="dhat"> ${t("🎅 wearing a Santa hat")}</label></section>
        <section class="card"><h3>${t("5 · Decorations")}</h3>
          <p class="hint">${t("Border icons (pick any; they alternate above and below the card):")}</p><div class="decos" id="dband"></div>
          <p class="hint" style="margin-top:12px">${t("Feature pieces:")}</p><div class="decos" id="dfeature"></div></section>
      </div>
      <div class="preview">
        <section class="card sticky">
          <div class="ptabs" id="dkind">
            ${[["postcard", t("📮 Postcard")], ["invite", t("✉️ Invitation")], ["digest", t("📬 Digest")], ["page", t("🔗 Personal page")]]
              .map(([k, l]) => `<button data-k="${k}" class="${design.kind === k ? "active" : ""}">${l}</button>`).join("")}
            <span style="flex:1"></span>
            ${["hu", "en"].map((l) => `<button data-l="${l}" class="small ${design.lang === l ? "active" : ""}">${l.toUpperCase()}</button>`).join("")}
          </div>
          <iframe id="dframe" title="${t("Card preview")}"></iframe>
          <p class="hint">${t("Sample names only. Images in real e-mails load from your site, so they show once it's online.")}</p>
        </section>
      </div>
    </div>`;

  const th = design.theme;
  const paint = () => {
    $("#dbase").innerHTML = opts.bases.map((b) => `<button class="tile ${th.base === b.id ? "on" : ""}" data-base="${b.id}">
        <span class="mini" style="background:${b.bg}"><span style="background:${b.paper};border-color:${b.second}"></span></span>${esc(t(b.label))}</button>`).join("");
    $("#daccent").innerHTML = opts.accents.map((a) => `<button class="sw ${th.accent === a.id ? "on" : ""}" data-accent="${a.id}"
        title="${esc(t(a.label))}"><span style="background:${a.color}"></span>${esc(t(a.label))}</button>`).join("");
    $("#dfont").innerHTML = opts.fonts.map((f) => `<button class="tile font ${th.font === f.id ? "on" : ""}" data-font="${f.id}">
        <span style="font-family:${f.body};font-size:17px">Ho-ho-ho!</span> <span style="font-family:${f.sign};font-size:19px">a Mikulás</span>
        <small>${esc(t(f.label))}</small></button>`).join("");
    $("#danimal").innerHTML = opts.animals.map((a) => `<button class="tile animal ${th.animal === a.id ? "on" : ""}" data-animal="${a.id}">
        ${a.id === "none" ? `<span class="none">—</span>` : `<img src="${art(th.animal_hat ? a.id + "_hat" : a.id)}" alt="">`}<small>${esc(t(a.label))}</small></button>`).join("");
    $("#dhat").checked = th.animal_hat;
    const deco = (list, el) => ($(el).innerHTML = list.map((d) => `<label class="deco ${th.decorations.includes(d.id) ? "on" : ""}">
        <input type="checkbox" data-deco="${d.id}" ${th.decorations.includes(d.id) ? "checked" : ""}>
        <img src="${art(decoArt(d.id))}" alt="">${esc(t(d.label))}</label>`).join(""));
    deco(opts.band_decorations, "#dband");
    deco(opts.feature_decorations, "#dfeature");
    const dirty = JSON.stringify(th) !== design.saved;
    $("#dstate").textContent = dirty ? t("● Unsaved changes — the preview shows them; e-mails still use the saved design until you save.")
      : t("✓ Saved. All e-mails for this draw use this design.");
    $("#dsave").disabled = !dirty;
    $("#dreset").disabled = !dirty;
    schedulePreview();
  };
  const set = (k, v) => { th[k] = v; paint(); };
  $("#view").onclick = (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.base) set("base", b.dataset.base);
    else if (b.dataset.accent) set("accent", b.dataset.accent);
    else if (b.dataset.font) set("font", b.dataset.font);
    else if (b.dataset.animal) set("animal", b.dataset.animal);
    else if (b.dataset.k) { design.kind = b.dataset.k; document.querySelectorAll("#dkind [data-k]").forEach((x) => x.classList.toggle("active", x === b)); schedulePreview(0); }
    else if (b.dataset.l) { design.lang = b.dataset.l; document.querySelectorAll("#dkind [data-l]").forEach((x) => x.classList.toggle("active", x === b)); schedulePreview(0); }
  };
  $("#view").onchange = (e) => {
    if (e.target.id === "dhat") set("animal_hat", e.target.checked);
    if (e.target.dataset.deco) {
      const id = e.target.dataset.deco;
      th.decorations = e.target.checked ? [...th.decorations, id] : th.decorations.filter((d) => d !== id);
      paint();
    }
    if (e.target.id === "dyear") { state.year = +e.target.value; viewDesign(); }
  };
  $("#dsurprise").onclick = async () => { Object.assign(th, await api("/api/themes/random")); paint(); };
  $("#dreset").onclick = () => { Object.assign(th, JSON.parse(design.saved)); paint(); };
  $("#dsave").onclick = async () => {
    const saved = await api(`/api/years/${state.year}/theme`, { method: "PUT", body: { theme: th } });
    design.saved = JSON.stringify(saved);
    Object.assign(th, saved);
    paint();
  };
  paint();
}

function schedulePreview(delay = 250) {
  clearTimeout(design.timer);
  design.timer = setTimeout(async () => {
    const frame = $("#dframe");
    if (!frame) return;
    if (design.kind === "page") {
      frame.removeAttribute("srcdoc");
      frame.src = `/p/demo?v=${Date.now()}#lang=${design.lang}&t=${encodeURIComponent(JSON.stringify(design.theme))}`;
      return;
    }
    const html = await api("/api/themes/preview", { method: "POST",
      body: { theme: design.theme, kind: design.kind, lang: design.lang, year: state.year } });
    frame.removeAttribute("src");
    frame.srcdoc = html;
  }, delay);
}


/* ── Admin: edit someone's gift ideas ──────────────────────────────────── */
const REASON_LABEL = () => ({ got_it: t("already got it / has a similar one"), not_wanted: t("doesn't want it any more"),
  mistake: t("added by mistake"), other: t("no longer wanted") });

async function wishEditor(y, memberId) {
  const all = await api(`/api/years/${y.year}/wishes`);
  let person = all.find((p) => p.id === memberId);
  const base = `/api/years/${y.year}/wishes/${memberId}`;
  const sources = await api(`${base}/copy-sources`);
  const reasons = REASON_LABEL();
  const body = () => `<h2>${t("🎁 Gift ideas — {name}", { name: esc(person.name) })}</h2>
    <p class="hint">${esc(y.label)}${y.budget ? ` · ${t("budget {budget}", { budget: esc(y.budget) })}` : ""}</p>
    <ul class="mine">${person.wishes.map((w) => `<li style="display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px solid var(--line)">
      <div>${w.obsolete ? `<s>${esc(w.text)}</s> <span class="pill">${esc(reasons[w.reason] || reasons.other)}</span>`
        : esc(w.text)}${w.url ? ` <a href="${esc(w.url)}" target="_blank" rel="noopener noreferrer">${t("link ↗")}</a>` : ""}
        <div class="hint">${w.sent ? t("📬 their Secret Santa has it") : t("not sent yet")}</div></div>
      <div style="white-space:nowrap">${w.obsolete ? `<button type="button" class="small secondary" data-act="restore" data-id="${esc(w.id)}">${t("Restore")}</button>`
        : w.sent ? `<select data-why="${esc(w.id)}" style="width:auto;font-size:12px;padding:2px">
            ${Object.entries(reasons).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("")}</select>
            <button type="button" class="small secondary" data-act="obsolete" data-id="${esc(w.id)}">${t("Mark")}</button>`
        : `<button type="button" class="small secondary" data-act="remove" data-id="${esc(w.id)}">${t("Remove")}</button>`}</div></li>`).join("")
      || `<li class="muted" style="list-style:none">${t("No ideas yet.")}</li>`}</ul>
    <div class="row" style="margin-top:10px">
      <div><label>${t("New idea")}</label><input id="wtext" maxlength="200"></div>
      <div><label>${t("Link (optional)")}</label><input id="wurl" maxlength="500"></div>
      <div style="flex:0 0 auto"><button type="button" class="small" data-act="add">${t("Add")}</button></div>
    </div>
    ${sources.length ? `<div class="row" style="margin-top:6px">
      <div><label>${t("📋 Copy their ideas from another draw")}</label><select id="wcopy">${sources.map((x) =>
        `<option value="${x.draw}">${esc(x.label)} (${x.count})</option>`).join("")}</select></div>
      <div style="flex:0 0 auto"><button type="button" class="small secondary" data-act="copy">${t("Copy")}</button></div></div>` : ""}
    <p class="err" id="werr"></p>`;
  const refresh = () => { $("#dlg-body").innerHTML = body(); };
  $("#dlg-body").onclick = async (e) => {
    const b = e.target.closest("button[data-act]");
    if (!b) return;
    e.preventDefault();
    try {
      let res;
      if (b.dataset.act === "copy") {
        res = await api(`${base}/copy`, { method: "POST", body: { draw: +$("#wcopy").value } });
      } else if (b.dataset.act === "add") {
        const text = $("#wtext").value.trim();
        if (!text) return;
        res = await api(base, { method: "POST", body: { text, url: $("#wurl").value.trim() } });
      } else if (b.dataset.act === "remove") {
        res = await api(`${base}/${encodeURIComponent(b.dataset.id)}`, { method: "DELETE" });
      } else {
        const reason = b.dataset.act === "obsolete" ? document.querySelector(`[data-why="${b.dataset.id}"]`).value : "";
        res = await api(`${base}/${encodeURIComponent(b.dataset.id)}/obsolete`, { method: "POST",
          body: { obsolete: b.dataset.act === "obsolete", reason } });
      }
      person = { ...person, wishes: res.wishes };
      refresh();
    } catch (err) { $("#werr").textContent = err.message; }
  };
  await dialog(body(), [{ label: t("Done"), value: "ok" }]);
  $("#dlg-body").onclick = null;
  renderYear();
}

boot();
