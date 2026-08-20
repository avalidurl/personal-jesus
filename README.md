# PERSONAL JESUS

Waitlist one-pager at [jesus.numetal.xyz](https://jesus.numetal.xyz). TempleOS desktop, Depeche Mode copy, emails in D1 on this Worker.

## Dev

```bash
npm test
npx wrangler d1 migrations apply personal-jesus-waitlist --local
npx wrangler dev
```

## Dump waitlist

```bash
npx wrangler d1 execute personal-jesus-waitlist --remote --command \
  "SELECT email, created_at FROM waitlist ORDER BY created_at"
```

## Deploy

```bash
npx wrangler d1 migrations apply personal-jesus-waitlist --remote
npx wrangler deploy
```

## Font

`public/fonts/WebPlus_IBM_VGA_8x16.woff` is from VileR’s [Ultimate Oldschool PC Font Pack](https://int10h.org/oldschool-pc-fonts/) (CC BY-SA 4.0). License text is next to the file.
