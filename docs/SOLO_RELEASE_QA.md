# Update 2026-10-20

MIT is now approved for own code with the explicit exclusions in LICENSING.md. The original test report below records the earlier state; its pending-license item is superseded. Asset rights and public upload approval remain outstanding.

# Solo release candidate — local verification

Date: 2026-10-19. No upload, repository visibility change, Pages activation or Render deployment performed.

## Result

The separate static candidate is in `output/solo/`. It retains the original Canvas graphics, animation, sound synthesis and game balance. Local co-op remains in the source project. The public edition hides co-op, removes ×10, disables test unlock bypasses, uses a relative favicon path, displays a bilingual prototype status and retains confirmed reset. Reset text now explicitly includes map and speed unlocks.

The build follows only the solo entry point's static module dependencies. It includes 40 files: index, CSS, the small favicon, four SVG cursors, 32 JS modules and `.nojekyll`. `coop-art.js` is a shared drawing dependency, not a network client. QA entry points, WebSocket clients, reference photographs, logs, profiles, original large logo, server code and emote bitmaps are not in the website. Exact file sizes and SHA-256 hashes: `output/solo-manifest.json` (outside the website).

Existing local source and old exports were preserved. The separate original hosting build remains available for co-op; it is not the GitHub Pages candidate.

## Automated checks

Final run: **137 tests passed, zero failed**, including solo rules, all seven tower attacks and sequential upgrades, valid/invalid construction, rewards/sales, boss-only waves, victory/endless, enemy abilities, save validation, W40/W100 unlocks, reset, score-copy fallback, and existing co-op/network tests.

New static release test starts an ephemeral HTTP preview under `/CryptoTowerDefende/`, resolves every static module dependency, checks resources and rejects non-exported files, verifies release flags and absence of QA import / fetch / WebSocket construction.

Syntax checks passed for changed app, language and build modules. A focused scan of exported text found no typical GitHub/API key formats, private-key header, local Windows paths or localhost addresses. This is not a comprehensive audit of the entire future source repository or its history.

On this restricted Windows environment, the default sandbox temp directory caused atomic-rename failures in server persistence tests. Re-running with TEMP and TMP inside `output/test-temp` passed normally. A diagnostic `--test-force-exit` run triggered a Windows Node/libuv shutdown assertion; the final normal run did not use that flag.

Reproduce here in PowerShell:

```powershell
New-Item -ItemType Directory -Force output/test-temp | Out-Null
$env:TEMP = Join-Path (Get-Location) 'output/test-temp'
$env:TMP = $env:TEMP
node --test tests/*.test.mjs
```

Full output: `output/solo-release-tests-final.txt`.

## Actual browser checks

Normal static candidate on port 4181; synthetic checkpoint fixtures on isolated port 4182, never included in the website:

- Fresh English menu, neutral prototype label, solo-only selection, desert locked.
- ×1/×2/×3 shown, ×5/×8 locked before progress, no ×10.
- German switch and manual-wave setting retained after reload.
- Invalid road placement rejected without charging; valid Pengu costs 150.
- Saved tower restored paused after reload; level-2 upgrade costs 150, sale returns 210 correctly.
- All seven towers rendered in a synthetic saved formation; actual first wave completed and manual wave 2 waited.
- Saved W40 victory opens result actions. Outside click retains usable result screen; endless continues with wave 40/∞ and ×5 enabled.
- Actual ETH boss traveled through the map in a one-life checkpoint test; defeat prominently showed Wave 10. Restart confirmation returned to 30 lives, 650 credits and wave 0.
- Score-image clipboard copy reported successful completion. No X post submitted; X encoding/popup fallback covered by automated tests.
- Desert checkpoint renders correctly.
- Malformed save reports damage/incompatibility without crashing or offering Continue.
- Reset cancel leaves data intact; confirmed reset on the isolated test origin removes Continue and preserves settings.
- Sound test activated Web Audio. Human listening quality and sound fatigue were not assessed.
- Narrow approximately 550px and desktop approximately 1265px views visually inspected. Desktop height can require a small vertical scroll; no broad responsive-layout redesign was made.
- Captured browser console contained no errors/warnings on the tested synthetic flow.

These are functional checks, not a new human-played full campaign or a new balance study. Firefox/Safari, physical mobile/touch, 1080p/fullscreen and a live public Pages URL were not tested in this pass. There is no claim that every possible action sequence is bug-free.

## Before any public upload

Technical solo preparation is complete, but these publication decisions remain:

1. Review rights/provenance: supplied DOGE/PENGU favicon; meme tower identities; coin marks; Cupsey's SpongeBob-derived design; stylized TJR/rasmr/Kimchi/Quant Kid and other boss identities; Ansem bull and Pump.fun pill. Existing reference material is not evidence of permission. No blanket rights clearance is claimed. Refer to `docs/ASSETS.md`; do not publish reference photos. Co-op emote provenance is also relevant if the full source/assets are later published.
2. Choose source/asset license terms explicitly. No license was added.
3. Select and audit the future source repository contents independently; `output/solo` is only the playable site. No Git upload preparation was performed.
4. Obtain explicit approval before public visibility, upload or Pages deployment; verify the real public URL afterward.

The defeat/menu/continue retry exploit remains intentionally deferred and documented. High scores and unlocks are browser-local, not tamper-proof. Saves are between-wave checkpoints. Armor, camouflage, new content, accounts and public co-op hosting remain out of scope.
