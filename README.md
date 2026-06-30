# Extra Mileage Logistics — V2

A rebuilt **Japanese used-car export marketplace**, reverse-engineered from
[extramileagejapan.com](https://extramileagejapan.com) and reimagined on **Django**.

Original stack: Laravel + Inertia + Vue. This V2: **Django 5 + Channels + Tailwind + HTMX +
Alpine.js**, server-rendered, no JS build step.

## Design

Clean, modern light theme inspired by Japanese **auction inspection sheets** — spec data,
stock IDs and prices set in mono type, a vermilion "rising-sun" accent on a deep-navy palette.
Fonts: Space Grotesk (display), Inter (body), IBM Plex Mono (data).

## Features

- **Cars** — browse with live HTMX filtering (brand, category, fuel, transmission, year/price
  ranges, steering, sort), paginated grid, rich detail page with gallery + inspection sheet +
  inquiry form.
- **Auctions** — live / upcoming / ended tabs, real-time countdowns, bid placement and a bid
  feed pushed over **WebSockets** (Django Channels) to every watcher instantly.
- **Hero slider** — auto-rotating homepage hero driven by editable `Slide` records.
- **Instant navigation** — the whole site is HTMX-**boosted**: clicking through cars, parts
  and auctions swaps the page body via AJAX (no full reload), with a top progress bar, updated
  URL + tab title, and working back/forward. List filtering still streams just the results grid
  (boosted nav is distinguished from filter requests via the `HX-Boosted` header).
- **Parts shop** — separate catalog for parts, bikes & machines.
- **Accounts** — registration, login, dashboard, wishlist (HTMX heart toggle), profile.
- **Inquiries** — contact + per-vehicle inquiry forms saved to the DB.
- **Admin** — full Django admin for every model, plus a singleton Site Settings record.

## Apps

| App | Responsibility |
|-----|----------------|
| `core` | site settings, home, about, contact, seed command |
| `catalog` | countries, brands, categories, cars + images |
| `shop` | products (parts/bikes/machines) + images |
| `auctions` | auctions + bids |
| `accounts` | custom user, wishlist, inquiries |

## Run it

```bash
cd extramileage-v2
python3 manage.py migrate
python3 manage.py seed_demo --fresh     # 64 cars, parts, 9 auctions, demo users
python3 manage.py runserver
```

Then open http://127.0.0.1:8000/

### Demo logins
- **Admin:** `admin` / `admin12345` (→ `/admin/`)
- **Bidder:** `kwame` / `demo12345`

## Realtime

Live bidding uses **Django Channels** over WebSockets at `ws/auctions/<slug>/`. Placing a bid
broadcasts the refreshed bid panel to all connected clients via an HTMX out-of-band swap.
`runserver` serves ASGI through **Daphne** automatically (it's first in `INSTALLED_APPS`).

The dev setup uses the **in-memory channel layer** — perfect for a single process, no Redis
needed. For multi-process / production, switch `CHANNEL_LAYERS` to `channels_redis`.

## Notes
- SQLite by design here; swap `DATABASES` for Postgres later with no code changes.
- Demo images are served from Unsplash's CDN (curated, verified IDs in `seed_demo.py`).
- Before production: set `DEBUG=False`, a real `SECRET_KEY`, proper `ALLOWED_HOSTS`,
  run `collectstatic`, and move to a Redis channel layer.
