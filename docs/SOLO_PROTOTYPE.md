# Crypto Tower Defense — playable solo prototype

Crypto Tower Defense is a free PC-browser tower defense prototype with seven meme towers, two maps, a 40-wave campaign and optional endless play. Development is on hold; no further updates are currently planned.

Developer: [@ChompyTrades on X](https://x.com/ChompyTrades). Feedback is welcome, without a promise of support or updates.

Public playable URL: **not published yet**. The GitHub repository is currently an empty private preparation repository. Own software code is licensed under MIT; see LICENSE and LICENSING.md for the explicit scope. Figure/asset rights remain under review.

## Local solo preview

Requires Node.js 22 or newer. No npm dependencies are needed for the static build or its preview server.

```sh
node hosting/build-solo.mjs
node hosting/preview-solo.mjs
```

Open http://127.0.0.1:4181/CryptoTowerDefende/ . The site is deliberately tested under a project subdirectory. Only `output/solo/` is the static website; do not publish the entire working directory. Earlier solo exports are retained as `output/solo-previous-*`, outside the website.

## Playing

Select a tower and click a free building location. Click a built tower for upgrades, targeting and sale. Right-click or Escape cancels placement. Space pauses. Speed keys: 1, 2, 3, 5, 8; bonus speeds require their unlock. Settings include English/German, automatic waves, music, effects and a confirmed progress reset.

The first wave starts one second after the first tower is built. Later waves use the automatic/manual setting. Clear Grasslands wave 40 to unlock the desert; clear wave 40 for ×5 and wave 100 for ×8. There is no ×10 or test-unlock bypass in the static edition.

Progress is stored in this browser, for this website address. Saves are checkpoints **between waves**, not live mid-wave snapshots. Clearing browser data removes progress; another browser or address does not automatically inherit it. There are no accounts or verified online leaderboards. Image copying requires browser clipboard permission; sharing opens an X draft and does not publish automatically.

## Co-op is retained, but not hosted by GitHub Pages

GitHub Pages only serves static files. CTD co-op needs the included Node.js/WebSocket server to coordinate rooms, enemies, wallets and actions. Therefore the public static version has no co-op button.

For local co-op and automated tests, use Node.js 22 or newer and pnpm 10 or 11 (the clean-copy installation was tested with pnpm 11.19.0). Install pnpm using its official instructions at https://pnpm.io/installation if it is not already available. This repository has a pnpm lockfile, not an npm lockfile.

```sh
pnpm install --frozen-lockfile
node server.mjs
```

For automated tests run `node check.mjs`. Open the server address printed in the terminal, followed by `/coop.html`. The default local server binds only to 127.0.0.1; LAN/Internet access needs separate host/network configuration. Two to four connected players are required. Starting alone hands off to real local singleplayer. Multiple browsers can be used for testing. Other devices need a reachable server address; localhost on another device points to that device, not the host. Internet hosting requires separate configuration and is not enabled by this preparation.

No co-op source, assets or server implementation were removed. Server/network optimizations remain available to anyone running a properly configured server themselves.

## Known limitations

- The previously deferred defeat → menu → continue retry exploit remains unchanged.
- Desktop mouse/keyboard prototype; mobile/touch is not a supported release target.
- Browser-local scores/unlocks can be modified and are not competitive proof.
- Balance in very high endless waves is experimental.
- Current public-asset permissions still need review; see `docs/SOLO_RELEASE_QA.md`. Public visibility is not a blanket reuse license.

## Suggested GitHub description (not submitted)

Playable browser tower-defense prototype. Solo on GitHub Pages; co-op requires a separate Node.js server. Development on hold.

## Publication boundary

Repository contents must be selected and checked separately from the static website. Exclude credentials, `.env` files, logs, local profiles, test saves, reference photographs, attachments and obsolete exports. Do not upload or enable Pages without the owner's explicit publication approval. After deployment, test the actual public subdirectory before sharing it on X.
