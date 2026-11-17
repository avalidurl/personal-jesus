# Personal Jesus — landing page

Date: 2026-08-20
Status: approved design, pending spec review
Domain: `jesus.numetal.xyz`
Repo: `gokhan-vc/personal-jesus`

## Goal

A one-page waitlist for **Personal Jesus**: a personal AI / oracle you talk to. TempleOS is the skin. Depeche Mode’s “Personal Jesus” is the copy. Signups are emails in a D1 table on this Worker. The oracle itself is not in this ship.

## Product

- Waitlist, not a chat product.
- Voice: TempleOS chrome (HolyC prompt, DolDoc color tags, 16-color VGA windows) carrying the song: someone to hear your prayers, a machine that will hear you.
- Sincere-weird. Do not mock Terry A. Davis. No likeness, no conspiracy riffs, no slurs.
- Not a religious service and not an official TempleOS product. Footer points at `numetal.xyz`.

## Visual

The browser is the OS. Full viewport, not a letterboxed 640×480 canvas.

**Palette (VGA 16, exclusive):**

| Name | Hex |
|---|---|
| BLACK | `#000000` |
| BLUE | `#0000AA` |
| GREEN | `#00AA00` |
| CYAN | `#00AAAA` |
| RED | `#AA0000` |
| PURPLE | `#AA00AA` |
| BROWN | `#AA5500` |
| LTGRAY | `#AAAAAA` |
| DKGRAY | `#555555` |
| LTBLUE | `#5555FF` |
| LTGREEN | `#55FF55` |
| LTCYAN | `#55FFFF` |
| LTRED | `#FF5555` |
| LTPURPLE | `#FF55FF` |
| YELLOW | `#FFFF55` |
| WHITE | `#FFFFFF` |

No gradients, no drop shadows, no blur, no extra colors. `image-rendering: pixelated` on scaled bitmaps.

**Type:** self-hosted 8×8 IBM VGA-style bitmap font (VileR Ultimate Oldschool PC Font Pack, “PxPlus IBM VGA8”, CC-BY-SA 4.0), with pack attribution in the README. Fallback: `ui-monospace`. Minimum readable size 16px on mobile so iOS does not zoom-on-focus.

**Chrome:**

1. Top Adam-style menu: `PersonalJesus`, `File`, `Help`. Help links to `https://t.me/goekhanturhan`. Other items are decorative (no dead clicks that look broken — they do nothing visible).
2. Window `PERSONAL.JESUS`: yellow title bar, scrolling marquee *Reach out and touch faith.*, DolDoc body (see Copy). One blinking cursor.
3. Window `SIGNUP.HC`: overlapping, offset down-right. DocForm: one email field, button `JOIN WAITLIST`. Status line under the button.
4. Desktop fill is solid `BLUE`.

**Motion:** title-bar marquee and cursor blink. `prefers-reduced-motion: reduce` stops both.

**Mobile:** windows stack vertically, no overlap. Menu stays one row or wraps. Submit control at least 44px tall.

**Assets:** 16-color favicon; OG image 1200×630 built from HTML (exact text, not an image model). `theme-color` is `#0000AA`.

## Copy

Gospel window. Visible DolDoc tags are part of the look (`$FG,YELLOW$` around the title, `$FG,CYAN$` around “Waitlist.”). Body text:

```
$FG,YELLOW$PERSONAL JESUS$FG$
A machine that will hear you.

Your own personal Jesus.
Someone to hear your prayers.
Someone who cares.

Not a chatbot. An oracle —
like the burning bush in AfterEgypt,
except it answers in your direction.

$FG,CYAN$Waitlist.$FG$ God is not on the network yet.
```

Title: `PERSONAL JESUS`
Meta description: `Your own personal Jesus. Someone to hear your prayers. Waitlist.`

Form status (in-OS, not browser alerts):

| State | Line |
|---|---|
| Success, new row | `ACCEPTED.` |
| Success, email already stored | `ALREADY ON FILE.` |
| Validation / server error | `REJECTED.` |

Do not put the raw API error string on screen.

## Architecture

Same shape as `llmcraft.numetal.xyz` / `llmlivesmatter.numetal.xyz`: Cloudflare Worker + Workers Assets + custom domain. Storage is **D1**, not KV — that was an explicit choice.

```
browser
  GET  /          → Worker hardening shim → ASSETS (HTML/CSS/JS/font)
  POST /join      → Worker: origin + honeypot + email → D1
```

