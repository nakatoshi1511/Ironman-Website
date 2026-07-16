# Vercel Deployment Boundary Design

## Ziel

Die produktive Vercel-Veröffentlichung soll ausschließlich die laufzeitrelevanten Teile der Website enthalten. Tests, Projektdokumentation, Entwurfsseiten, lokale Werkzeuge und Quelldateien bleiben weiterhin im Git-Repository, dürfen aber nicht mehr über erratbare öffentliche URLs erreichbar sein.

Die Lösung muss zukünftige Newsartikel, Newsbilder und Sponsorenlogos ohne eine manuell zu pflegende Liste einzelner Dateien unterstützen.

## Abgrenzung dieses Sicherheitspakets

Dieses Paket behandelt ausschließlich die Vercel-Veröffentlichungsgrenze. Änderungen am Kontaktformular, Rate Limiting, Security Header, Content Security Policy, Datenschutzerklärung und Lightbox-Zugänglichkeit folgen als getrennte, überprüfbare Sicherheitspakete.

Es erfolgen kein Push, kein Preview-Deployment und kein Production-Deployment ohne eine weitere ausdrückliche Freigabe des Users.

## Betrachtete Ansätze

### 1. Regelbasierte `.vercelignore`-Freigabeliste – ausgewählt

Standardmäßig werden alle Dateien ausgeschlossen. Anschließend werden nur definierte Produktionsseiten, Laufzeitskripte, die Kontakt-API und kontrollierte Asset-Bereiche wieder freigegeben.

Vorteile:

- kleine Änderung ohne Umbau der bestehenden URLs
- klare Trennung zwischen Git-Inhalt und Deployment-Inhalt
- neue Artikel, Newsbilder und Sponsorenlogos funktionieren über dokumentierte Namens- und Ablageregeln
- versehentlich neu hinzugefügte Projektdateien bleiben standardmäßig unveröffentlicht

Nachteil:

- die Regeln und die vereinbarten Ablagekonventionen müssen gemeinsam gepflegt und automatisiert geprüft werden

### 2. Eigener öffentlicher Ausgabeordner

Ein Build-Schritt kopiert alle benötigten Dateien in ein separates Deployment-Verzeichnis.

Vorteil: strukturell sehr klare Produktionsgrenze. Nachteil: deutlich größerer Umbau mit zusätzlichem Build-Prozess, Pfadänderungen und höherem Fehlerrisiko für die bestehende statische Website. Dieser Ansatz ist für den aktuellen Projektumfang nicht erforderlich.

### 3. Sperrliste bekannter interner Dateien

Nur aktuell bekannte interne Verzeichnisse und Dateitypen werden ausgeschlossen.

Vorteil: geringe Anfangsarbeit. Nachteil: neue interne Dateien werden leicht vergessen und dadurch automatisch veröffentlicht. Dieser Ansatz erfüllt das Sicherheitsziel nicht zuverlässig.

## Veröffentlichungsmodell

Die `.vercelignore` arbeitet nach dem Prinzip „standardmäßig gesperrt, ausdrücklich freigegeben“.

### Produktive Seiten und Laufzeitdateien

Freigegeben werden:

- `index.html`
- die aktive Landingpage, der Newsfeed, Impressum und Datenschutz
- die beiden bestehenden Artikelseiten
- zukünftige Artikelseiten nach dem Muster `mockups/newsfeed-*.html`
- `mockups/styles.css`
- `mockups/news-data.js`
- `mockups/newsfeed-render.js`
- `mockups/article-render.js`
- `api/contact.js`
- eine spätere `vercel.json`, damit weitere Sicherheitsmaßnahmen in einem eigenen Paket ergänzt werden können

Entwurfs- und Variantendateien mit Bezeichnungen wie `design-mockups`, `countdown-designs`, `sponsor-section-mockups` und `mockups/index.html` bleiben ausdrücklich ausgeschlossen. Die bestehende Datei `mockups/newsfeed-design-mockups.html` darf trotz des allgemeinen Artikelmusters nicht freigegeben werden.

### Erweiterbare Asset-Bereiche

Neue Dateien werden automatisch berücksichtigt, wenn sie in den vorgesehenen Produktionsbereichen liegen und ein unterstütztes Webformat verwenden:

- Newsbilder unter `Bilder Landingpage/Newsfeed/`
- Sponsorenlogos unter `Bilder Landingpage/Logos/`
- die aktuell genutzten Hero-, Profil-, Zieleinlauf- und Roadmap-Bilder

