# Repository candidate — local only

Prepared 2026-10-20 for ChompyTrades/CryptoTowerDefende. This is a proposed source distribution, not permission to upload or publish. Figures remain unchanged; their inclusion is conditional on rights review.

`hosting/prepare-repository.mjs` reads the explicit list in `hosting/repository-files.json`. It creates a new timestamped directory below ignored `output/`, with copies and a SHA-256 inventory beside it. It never initializes Git, commits, sets a remote, uploads or changes GitHub. The list is an allowlist, not a recursive copy of the workspace. New files must be explicitly added.

Included: software sources and co-op server, runtime HTML/CSS, package manifest and pnpm lockfile, test/build/preview scripts, required review-page sources used by the existing hosting tests, selected current documentation, license scope and notices. Required favicon/cursors/emotes and visual modules are marked as rights-pending in the inventory.

Excluded: data/ (rooms, profiles and bandwidth ledger), dependencies/stores, output/, logs, .env and credentials, reference photographs, X/, programming prompts, historical result dumps/screenshots/backups/ZIP files, and five machine-specific render generators. Their originals remain on disk. The full historical README was preserved under ignored output/ before replacing it with the concise current README.

The older Docker/Render/Caddy templates are not selected for this solo-focused repository candidate. The local co-op server and its existing hosting server/build scripts are retained. Future public co-op hosting requires separate instructions and review.

Only `output/solo/`, built later from the selected sources, belongs to the GitHub Pages site. The source repository also contains co-op and tests. Review pages are retained for developer tests but are not part of the solo site.

Before a future upload: review this inventory, resolve asset permissions, rerun the clean-copy tests, then obtain explicit upload/publication approval. .gitignore is defense in depth, not a replacement for selecting files or checking an existing Git history.