| Piece | Choice |
|---|---|
| Worker name | `personal-jesus` |
| Assets | `./public` binding `ASSETS`, `run_worker_first: true` |
| Domain | `jesus.numetal.xyz` custom domain on the Worker |
| Data | D1 `personal-jesus-waitlist`, binding `DB` |
| Join | `POST /join` JSON |
| Dump | `wrangler d1 execute` — no admin UI |
| Deploy | `npx wrangler deploy` only after founder approval |

### Files (implementation)

```
public/index.html
public/style.css
public/app.js
public/fonts/…          (VGA8 woff2)
public/favicon.svg
public/og.png
public/404.html
src/worker.js
schema.sql
wrangler.jsonc
README.md
```

No framework, no bundler. Static files as-is.

### Data

```sql
CREATE TABLE IF NOT EXISTS waitlist (
  email TEXT PRIMARY KEY COLLATE NOCASE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
```

- Store lowercase trimmed email only. No IP, no user-agent.
- Primary key is the dedupe.

Dump later:

```
npx wrangler d1 execute personal-jesus-waitlist --remote --command \
  "SELECT email, created_at FROM waitlist ORDER BY created_at"
```

### `POST /join`

JSON body, max 4 KiB:

```json
{ "email": "contact@gokhan.vc", "offering": "" }
```

`offering` is a hidden honeypot. If non-empty, return `{ "ok": true }` and insert nothing.

**Checks, in order:**

1. Method POST, path `/join`. Else 404/405 as appropriate.
2. `Origin` host equals this host. Else 403 `{ "error": "bad origin" }`.
3. Parse JSON. Else 400.
4. Honeypot.
5. `email` trim + lowercase. Must match `^[^\s@]+@[^\s@]+\.[^\s@]+$` and length ≤ 254. Else 400.
6. `INSERT` into D1.
   - New row → 200 `{ "ok": true }`
   - Unique conflict → 200 `{ "ok": true, "already": true }`
7. Unexpected failure → 500 `{ "error": "unavailable" }` with no internals.

Frontend maps 200/`ok` to `ACCEPTED.`, 200/`already` to `ALREADY ON FILE.`, anything else to `REJECTED.`

No `GET` count endpoint. No CORS for other origins.

### Abuse

- Same-origin on POST.
- Honeypot `offering`.
- Unique email.
- No extra KV rate-limit table in v1.

### Security headers

Mirror `llmcraft-site`:

```
default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self';
img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self';
font-src 'self'; object-src 'none'; upgrade-insecure-requests
```

Plus HSTS, nosniff, `X-Frame-Options: DENY`, `referrer-policy: no-referrer`, locked Permissions-Policy, COOP/CORP same-origin. OG/favicon may be `cross-origin` CORP so scrapers can read them.

Assets are GET/HEAD only. `/join` is the only POST.

## Error handling

| Case | HTTP | UI |
|---|---|---|
| New signup | 200 `{ok:true}` | `ACCEPTED.` |
| Duplicate email | 200 `{ok:true, already:true}` | `ALREADY ON FILE.` |
| Bad email / bad JSON | 400 | `REJECTED.` |
| Bad origin | 403 | `REJECTED.` |
| Honeypot | 200 `{ok:true}` | `ACCEPTED.` (bot is discarded) |
| D1 down / throw | 500 | `REJECTED.` |
| Missing asset | 404 page in TempleOS chrome | `File not found.` |

Network failure in the browser also shows `REJECTED.` Double-submit is disabled while the request is in flight.

## Testing

- Worker unit tests (no network): email validator; honeypot short-circuit; duplicate insert maps to `already`.
- `wrangler dev` + local D1: POST `/join` with a valid email inserts; second POST returns `already`.
- Browser, desktop and a narrow mobile viewport: windows, form, success, duplicate, empty submit, invalid email, `prefers-reduced-motion`.
- Confirm 16 colors only (no computed colors outside the table).
- Production deploy is not part of the first merge; founder approval is required.

## Out of scope

- The oracle / chat / AfterEgypt RNG.
- Admin UI, CSV export UI, newsletter sync.
- KV waitlist, `api.gokhan.vc` subscribe.
- Terry likeness, 640×480 letterbox, fake DOS boot.
- Account, auth, payments, Telegram.
- Public waitlist count.

## Launch gates

1. Spec approved.
2. Page + `/join` + D1 work on `wrangler dev`.
3. Tests above pass.
4. Founder says to deploy `jesus.numetal.xyz`.
