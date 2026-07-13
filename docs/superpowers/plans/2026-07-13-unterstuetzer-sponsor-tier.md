# Unterstützer-Sponsorenzeile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Den Sponsorenbereich um eine dritte Stufe „Unterstützer“ mit einer vollbreiten, auf `https://www.kfz-eisfeld.de/` verlinkten Eisfeld-Logokarte erweitern.

**Architecture:** Die Änderung erweitert das vorhandene statische `.sponsor-tier`-Markup und nutzt alle bestehenden Karten-, Hover-, Fokus- und Mobile-Regeln weiter. Eine schmale Modifier-Regel stellt für diese Stufe genau eine Logo-Spalte her; der vorhandene Node-Test prüft Link, Alternativtext und Kategorie-Icon strukturell.

**Tech Stack:** Statisches HTML5, CSS Grid, Node.js `node:test`, Codex In-App-Browser

## Global Constraints

- Die neue Stufe steht direkt unter der bestehenden Partner-Zeile.
- Die linke Beschriftung verwendet `Bilder Landingpage/Logos/Unterstützer.jpeg` und den Text „Unterstützer“.
- Die einzelne Logo-Karte verwendet `Bilder Landingpage/Logos/Unterstützer/Eisfeld.png` und füllt die rechte Spalte ohne leere Rasterplätze.
- Der externe Link lautet exakt `https://www.kfz-eisfeld.de/`, öffnet einen neuen Tab und verwendet `rel="noopener noreferrer"`.
- Der Alternativtext lautet „KFZ Meisterbetrieb Eisfeld“; der zugängliche Linkname lautet „KFZ Meisterbetrieb Eisfeld Website öffnen“.
- Die visuelle Prüfung erfolgt ausschließlich im In-App-Browser bei 1280 px, 390 px und 360 px.

---

### Task 1: Unterstützer-Stufe ergänzen und verifizieren

**Files:**
- Modify: `tests/sponsor-links.test.js`
- Modify: `mockups/landingpage-flow.html:274-347`
- Modify: `mockups/styles.css:1803-1809`
- Add existing asset: `Bilder Landingpage/Logos/Unterstützer.jpeg`
- Add existing asset: `Bilder Landingpage/Logos/Unterstützer/Eisfeld.png`

**Interfaces:**
- Consumes: Vorhandene CSS-Klassen `.sponsor-tier`, `.sponsor-tier-label`, `.sponsor-tier-icon`, `.sponsor-tier-logos`, `.sponsor-logo-card` und `.sponsor-main`.
- Produces: Ein `<section class="sponsor-tier sponsor-tier-supporters" aria-label="Unterstützer">` mit genau einer verlinkten Sponsorenkarte; eine Modifier-Regel `.sponsor-tier-supporters .sponsor-tier-logos` mit einer Logo-Spalte.

- [ ] **Step 1: Den strukturellen Test zuerst erweitern**

In `tests/sponsor-links.test.js` den Sponsor in `expectedSponsors` ergänzen:

```js
  ["KFZ Meisterbetrieb Eisfeld", "https://www.kfz-eisfeld.de/"],
```

Im Test `sponsor tier labels include compact category icons` diese Assertion ergänzen:

```js
  assert.match(
    html,
    /<p class="sponsor-tier-label">\s*<img\s+class="sponsor-tier-icon"\s+src="\.\.\/Bilder%20Landingpage\/Logos\/Unterst%C3%BCtzer\.jpeg"\s+alt=""\s+aria-hidden="true"\s*\/>\s*<span>Unterstützer<\/span>\s*<\/p>/,
  );
```

Im Layout-Test diese Assertion ergänzen:

```js
  assert.match(
    css,
    /\.sponsor-tier-supporters\s+\.sponsor-tier-logos\s*\{[\s\S]*?grid-template-columns:\s*1fr;/,
  );
```

- [ ] **Step 2: Den gezielten Test ausführen und das erwartete Fehlschlagen bestätigen**

