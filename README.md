<div align="center">

<img src="public/favicon.svg" alt="Afterglow" width="88">

# Afterglow

Find your next story. Pick up where you left off.

[Open Afterglow](https://netflix-clone-pi-gilt.vercel.app) · [Run locally](#run-locally) · [Implementation](#implementation)

![React](https://img.shields.io/badge/React_19-161b22?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-161b22?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-161b22?style=flat-square&logo=vite&logoColor=white)
[![MIT license](https://img.shields.io/badge/License-MIT-161b22?style=flat-square)](LICENSE)

</div>

---

Afterglow is a Netflix-inspired streaming interface with an original fictional catalogue. Browse films and shows, preview a title, save favorites, and resume the demo player. The repository is named `netflix-clone`; the interface has its own branding and content.

The public showcase runs entirely in the browser. An optional Express and SQLite backend provides accounts and separate profiles when running locally.

## The browsing experience 🎬

- Explore 36 titles: 17 shows and 19 movies, with separate Top 10 rows.
- Search by title, genre, or cast; filter and sort the catalogue.
- Hover over a card for a muted preview, save and like controls, and title details.
- Open details over a dimmed background, with episodes and related titles.
- Keep a watchlist and resume playback using saved progress.
- Use player shortcuts, playback speed, seek controls, and fullscreen.
- Play a small memory-matching game using catalogue artwork.
- Browse on mobile or with a keyboard, with reduced-motion support.

## Built with 🛠️

| Layer | Technology |
| --- | --- |
| Application | React 19, TypeScript, React Router 7 |
| Build | Vite 6 |
| Styling | Custom CSS, Lucide icons |
| Public demo | Static Vercel hosting, localStorage |
| Optional local backend | Express 5, Node SQLite, scrypt authentication |
| Tests | Node test runner, Playwright |

## Implementation

### Browsing and previews

The catalogue is typed data shared by the shelves, search, details pages, and player. Hover previews render in a portal so they can expand beyond a horizontally scrolling row. Paging arrows remain above previews; heading links stay in the normal page layer. Details use a viewport-scrolling overlay instead of a separate scrollbar inside the panel.

### Your library

The public demo saves watchlists, likes, and playback position in localStorage. No sign-in or hosted database is required. Saves belong to the current browser and disappear when its site data is cleared; they do not sync across devices.

In local full-stack mode, accounts use salted scrypt password hashes and opaque HttpOnly session cookies. Database queries scope profiles to the signed-in user. Library writes are queued to preserve their order. This mode supports up to five profiles per account.

## Run locally

Install Node.js 24 and pnpm, then:

```bash
git clone https://github.com/dhrux2/netflix-clone.git
cd netflix-clone
pnpm install --frozen-lockfile
pnpm dev
```

Open the Vite URL printed in the terminal. The API runs on port 3001. No external API keys are needed. SQLite creates `data/afterglow.db` automatically; this directory is ignored by Git.

### Available commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start Vite and the local account API |
| `pnpm build` | Build the full-stack frontend |
| `pnpm start` | Serve the build and API on port 3001 |
| `pnpm build:showcase` | Build the guest-only public demo |
| `pnpm test` | Run backend and validation tests |
| `pnpm test:e2e` | Run Playwright browser journeys |

Before running browser tests, install Chromium with `pnpm exec playwright install chromium`. The media tests need internet access.

`PORT` and `DATABASE_PATH` can be set in the process environment; `.env.example` documents them. The Express server does not automatically load environment files. The committed `.env.showcase` contains only the public guest-mode flag. Vercel uses `vercel.json` to build this mode and serve client-side routes.

## Code map

| Location | What lives here |
| --- | --- |
| `src/components/` | Navigation, shelves, previews, player controls, and footer |
| `src/pages/` | Browse, search, details, player, game, account, and profiles |
| `src/lib/` | API client, library persistence, configuration, recommendations |
| `src/data/` | Fictional catalogue and preview media sources |
| `server/` | Optional local API, SQLite schema, and authentication |
| `tests/` | Backend behavior and input validation |
| `e2e/` | Browser journeys |

## Media and scope

This is an independent portfolio project, not an official Netflix product or a licensed streaming service. Catalogue titles, cast names, and descriptions are fictional. Top 10 rankings are editorial demo selections.

Playback uses the **Big Buck Bunny trailer**, © Blender Foundation, CC BY 3.0, hosted by [W3C](https://media.w3.org/2010/05/bunny/trailer.mp4); see [film credits](https://peach.blender.org/about/). Thirteen titles use two credited Pexels stock clips for hover previews; the rest use the labeled demo trailer. Photography comes from Unsplash, fonts from Google Fonts, and icons from Lucide. See [media sources](docs/stock-previews.md). Third-party media retains its own licenses.

## Current scope and next steps 🌱

Backend tests and the showcase build pass. The final browser regression run and CodeRabbit review are still pending. Screenshots in `docs/screenshots/` show earlier iterations and need refreshing.

Next up: more varied artwork and title-specific clips, broader language support, and the final desktop/mobile interaction checks. The optional account backend has no email verification or password recovery. It requires persistent storage and HTTPS for hosted use; it is not deployed in the public showcase. There is no billing, DRM, or adaptive streaming pipeline.

---

Created by [Dhruv Upadhyay](https://dhruvupadhyay.com). Source code licensed under [MIT](LICENSE).
