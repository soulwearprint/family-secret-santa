"use strict";
/* Admin panel translations. Keys are the English texts used in app.js; {name} placeholders are filled by t().
   Values passed to placeholders must already be HTML-escaped by the caller.
   Adding a string to app.js? Add its Hungarian here too (tests/test_i18n.py checks every t() key). */

const HU = {
  // ── header / shell ──
  "📖 How it works": "📖 Így működik",
  "Loading…": "Betöltés…",
  "Admin": "Admin",
  "Log out": "Kilépés",
  "OK": "OK",
  "Cancel": "Mégse",
  "Save": "Mentés",
  "Saved.": "Elmentve.",
  "Add": "Hozzáadás",
  "Edit": "Szerkesztés",
  "Remove": "Eltávolítás",
  "Delete": "Törlés",
  "Copy": "Másolás",
  "Done": "Kész",
  "Later": "Később",
  "Send": "Küldés",
  "Resend": "Újraküldés",
  "Restore": "Visszaállítás",
  "Name": "Név",
  "E-mail": "E-mail",
  "Status": "Állapot",
  "empty": "üres",
  "new": "új",
  "and": "és",
  "to": "kinek",
  "— none —": "— nincs —",
  "— choose —": "— válassz —",
  "🎁 Draws": "🎁 Húzások",
  "🎨 Card design": "🎨 Képeslap-dizájn",
  "👥 Participants": "👥 Résztvevők",
  "🔑 Admins": "🔑 Adminok",
  "📜 Log": "📜 Napló",
  "📭 <b>Outbox mode:</b> sending is not configured, so postcards are saved as .eml files in <code>data/outbox/</code> instead of being e-mailed. See README to set up sending.":
    "📭 <b>Kimenő mappa mód:</b> a levélküldés nincs beállítva, ezért a képeslapok .eml fájlként a <code>data/outbox/</code> mappába kerülnek, nem mennek ki e-mailben. A beállítást a README írja le.",

  // ── setup / login ──
  "Welcome! Create the first admin": "Üdv! Hozd létre az első admint",
  "The first admin is mandatory. Admins manage the participants, run the draws, send the postcards and — only if really needed — can unlock who drew whom (every unlock is logged). You can add up to 4 more admins later.":
    "Az első admin kötelező. Az adminok kezelik a résztvevőket, lebonyolítják a húzásokat, kiküldik a képeslapokat, és — csak ha tényleg szükséges — feloldhatják, ki kit húzott (minden feloldás naplózva van). Később még legfeljebb 4 admint adhatsz hozzá.",
  "Set up with Google": "Beállítás Google-lel",
  "Only the Google account set as SANTA_FIRST_ADMIN_EMAIL on the server can do this.":
    "Ezt csak a szerveren SANTA_FIRST_ADMIN_EMAIL-ként megadott Google-fiók teheti meg.",
  "Your name": "A neved",
  "Password (min. 6 characters)": "Jelszó (legalább 6 karakter)",
  "Create admin": "Admin létrehozása",
  "⚠️ There is no password reset: the matches are encrypted with the admins' passwords. Add a second admin later as a backup.":
    "⚠️ Nincs jelszó-visszaállítás: a párok az adminok jelszavával vannak titkosítva. Később adj hozzá egy második admint tartaléknak.",
  "Admin login": "Admin belépés",
  "Sign in with Google": "Belépés Google-lel",
  "…or with a name and password:": "…vagy névvel és jelszóval:",
  "Admin name": "Admin neve",
  "Password": "Jelszó",
  "Log in": "Belépés",

  // ── participants & groups ──
  "Participants": "Résztvevők",
  "👋 via {name}": "👋 {name} útján",
  "Restore / edit": "Visszaállítás / szerkesztés",
  "E-mail (only this person should read it)": "E-mail (csak ő olvashatja)",
  "leave empty if they have none": "hagyd üresen, ha nincs neki",
  "…or helper who gets their mail": "…vagy segítő, aki a leveleit kapja",
  "Postcard": "Képeslap",
  "Nobody yet.": "Még senki.",
  "Archived (kept for past years)": "Archivált (a korábbi évek miatt megőrizve)",
  "💑 Never draw each other": "💑 Ne húzzák egymást",
  "These rules are now set <b>per draw</b> (on each draw's page), so a pair can be excluded in one draw and allowed in another. People with a helper never draw their helper in any draw — otherwise the helper, who reads their postcard, would learn who their own Secret Santa is.":
    "Ezeket a szabályokat már <b>húzásonként</b> lehet megadni (minden húzás saját oldalán), így egy pár az egyik húzásban kizárható, a másikban megengedett. Akinek segítője van, az egyik húzásban sem húzhatja a segítőjét — különben a segítő, aki a képeslapját olvassa, megtudná, ki a saját titkos Mikulása.",
  "👥 Groups": "👥 Csoportok",
  "Named lists of people you can start a draw from (e.g. “Family circle”, “Cousins”). Anyone can be in any number of groups.":
    "Elnevezett névsorok, amelyekből húzást indíthatsz (pl. „Szűk család”, „Unokatestvérek”). Bárki tetszőleges számú csoportban lehet.",
  "No groups yet.": "Még nincs csoport.",
  "＋ New group": "＋ Új csoport",
  "Edit group": "Csoport szerkesztése",
  "New group": "Új csoport",
  "Members": "Tagok",
  "Delete group “{name}”?": "Törlöd a(z) „{name}” csoportot?",
  "Draws already created from it keep their people.": "A belőle már létrehozott húzások megtartják a résztvevőiket.",
  "Edit {name}": "{name} szerkesztése",
  "E-mail (empty if they have none)": "E-mail (üres, ha nincs neki)",
  "Helper who gets their mail (only used without e-mail)": "Segítő, aki a leveleit kapja (csak e-mail nélkül számít)",
  "Postcard language": "Képeslap nyelve",
  "Remove {name}?": "Eltávolítod: {name}?",
  "If they took part in a past year they are archived (history is kept) and won't be added to new years. This does not change any existing draw — remove them from a draw's participant list for that.":
    "Ha egy korábbi évben részt vett, archiválódik (az előzmények megmaradnak), és nem kerül be új húzásokba. A meglévő húzásokat ez nem változtatja meg — ahhoz vedd ki a húzás résztvevőlistájából.",

  // ── admins ──
  "Admins ({n}/5)": "Adminok ({n}/5)",
  "Admins can manage everything and unlock the matches. Admin #1 is permanent. Each unlock is recorded in the log, so everyone can see if somebody peeked.":
    "Az adminok mindent kezelhetnek, és feloldhatják a párokat. Az 1. admin állandó. Minden feloldás bekerül a naplóba, így mindenki látja, ha valaki belesett.",
  "Signs in with": "Belépés módja",
  "mandatory": "kötelező",
  "password": "jelszó",
  "Google e-mail": "Google e-mail",
  "Add an admin": "Admin hozzáadása",
  "Google e-mail (Google sign-in not configured)": "Google e-mail (a Google-belépés nincs beállítva)",
  "…and/or initial password": "…és/vagy kezdő jelszó",
  "Add admin": "Admin hozzáadása",
  "Fill in at least one. With Google, the admin just signs in with that Google account — no password to share.":
    "Legalább az egyiket töltsd ki. Google-lel az admin egyszerűen azzal a Google-fiókkal lép be — nem kell jelszót megosztani.",
  "Change my password": "Jelszavam módosítása",
  "Set a backup password": "Tartalék jelszó beállítása",
  "Current password": "Jelenlegi jelszó",
  "New password": "Új jelszó",
  "Change": "Módosítás",
  "Password saved.": "Jelszó elmentve.",
  "Google account for {name}": "{name} Google-fiókja",
  "Google e-mail (empty = remove)": "Google e-mail (üres = eltávolítás)",
  "Remove this admin?": "Eltávolítod ezt az admint?",

  // ── log ──
  "Activity log": "Tevékenységnapló",
  "When": "Mikor",
  "What": "Mi",

  // ── draws ──
  "Draw": "Húzás",
  "{n} people": "{n} fő",
  " · drawn": " · kihúzva",
  " · ⚠ list changed": " · ⚠ a lista változott",
  "No draws yet": "Még nincs húzás",
  "＋ New draw": "＋ Új húzás",
  "Run as many draws side by side as you like, e.g. a small family circle, everyone, and a random few. Each has its own people, budget, design and postcards; someone in two draws gets two cards.":
    "Annyi húzást futtathatsz egymás mellett, amennyit csak szeretnél, pl. a szűk családnak, mindenkinek és néhány véletlenszerűen kiválasztottnak. Mindegyiknek saját résztvevői, kerete, dizájnja és képeslapjai vannak; aki két húzásban is benne van, két lapot kap.",
  "New draw": "Új húzás",
  "Year": "Év",
  "Name (e.g. Family circle, Everyone)": "Név (pl. Szűk család, Mindenki)",
  "leave empty for the main draw": "a fő húzásnál hagyd üresen",
  "Who takes part": "Kik vesznek részt",
  "Same people as last year's draw with this name": "Ugyanazok, mint a tavalyi azonos nevű húzásban",
  "All participants": "Minden résztvevő",
  "A group…": "Egy csoport…",
  "A random set of people…": "Véletlenszerűen kiválasztott emberek…",
  "Nobody yet (I'll tick them)": "Egyelőre senki (majd bejelölöm őket)",
  "Group": "Csoport",
  "Everyone": "Mindenki",
  "How many people": "Hány ember",
  "Budget, rules and card design start from last year's draw with the same name. You can change the list afterwards.":
    "A keret, a szabályok és a képeslap-dizájn a tavalyi azonos nevű húzásból indul. A lista utólag is módosítható.",
  "Create draw": "Húzás létrehozása",
  "Names have not been drawn yet for {label}.": "A(z) {label} húzásban még nem húztak neveket.",
  "✉️ {invited} of {total} invited to add gift ideas · 🎁 {ideas} have added some.":
    "✉️ {total} emberből {invited} kapott meghívót ajándékötletekhez · 🎁 {ideas} már adott meg ötletet.",
  "Tip: invite everyone to add gift ideas first, so the postcards can already list their giftee's ideas. Set the gift budget below before inviting — it is shown in the invitation.":
    "Tipp: előbb hívj meg mindenkit, hogy adjanak meg ajándékötleteket, így a képeslapokon már ott lehetnek a megajándékozott ötletei. A meghívás előtt állítsd be lent az ajándékkeretet — a meghívóban is szerepel.",
  "✉️ Send wish-list invitations ({n})": "✉️ Kívánságlista-meghívók küldése ({n})",
  "🎲 Draw names for {n} people": "🎲 Névhúzás {n} főre",
  "⚠ The participant list changed after the draw.": "⚠ A résztvevők listája a húzás után megváltozott.",
  "Joined: {names}": "Csatlakozott: {names}",
  "Left: {names}": "Kilépett: {names}",
  "Choose who should be reshuffled before sending postcards.": "A képeslapok küldése előtt válaszd ki, kiket kell újrasorsolni.",
  "Choose who to reshuffle…": "Újrasorsolandók kiválasztása…",
  "✅ Names are drawn and secret.": "✅ A nevek kihúzva, titokban.",
  "{n} postcard(s) not sent yet.": "{n} képeslap még nincs elküldve.",
  "All postcards sent.": "Minden képeslap elküldve.",
  "📮 Send {n} pending postcard(s)": "📮 {n} függő képeslap küldése",
  "Reshuffle…": "Újrasorsolás…",
  "🔓 Unlock matches": "🔓 Párok feloldása",
  "Rules for <b>this draw only</b> — they don't affect your other draws. Works both ways. Last year's draw with the same name passes its rules on to a new one. A rule added after the draw applies at the next reshuffle.":
    "Szabályok <b>csak erre a húzásra</b> — a többi húzásodat nem érintik. Mindkét irányban érvényesek. A tavalyi azonos nevű húzás továbbadja a szabályait az újnak. A húzás után felvett szabály a következő újrasorsolásnál lép életbe.",
  "Person": "Személy",
  "Add rule": "Szabály hozzáadása",
  "No rules in this draw.": "Ebben a húzásban nincs szabály.",
  "Copy rules from another draw": "Szabályok másolása másik húzásból",
  "📌 Fixed pairs": "📌 Rögzített párok",
  "Set by hand before the random draw, e.g. Grandma gives to little Peti. Everyone else is drawn randomly. Fixed pairs are visible to all admins and win over every other rule. Adding one after the draw applies at the next reshuffle.":
    "Kézzel megadva a véletlen húzás előtt, pl. Nagyi ajándékoz a kis Petinek. Mindenki mást véletlenszerűen húzunk. A rögzített párokat minden admin látja, és minden más szabályt felülírnak. A húzás után felvett pár a következő újrasorsolásnál lép életbe.",
  "Gives": "Ajándékoz",
  "Add fixed pair": "Rögzített pár hozzáadása",
  "No fixed pairs.": "Nincs rögzített pár.",
  "Who takes part?": "Kik vesznek részt?",
  "Quick add a group": "Csoport gyors hozzáadása",
  "Tick its members": "Tagjai bejelölése",
  "Add people in the Participants tab first.": "Előbb adj hozzá embereket a Résztvevők fülön.",
  "Save participant list": "Résztvevőlista mentése",
  "🎁 Gift ideas": "🎁 Ajándékötletek",
  "You can edit anyone's ideas, e.g. for small children or grandparents. The same rules apply as on their own page: ideas not yet sent to their Secret Santa can be removed; sent ones can only be marked “no longer wanted”. Changes go into the daily digest.":
    "Bárki ötleteit szerkesztheted, pl. kisgyerekekét vagy nagyszülőkét. Ugyanazok a szabályok érvényesek, mint a saját oldalukon: a titkos Mikulásuknak még el nem küldött ötletek törölhetők; az elküldöttek csak „már nem aktuális”-nak jelölhetők. A változások a napi összefoglalóba kerülnek.",
  "✏️ Edit": "✏️ Szerkesztés",
  "Nobody in this draw yet.": "Ebben a húzásban még nincs senki.",
  "Postcards": "Képeslapok",
  "Each person gets their own e-mail; nobody else is in To/CC/BCC. The admin sending them never sees the content. Each card links to a private page where the person adds gift ideas, sees their giftee's ideas and can switch language. Resending a card replaces its link. Changes to gift ideas reach each Secret Santa in one daily digest e-mail (around {hour}:00, {tz}).":
    "Mindenki saját e-mailt kap; senki más nincs a címzett/másolat/titkos másolat mezőben. A küldő admin sosem látja a tartalmat. Minden lapon egy link visz egy személyes oldalra, ahol az illető ajándékötleteket adhat meg, látja a megajándékozottja ötleteit, és nyelvet válthat. A lap újraküldése lecseréli a linket. Az ajándékötletek változásairól minden titkos Mikulás naponta egy összefoglaló e-mailt kap ({hour}:00 körül, {tz}).",
  "📬 {n} wish-list update(s) waiting for the next digest": "📬 {n} kívánságlista-frissítés vár a következő összefoglalóra",
  "Send digest now": "Összefoglaló küldése most",
  "Gift ideas": "Ajándékötletek",
  "not in draw": "nincs a húzásban",
  "sent {when}": "elküldve: {when}",
  "not sent": "nincs elküldve",
  "Preview the postcard (sample names only):": "Képeslap előnézete (csak mintanevekkel):",
  "Details on the postcard": "A képeslap adatai",
  "Draw name (shown on the cards; empty for the main draw)": "A húzás neve (a lapokon is látszik; a fő húzásnál üres)",
  "Gift budget": "Ajándékkeret",
  "e.g. €30": "pl. 10 000 Ft",
  "Gift exchange": "Ajándékozás",
  "e.g. 24 Dec, at Grandma's": "pl. dec. 24., Nagyinál",
  "Extra note from Santa (optional, shown as written)": "A Mikulás üzenete (nem kötelező, úgy jelenik meg, ahogy beírod)",
  "Nobody draws the same person as in last year's “{name}” draw": "Senki sem húzza ugyanazt, mint a tavalyi „{name}” húzásban",
  "main": "fő",
  "Nobody draws the same person as in another {year} draw": "Senki sem húzza ugyanazt, mint ugyanennek az évnek ({year}) egy másik húzásában",
  "Rules apply to the next draw or reshuffle. “Never draw each other” pairs for this draw are further up.":
    "A szabályok a következő húzásnál vagy újrasorsolásnál lépnek életbe. A húzás „Ne húzzák egymást” párjai feljebb vannak.",
  "Save details": "Adatok mentése",
  "Delete this draw": "Húzás törlése",
  "✓ {n} rule(s) added.": "✓ {n} szabály hozzáadva.",
  "Delete {label}?": "Törlöd: {label}?",
  "This removes its participant list, matches and gift ideas. It cannot be undone.":
    "Ez törli a résztvevőlistáját, a párjait és az ajándékötleteket. Nem vonható vissza.",
  "Draw names for {label}?": "Névhúzás: {label}?",
  "Everyone in the list ({n} people) gets exactly one giftee, never themselves. Nobody — including you — will see the result.":
    "A listán mindenki ({n} fő) pontosan egy megajándékozottat kap, sosem saját magát. Az eredményt senki sem látja — te sem.",
  "🎲 Draw": "🎲 Húzás",
  "Names drawn! 🎉": "Nevek kihúzva! 🎉",
  "📬 Digest saved to outbox": "📬 Összefoglaló a kimenő mappába mentve",
  "📬 Digest sent": "📬 Összefoglaló elküldve",
  "{n} e-mail(s)": "{n} e-mail",
  "{n} failed": "{n} sikertelen",
  "Send wish-list invitations?": "Kiküldöd a kívánságlista-meghívókat?",
  "{n} people get an e-mail with a private link where they can add gift ideas (optional).":
    "{n} ember kap e-mailt egy személyes linkkel, ahol ajándékötleteket adhat meg (nem kötelező).",
  "The e-mail shows the gift budget (<b>{budget}</b>).": "Az e-mailben szerepel az ajándékkeret (<b>{budget}</b>).",
  "The e-mail shows the gift budget — none is set yet.": "Az e-mailben szerepel az ajándékkeret — ez még nincs beállítva.",
  "Nothing is drawn yet.": "Még semmit sem húzunk ki.",
  "✉️ Send": "✉️ Küldés",
  "📭 Saved to outbox": "📭 A kimenő mappába mentve",
  "✉️ Invitations sent": "✉️ Meghívók elküldve",
  "{n} saved": "{n} mentve",
  "{n} sent": "{n} elküldve",

  // ── reshuffle / send / reveal ──
  "Who should be reshuffled?": "Kiket sorsoljunk újra?",
  "Joined: {names} — always included.": "Csatlakozott: {names} — mindig benne vannak.",
  "Left: {names} — whoever was giving to them must get a new giftee. They are included automatically <b>without being shown</b>, mixed with a few random people, so nobody can work out who had whom.":
    "Kilépett: {names} — akik nekik ajándékoztak, új megajándékozottat kapnak. Ők automatikusan, <b>láthatatlanul</b> kerülnek be, néhány véletlenszerűen választott ember közé keverve, így senki sem tudja kikövetkeztetni, ki kit húzott.",
  "<b>Reshuffle everyone</b> (completely new draw)": "<b>Mindenki újrasorsolása</b> (teljesen új húzás)",
  "…or tick the people who should get a new giftee. Everyone else keeps theirs (useful if gifts are already bought).":
    "…vagy jelöld be, kik kapjanak új megajándékozottat. A többiek megtartják a sajátjukat (hasznos, ha az ajándékok már megvannak).",
  "Everyone who is reshuffled gets a fresh postcard (even if they happen to draw the same person again).":
    "Mindenki, akit újrasorsolunk, új képeslapot kap (akkor is, ha véletlenül ugyanazt húzza újra).",
  "Reshuffle": "Újrasorsolás",
  "Reshuffled {a} of {b} people": "{b} emberből {a} újrasorsolva",
  " (including {n} not shown, for secrecy)": " (köztük {n}, akit a titoktartás miatt nem mutatunk)",
  "{n} postcard(s) are ready. Send them now?": "{n} képeslap készen áll. Elküldöd most?",
  "📮 Send {n}": "📮 {n} küldése",
  "📮 Postcards sent": "📮 Képeslapok elküldve",
  "🔓 Unlock the matches for {label}?": "🔓 Feloldod a párokat: {label}?",
  "this draw": "ez a húzás",
  "This shows who drew whom — the secret is spoiled for you. It is recorded in the log, visible to all admins.":
    "Ez megmutatja, ki kit húzott — számodra oda a titok. Bekerül a naplóba, amit minden admin lát.",
  "Confirm with Google": "Megerősítés Google-lel",
  "…or re-enter your password": "…vagy írd be újra a jelszavad",
  "Re-enter your password": "Írd be újra a jelszavad",
  "Unlock": "Feloldás",
  "Matches · {label}": "Párok · {label}",
  "Secret Santa": "Titkos Mikulás",
  "gives to": "ajándékoz neki",

  // ── card design studio ──
  "Create a draw in the “Draws” tab first.": "Előbb hozz létre egy húzást a „Húzások” fülön.",
  "Design for draw": "Dizájn ehhez a húzáshoz",
  "🎲 Surprise me": "🎲 Lepj meg",
  "↺ Undo changes": "↺ Változások elvetése",
  "💾 Save design": "💾 Dizájn mentése",
  "1 · Base theme": "1 · Alaptéma",
  "2 · Accent colour": "2 · Kiemelő szín",
  "3 · Font": "3 · Betűtípus",
  "Only fonts built into Windows, macOS and iPhones. Android/Gmail shows its own closest match.":
    "Csak a Windowsba, macOS-be és iPhone-okba beépített betűtípusok. Az Android/Gmail a saját, leghasonlóbb betűjét mutatja.",
  "4 · Theme animal": "4 · Téma-állat",
  "🎅 wearing a Santa hat": "🎅 Mikulás-sapkában",
  "5 · Decorations": "5 · Díszítések",
  "Border icons (pick any; they alternate above and below the card):": "Szegélyikonok (bármennyit választhatsz; váltakozva jelennek meg a lap felett és alatt):",
  "Feature pieces:": "Kiemelt díszek:",
  "📮 Postcard": "📮 Képeslap",
  "✉️ Invitation": "✉️ Meghívó",
  "📬 Digest": "📬 Összefoglaló",
  "🔗 Personal page": "🔗 Személyes oldal",
  "Card preview": "Képeslap előnézete",
  "Sample names only. Images in real e-mails load from your site, so they show once it's online.":
    "Csak mintanevek. A valódi e-mailekben a képek az oldaladról töltődnek be, így akkor látszanak, ha az oldal már elérhető.",
  "● Unsaved changes — the preview shows them; e-mails still use the saved design until you save.":
    "● Nem mentett változások — az előnézet már mutatja őket; az e-mailek a mentésig a mentett dizájnt használják.",
  "✓ Saved. All e-mails for this draw use this design.": "✓ Elmentve. A húzás összes e-mailje ezt a dizájnt használja.",
  // theme option labels (app/themes.py)
  "Classic (pine & cream)": "Klasszikus (fenyő és krém)",
  "Nordic frost": "Északi fagy",
  "Gingerbread": "Mézeskalács",
  "Midnight & gold": "Éjfél és arany",
  "Snowy forest": "Havas erdő",
  "Candy cane": "Cukorpálca",
  "Christmas red": "Karácsonyi piros",
  "Gold": "Arany",
  "Emerald": "Smaragd",
  "Ice blue": "Jégkék",
  "Berry": "Bogyó",
  "Copper": "Réz",
  "Silver": "Ezüst",
  "Plum": "Szilva",
  "Classic serif (Georgia)": "Klasszikus talpas (Georgia)",
  "Elegant (Palatino)": "Elegáns (Palatino)",
  "Friendly rounded (Trebuchet)": "Barátságos, kerek (Trebuchet)",
  "Storybook (Book Antiqua)": "Mesekönyv (Book Antiqua)",
  "Letter typewriter (Courier)": "Írógép (Courier)",
  "Clean modern (Verdana)": "Letisztult modern (Verdana)",
  "No animal": "Nincs állat",
  "Polar bear": "Jegesmedve",
  "Penguin": "Pingvin",
  "Reindeer": "Rénszarvas",
  "Deer": "Szarvas",
  "Llama": "Láma",
  "Samoyed": "Szamojéd",
  "Nordic kitten": "Északi cica",
  "Seal": "Fóka",
  "Arctic fox": "Sarki róka",
  "Snowflakes": "Hópelyhek",
  "Stars": "Csillagok",
  "Ornaments": "Gömbdíszek",
  "Holly": "Magyal",
  "Candy canes": "Cukorpálcák",
  "Gifts": "Ajándékok",
  "Bells": "Csengők",
  "Little trees": "Kis fenyők",
  "Reindeer sleigh (banner)": "Rénszarvasszán (szalag)",
  "Santa (full figure)": "Mikulás (teljes alak)",
  "Santa (face)": "Mikulás (arc)",

  // ── gift-idea editor ──
  "already got it / has a similar one": "már megkapta / van hasonló",
  "doesn't want it any more": "már nem szeretné",
  "added by mistake": "tévedésből került fel",
  "no longer wanted": "már nem aktuális",
  "🎁 Gift ideas — {name}": "🎁 Ajándékötletek — {name}",
  "budget {budget}": "keret: {budget}",
  "link ↗": "link ↗",
  "📬 their Secret Santa has it": "📬 a titkos Mikulása már megkapta",
  "not sent yet": "még nincs elküldve",
  "Mark": "Jelölés",
  "No ideas yet.": "Még nincs ötlet.",
  "New idea": "Új ötlet",
  "Link (optional)": "Link (nem kötelező)",
  "📋 Copy their ideas from another draw": "📋 Ötletei másolása másik húzásból",

  // ── activity log actions (stored in English by the server) ──
  "MATCHES REVEALED": "PÁROK FELOLDVA",
  "draw": "húzás",
  "reshuffle (everyone)": "újrasorsolás (mindenki)",
  "partial reshuffle": "részleges újrasorsolás",
  "REJECTED Google sign-in": "ELUTASÍTOTT Google-belépés",
  "admin Google e-mail changed": "admin Google e-mail módosítva",
  "admin added": "admin hozzáadva",
  "admin removed": "admin eltávolítva",
  "card design changed": "képeslap-dizájn módosítva",
  "draw created": "húzás létrehozva",
  "draw deleted": "húzás törölve",
  "draw details edited": "húzás adatai módosítva",
  "exclusion added": "kizárás hozzáadva",
  "exclusion removed": "kizárás eltávolítva",
  "exclusions copied": "kizárások másolva",
  "fixed pair added": "rögzített pár hozzáadva",
  "fixed pair removed": "rögzített pár eltávolítva",
  "gift ideas edited by admin": "ajándékötletek admin általi szerkesztése",
  "group created": "csoport létrehozva",
  "group deleted": "csoport törölve",
  "group edited": "csoport módosítva",
  "login": "belépés",
  "member added": "résztvevő hozzáadva",
  "member archived": "résztvevő archiválva",
  "member edited": "résztvevő módosítva",
  "participants changed": "résztvevők módosítva",
  "password changed": "jelszó módosítva",
  "postcard language changed": "képeslap nyelve módosítva",
  "postcards sent": "képeslapok elküldve",
  "setup": "beállítás",
  "wish-list digest FAILED": "kívánságlista-összefoglaló SIKERTELEN",
  "wish-list digest queue FAILED": "kívánságlista-összefoglaló sorba állítása SIKERTELEN",
  "wish-list digest run manually": "kívánságlista-összefoglaló kézzel indítva",
  "wish-list digest sent": "kívánságlista-összefoglaló elküldve",
  "wish-list invitations sent": "kívánságlista-meghívók elküldve",

  // ── server error messages (app/main.py, app/draw.py) ──
  "A draw already exists. Confirm which names to reshuffle.": "Már van húzás. Erősítsd meg, kiket kell újrasorsolni.",
  "A group with this name already exists.": "Már van ilyen nevű csoport.",
  "An admin with this name already exists.": "Már van ilyen nevű admin.",
  "At least 2 participants are needed.": "Legalább 2 résztvevő kell.",
  "At least 2 participants are needed for a draw.": "A húzáshoz legalább 2 résztvevő kell.",
  "Give the new admin a password, a Google e-mail, or both.": "Adj az új adminnak jelszót, Google e-mailt vagy mindkettőt.",
  "Google sign-in is not configured.": "A Google-belépés nincs beállítva.",
  "Google sign-in is not ready yet: a password admin must log in once first.": "A Google-belépés még nem használható: előbb egy jelszavas adminnak egyszer be kell lépnie.",
  "No such admin.": "Nincs ilyen admin.",
  "No such draw.": "Nincs ilyen húzás.",
  "No such group.": "Nincs ilyen csoport.",
  "No such idea.": "Nincs ilyen ötlet.",
  "No such member.": "Nincs ilyen résztvevő.",
  "Not a participant of this draw.": "Nem résztvevője ennek a húzásnak.",
  "Not sent to the Secret Santa yet, so it can simply be removed.": "Még nem ment el a titkos Mikulásnak, így egyszerűen törölhető.",
  "Nothing to copy from that draw.": "Abból a húzásból nincs mit másolni.",
  "One of them is already in a fixed pair this year.": "Egyikük már szerepel egy rögzített párban ebben a húzásban.",
  "Passwords need at least 6 characters.": "A jelszó legalább 6 karakter legyen.",
  "Pick another draw.": "Válassz egy másik húzást.",
  "Pick two different people.": "Két különböző embert válassz.",
  "Please log in as an admin.": "Lépj be adminként.",
  "Re-enter your password or confirm with Google to unlock.": "A feloldáshoz írd be újra a jelszavad, vagy erősítsd meg Google-lel.",
  "Setup already done.": "A beállítás már megtörtént.",
  "Setup is reserved for the configured first admin: use Sign in with Google.": "A beállítás a megadott első adminé: használd a Belépés Google-lel gombot.",
  "That Google account is already an admin.": "Ez a Google-fiók már admin.",
  "That does not look like a Google account e-mail.": "Ez nem tűnik Google-fiók e-mail-címének.",
  "That does not look like an e-mail address.": "Ez nem tűnik e-mail-címnek.",
  "The Secret Santa has already received this idea. Mark it as no longer wanted instead.": "A titkos Mikulás már megkapta ezt az ötletet. Jelöld inkább „már nem aktuális”-nak.",
  "The first admin is mandatory and cannot be removed.": "Az első admin kötelező, nem távolítható el.",
  "The helper needs their own e-mail address.": "A segítőnek saját e-mail-cím kell.",
  "The participant list changed since the draw. Reshuffle first.": "A résztvevők listája változott a húzás óta. Előbb sorsolj újra.",
  "This admin has no password and signs in with Google.": "Ennek az adminnak nincs jelszava, Google-lel lép be.",
  "This admin has no password, so the Google e-mail can't be removed.": "Ennek az adminnak nincs jelszava, ezért a Google e-mail nem távolítható el.",
  "This link is no longer valid. A newer postcard may have replaced it.": "Ez a link már nem érvényes. Lehet, hogy egy újabb képeslap lecserélte.",
  "This person is a helper for someone else, so they need an e-mail address.": "Ő valaki másnak a segítője, ezért kell e-mail-cím.",
  "Unknown admin.": "Ismeretlen admin.",
  "Unknown helper.": "Ismeretlen segítő.",
  "Unknown member id(s).": "Ismeretlen résztvevő-azonosító(k).",
  "Unknown member.": "Ismeretlen résztvevő.",
  "Without an e-mail address, pick a helper who receives the mail for this person.": "E-mail-cím nélkül válassz segítőt, aki a leveleit megkapja.",
  "Wrong name or password.": "Hibás név vagy jelszó.",
  "Wrong password.": "Hibás jelszó.",
  "Your admin account has no Google e-mail.": "Az admin fiókodhoz nincs Google e-mail rendelve.",
  "These rules make a draw impossible. Try removing an exclusion, or turn off 'avoid last year's match' for this year.":
    "Ezekkel a szabályokkal a húzás lehetetlen. Próbálj meg törölni egy kizárást, vagy kapcsold ki ennél a húzásnál a tavalyi párok elkerülését.",
  "Google sign-in was cancelled.": "A Google-belépés megszakadt.",
  "Sign-in link expired. Please try again.": "A belépési link lejárt. Próbáld újra.",
  "Please confirm with the Google account of the admin who is logged in.": "A bejelentkezett admin Google-fiókjával erősítsd meg.",
  "Only the configured first admin can set up this app.": "Az alkalmazást csak a megadott első admin állíthatja be.",
  "Not Found": "Nem található",
  "Internal Server Error": "Belső szerverhiba",
};