Run: `node --test tests/sponsor-links.test.js`

Expected: FAIL, weil Eisfeld-Link, Unterstützer-Icon-Markup und `.sponsor-tier-supporters` noch fehlen.

- [ ] **Step 3: Die neue Sponsorenstufe in das bestehende Markup einfügen**

In `mockups/landingpage-flow.html` direkt nach `section.sponsor-tier-partners` und vor dem schließenden Tag von `.sponsor-tiers` einfügen:

```html
              <section class="sponsor-tier sponsor-tier-supporters" aria-label="Unterstützer">
                <p class="sponsor-tier-label">
                  <img
                    class="sponsor-tier-icon"
                    src="../Bilder%20Landingpage/Logos/Unterst%C3%BCtzer.jpeg"
                    alt=""
                    aria-hidden="true"
                  />
                  <span>Unterstützer</span>
                </p>
                <div class="sponsor-tier-logos">
                  <a
                    class="sponsor-logo-card sponsor-main"
                    href="https://www.kfz-eisfeld.de/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="KFZ Meisterbetrieb Eisfeld Website öffnen"
                  >
                    <img
                      src="../Bilder%20Landingpage/Logos/Unterst%C3%BCtzer/Eisfeld.png"
                      alt="KFZ Meisterbetrieb Eisfeld"
                    />
                  </a>
                </div>
              </section>
```

- [ ] **Step 4: Das Einzelkartenraster ergänzen**

In `mockups/styles.css` nach `.sponsor-tier-exclusive .sponsor-tier-logos` ergänzen:

```css
.sponsor-tier-supporters .sponsor-tier-logos {
  grid-template-columns: 1fr;
}
```

Keine eigene Hover-, Fokus- oder Mobile-Regel anlegen; die vorhandenen Regeln gelten unverändert weiter.

- [ ] **Step 5: Den gezielten Test und anschließend die gesamte Testsuite ausführen**

Run: `node --test tests/sponsor-links.test.js`

Expected: PASS für alle Tests in `tests/sponsor-links.test.js`.

Run: `npm test`

Expected: PASS für die vollständige Testsuite.

- [ ] **Step 6: Desktop im In-App-Browser prüfen**

Die laufende Seite `http://127.0.0.1:4173/mockups/landingpage-flow.html` neu laden, den Viewport auf 1280 px Breite setzen und den Sponsorenbereich prüfen:

- Unterstützer-Zeile steht direkt unter Partner.
- Kategorie-Icon, Text und Eisfeld-Logo werden geladen.
- Die Eisfeld-Karte füllt die rechte Spalte ohne leere Zellen.
- Rahmen, Hintergrund, Abstände sowie Hover- und Fokusdarstellung passen zu den bestehenden Stufen.
- Der `href` der einzelnen Karte ist exakt `https://www.kfz-eisfeld.de/`.

- [ ] **Step 7: Mobile im In-App-Browser prüfen**

Den Viewport nacheinander auf 390 px und 360 px setzen und prüfen:

- Kategoriezeile und Logo-Karte stapeln sich wie bei Exklusivpartner und Partner.
- Kein horizontaler Überlauf entsteht.
- Das vollständige Eisfeld-Logo bleibt sichtbar und lesbar.

Den temporären Viewport-Override danach zurücksetzen und den Tab auf der fertigen Projektseite sichtbar geöffnet lassen.

- [ ] **Step 8: Nur die Feature-Dateien committen**

```powershell
git add -- 'tests/sponsor-links.test.js' 'mockups/landingpage-flow.html' 'mockups/styles.css' 'Bilder Landingpage/Logos/Unterstützer.jpeg' 'Bilder Landingpage/Logos/Unterstützer/Eisfeld.png'
git commit -m "Add Eisfeld supporter sponsor tier"
```

Expected: Der Commit enthält nur Test, HTML, CSS und die beiden Unterstützer-Assets; `PROJECT_CONTEXT.md` und `Bilder Landingpage/Eisfeld Visa.pdf` bleiben unberührt.
