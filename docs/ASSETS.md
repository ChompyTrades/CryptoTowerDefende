# Grafik und Audio

Alle im Spiel gerenderten Figuren, Münzlogos, Karte, Effekte und Animationen sind eigene Canvas-Zeichnungen in `src/render.js`. Die Referenzbilder werden nicht als Spielhintergrund oder Sprite eingesetzt. Systemschrift: Segoe UI / Arial. Keine externen Fonts, Bilder, Bibliotheken oder Netzwerkaufrufe.

Vorlagen: vom Nutzer bereitgestellte Dateien in `docs/references/`; Hauptkonzept, PENGU-Haarschopf, blau-lila SNEK, BONK-Schnauze, SI-Kostüm/Cape und TJR-Frisur/Bart wurden betrachtet. BONKs roter Hammer stammt aus der ausdrücklichen Textvorgabe. DOGE hat einen eigenen Seitenblick und eine längere Körperform; die stilistische Wiedererkennbarkeit ist noch vom Nutzer zu beurteilen. TJR bleibt der vorgesehene austauschbare Cartoon-Gag. BTC WHALE ist unser Umsetzungsvorschlag für den Miniboss.

Audio: eigene prozedurale Synthese in `src/audio.js`, 96-BPM-Bass-/Akkordmuster mit weichen Oszillatoren; keine Samples oder fremden Musikstücke. Musik hängt an echter Audiozeit und wird bei x3 nicht beschleunigt. Effekte werden auf höchstens einen neuen Klang pro 75 ms und zusammen maximal zwölf Stimmen begrenzt. Browser-Audiokontext startet nach Nutzerinteraktion.

Die Figuren sind nutzbare, eigenständige Prototyp-Vektoren, keine final abgenommenen Markenillustrationen. Die vorhandenen Referenzen belegen keine pauschalen Rechte an Maskottchen, Namen, Logos oder Porträt. Vor einer Veröffentlichung sind diese Fragen gesondert zu prüfen. Dieser Auftrag bleibt lokal; keinerlei Tracking, Konten, Wallets oder externe Dienste.

## Referenzen der Überarbeitung 0.2
Das erneut hochgeladene Konzeptbild und die vorhandenen Projektkopien sind visuelle Orientierung. Bei BTD wurden Panelhierarchie, große Porträts und erkennbare Kaufzustände betrachtet; keine Grafiken oder UI-Dateien übernommen: https://interfaceingame.com/screenshots/bloons-td-6-upgrade-already-owned/ und https://interfaceingame.com/games/bloons-td-6/ . Die resultierende Holz-/Pergamentgestaltung ist eigenständig.

Logo-Orientierung: Cardano https://cardano.org/brand-assets/ ; Chainlink https://chain.link/brand-assets ; Zcash https://z.cash/press/ ; Avalanche https://support.avax.network/en/collections/2358322-avalanche-basics . Vereinfachte Canvas-Zeichen für lesbare Spielgröße, keine Behauptung einer Markenfreigabe. Die Fähigkeiten sind ausschließlich erfundene Spielregeln und keine Aussagen über reale Blockchains.

Version 0.5: Drei eigene SVG-Cursor in assets/cursors (Pfeil, Handschuh, Bauziel), vollständig im Projekt gezeichnet. Audiomischung und Klangparameter in audio-mix.js selbst erstellt; keine Fremdaufnahmen. Gegner-/Bossübersicht verwendet unverändert denselben Coin-Renderer wie das Spiel und Daten aus config.js.

Version 0.6: Ansem-Bulle mit grünen Augen und Pump.fun-Pille sind eigene Canvas-Zeichnungen in coins.js, orientiert an den vom Nutzer gelieferten Dateien docs/references/ansem-bull-1.png, ansem-bull-2.png und pump-pill.png. USDT und HYPE erhalten vereinfachte, selbst gezeichnete Coinzeichen. Keine neuen externen Downloads oder Audiosamples.