Für die erweiterbaren Bildbereiche werden nur Web-Bildformate wie `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` und `.svg` freigegeben. Quelldateien wie `.docx`, `.zip`, `.pdf`, Photoshop-Dateien oder beliebige andere Dateitypen bleiben gesperrt. Dadurch wird beispielsweise `Bilder Landingpage/Newsfeed/Artikel 02/Toskana.docx` nicht veröffentlicht, während neue Artikelbilder im selben Artikelordner automatisch funktionieren.

Der vorhandene Sponsoring-Download wird als einzelne PDF ausdrücklich freigegeben. Andere PDFs werden nicht automatisch veröffentlicht.

## Konventionen für zukünftige Inhalte

### Neuer Newsartikel

1. Die Artikelseite erhält einen Dateinamen nach dem vorhandenen Muster `mockups/newsfeed-<slug>.html`.
2. Der Datensatz wird in `mockups/news-data.js` ergänzt.
3. Artikelbilder werden unter `Bilder Landingpage/Newsfeed/Artikel XX/` als Web-Bilddateien abgelegt.
4. Entwürfe und Quelldokumente dürfen im Repository bleiben, werden aber nicht mit einer freigegebenen Web-Dateiendung verwechselt.

### Neuer Sponsor

1. Das Logo wird im passenden Unterordner unter `Bilder Landingpage/Logos/` als Web-Bilddatei abgelegt.
2. Der Sponsor wird in der aktiven Landingpage ergänzt.
3. Weitere Dokumente oder Rohdaten werden nicht in ein Web-Bildformat umbenannt und dadurch nicht unbeabsichtigt veröffentlicht.

Für diese normalen Erweiterungen ist keine Änderung an `.vercelignore` erforderlich.

## Automatisierte Prüfungen

Ein neuer Deployment-Boundary-Test prüft mindestens:

- alle produktiven Kernseiten, Laufzeitskripte und die Kontakt-API sind freigegeben
- bestehende und zukünftig in `news-data.js` eingetragene Artikelseiten entsprechen dem veröffentlichten Artikelschema
- von den aktiven Seiten und Newsdaten referenzierte lokale Produktionsassets sind freigegeben
- bekannte interne Dateien wie `PROJECT_CONTEXT.md`, `tests/contact.test.js`, Projektdokumentation, Entwurfsseiten, DOCX- und ZIP-Dateien bleiben ausgeschlossen
- die speziellen Ausschlüsse für Design-Mockups haben Vorrang vor dem allgemeinen Newsartikelmuster

Die Prüfung soll die tatsächlichen Regeln aus `.vercelignore` auswerten und nicht nur nach einzelnen Textzeilen suchen. Dadurch werden Reihenfolge und Vorrang der Regeln mitgeprüft.

Zusätzlich laufen:

- die vollständige bestehende Node-Test-Suite
- Syntaxprüfungen der betroffenen JavaScript-Dateien
- eine lokale HTTP-Prüfung aller aktiven Seiten und ihrer referenzierten lokalen Assets
- wenn die bereits vorhandene lokale Vercel-CLI ohne Installation nutzbar ist, ein lokaler Vercel-Build mit Kontrolle des erzeugten Outputs

Die `.vercelignore` beeinflusst den lokalen Python-Server nicht. Daher muss die Deployment-Grenze automatisiert oder über einen Vercel-Build geprüft werden; ein normaler lokaler Seitenaufruf allein reicht dafür nicht aus.

## Fehlerverhalten und Wartbarkeit

Wenn ein neuer produktiver Artikel oder ein neues referenziertes Asset nicht von den Regeln erfasst wird, schlägt der Test vor einem Commit beziehungsweise Deployment fehl. Die bevorzugte Korrektur ist, die vereinbarte Dateiablage oder Benennung einzuhalten. Die Freigabeliste wird nur erweitert, wenn tatsächlich eine neue Produktionskategorie benötigt wird.

Neue unbekannte Dateien sind standardmäßig nicht öffentlich. Das ist die sichere Fehlerrichtung: Eine falsch abgelegte Datei kann im Deployment fehlen, wird aber nicht versehentlich veröffentlicht.

## Nicht Bestandteil dieses Pakets

- Löschen weiterer Repository-Dateien
- Umschreiben der Git-Historie
- Umbenennen bestehender öffentlicher URLs
- Änderungen am sichtbaren Website-Design
- Kontaktformular-Härtung oder Bot-Schutz
- Security Header oder Content Security Policy
- Vercel-Dashboard-, Resend- oder Firewall-Konfiguration
- Push oder Deployment
