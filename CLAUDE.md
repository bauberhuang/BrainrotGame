# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Run the game

```
python app.py
```

Starts a `ThreadingHTTPServer` on `0.0.0.0:5002`. The server scans ports 5002–5021 if the first is taken. No dependencies beyond Python stdlib. Open `http://127.0.0.1:5002` in a browser.

## Architecture

This is a single-page vanilla JS idle/incremental game (Brainrot Casino) with a minimal Python static file server. No frameworks, no build step, no package manager.

### Backend (`app.py`)

- Serves static files from the project root via `SimpleHTTPRequestHandler`.
- Only route mapping is `/` → `/index.html`. All other paths are served as-is from disk.
- Single POST endpoint (`/reset`): returns a fresh default game state as JSON.

### Frontend — single HTML, modular JS

`index.html` contains all page sections (home, rebirth, admin, sailing, account, others). Only the active section is visible; the rest have `class="hidden"`. Navigation uses URL hash (`#admin`, `#rebirth`, etc.) and is handled client-side with no page reload.

Scripts load in dependency order:

| File | Purpose |
|------|---------|
| `data.js` | All game data (characters, boats, islands, mutations, constants, lookup maps). Exposes `window.GameData`. |
| `utils.js` | Pure helper functions (formatMoney, formatCountdown, rollByWeight, rarity labels, SVG letter images). Exposes `window.GameUtils`. |
| `state.js` | State create/load/save/normalize, invite/account system, admin auth. Exposes `window.GameState`. |
| `ui.js` | DOM element cache (`cacheDom()`), page switching (`showPage()`), all render functions. Exposes `window.GameUI`. |
| `game.js` | Core game logic: roll, buy, tick, events, rebirth, lucky blocks, income calculation. Exposes `window.Game`. |
| `sailing.js` | Sailing system module. Exposes `window.Sailing` with `boot()`, `render()`, and `resolveFinished()`. |
| `admin.js` | Admin panel module. Exposes `window.Admin` with `boot()` and `render()`. |
| `accounts.js` | Account management module. Exposes `window.Accounts` with `boot()` and `render()`. |
| `others.js` | Imported games iframe loader. Exposes `window.Others` with `boot()`. |
| `main.js` | Entry point (loaded last). Polyfills `crypto.randomUUID`, defines the `Rebirth` module, sets up hash-based routing and nav button bindings, loads state, starts the 1-second game loop. |

### Module API pattern

Each module exposes a namespace on `window` (e.g., `window.GameData`, `window.GameState`, etc.). Functions access other modules via shorthand accessors like `D() → window.GameData`, `U() → window.GameUtils`, `S() → window.GameState`, `UI() → window.GameUI`, `G() → window.Game`.

The game loop calls `G().tickIncome()` every second, which updates money, auto-rolls, resolves sailing jobs, and re-renders the topbar totals/timer. Page modules must provide a `render()` function which `Game.fullRender()` calls via `callModuleRender()` — this keeps sub-page UIs in sync when state changes.

### Page routing

`main.js` listens for `hashchange` events. When the hash changes, `UI().showPage(pageName)` hides all page sections and shows the target. Each page has a `boot()` function that binds events and populates selects — this is called once when navigating to the page. Back buttons set the hash to `""` (home).

### State persistence

All game state is in `localStorage`. Save keys are scoped by account ID: `brainrot-idle-save-v3-{accountId}`. State is saved every second in the tick loop and on every `fullRender()` call. Accounts/invites are stored in `brainrot-invite-system-v1`. There is no server-side persistence.

### Account/invite system

Accounts are created via one-time-use invite codes. The "Starter Pool" account has code `AAAAA`. Login is name + password. Each account gets up to 4 invite codes. Up to 5 accounts are "remembered" for quick switching. Guest mode (no account) does not persist saves.

### Game data

Character/item/boat/island definitions live in `data.js` as plain arrays. Standard characters use `value` as roll weight and `cost`/`income` for economics. Lucky block characters use `luckyBlockValue` as uncover weight. Sailing islands contain reward arrays with `sailingValue` weights. Mutations (normal 1x, rainbow 1.5x, radioactive 3.5x) multiply income per owned copy. Rebirths (up to 20) give +0.5x cash multiplier each.