// Server messages with values in them: [English regex, Hungarian template using $1, $2…]
const HU_PATTERNS = [
  [/^At most (\d+) ideas\.$/, "Legfeljebb $1 ötlet lehet."],
  [/^Maximum of (\d+) admins reached\.$/, "Elérted a legfeljebb $1 admint."],
  [/^Pick between 2 and (\d+) people for a random draw\.$/, "Véletlen húzáshoz 2 és $1 közötti létszámot válassz."],
  [/^There is already a draw called “(.*)” in (\d+)\.$/, "Már van „$1” nevű húzás ($2)."],
  [/^(.*) has no e-mail and no helper with an e-mail address\.$/, "$1 nem rendelkezik e-mail-címmel, és e-mail-címes segítője sincs."],
  [/^(.*) is not an admin of this Secret Santa\.$/, "$1 nem admin ebben az angyalkázásban."],
];

const I18N = {
  LANGS: ["hu", "en"],
  get lang() {
    let l = null;
    try { l = localStorage.getItem("santa.lang"); } catch (_) {}
    if (!this.LANGS.includes(l)) l = (navigator.language || "").toLowerCase().startsWith("hu") ? "hu" : "en";
    return l;
  },
  set lang(l) { try { localStorage.setItem("santa.lang", l); } catch (_) {} },
  locale() { return this.lang === "hu" ? "hu-HU" : "en-GB"; },
  serverError(msg) {
    if (!msg || this.lang !== "hu") return msg || "";
    if (HU[msg]) return HU[msg];
    for (const [re, tpl] of HU_PATTERNS) if (re.test(msg)) return msg.replace(re, tpl);
    return msg;
  },
  // Texts in index.html, the HU|EN switch and the guide link.
  applyStatic() {
    const l = this.lang;
    document.documentElement.lang = l;
    const g = document.getElementById("guidelink");
    if (g) { g.textContent = t("📖 How it works"); g.href = `/guide?lang=${l}`; }
    const sw = document.getElementById("langsw");
    if (sw) {
      sw.innerHTML = this.LANGS.map((x) => `<button type="button" data-lang="${x}" class="${x === l ? "on" : ""}"
        aria-pressed="${x === l}" title="${x === "hu" ? "Magyar" : "English"}">${x.toUpperCase()}</button>`).join("");
      sw.querySelectorAll("button").forEach((b) => (b.onclick = () => {
        if (b.dataset.lang === this.lang) return;
        this.lang = b.dataset.lang;
        boot();  // re-render everything in the new language
      }));
    }
  },
};

function t(s, vars) {
  let r = (I18N.lang === "hu" && HU[s]) || s;
  if (vars) r = r.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  return r;
}
