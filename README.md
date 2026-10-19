# Crypto Tower Defense

Free PC-browser tower-defense prototype: seven meme towers, two maps, 40 campaign waves and optional endless play. Development is on hold; no updates are currently planned.

Developer: [@ChompyTrades](https://x.com/ChompyTrades). Feedback is welcome; support is not guaranteed.

**Play solo:** [Crypto Tower Defense](https://chompytrades.github.io/CryptoTowerDefende/)

The public GitHub Pages version is a free solo prototype. Co-op remains available in the source code, but needs a separate Node/WebSocket server and is not hosted on GitHub Pages.

## Play locally (solo)

Requires Node.js 22 or newer. No dependency installation needed for solo.

```sh
node hosting/build-solo.mjs
node hosting/preview-solo.mjs
```

Open http://127.0.0.1:4181/CryptoTowerDefende/ . Only the generated output/solo directory is the static website.

## Co-op and tests

Requires Node.js and pnpm 10 or 11; see [pnpm installation](https://pnpm.io/installation).

```sh
pnpm install --frozen-lockfile
node server.mjs
```

Open the printed address with /coop.html. Co-op needs a separate Node/WebSocket server: GitHub Pages cannot run it. The full implementation is retained for local use. Two to four connected players are required; starting alone switches to solo. The default server accepts connections on this computer only.

Run automated tests with `node check.mjs`.

## Documentation and license

- [Controls, saves, unlocks and co-op](docs/SOLO_PROTOTYPE.md)
- [Verification and known limitations](docs/SOLO_RELEASE_QA.md)
- [Repository file selection](docs/REPOSITORY_SELECTION.md)
- [License scope](LICENSING.md): MIT for own software code; separate pending asset rights. Do not treat the entire game as cleared third-party artwork.

Progress and scores are browser-local. The deferred defeat/menu/continue retry issue remains. No accounts or verified leaderboard.
