# Contact Form Hardening Design

## Ziel

Das vorhandene Kontaktformular soll ohne sichtbare zusätzliche Hürde sicherer und betrieblich robuster werden. Es bleibt ein einfaches Formular für Sponsoring-Anfragen, das Name, E-Mail-Adresse und Nachricht über eine Vercel Function an Resend übermittelt.

Das Paket schützt gegen triviale Bots, übergroße oder falsch formatierte Requests und hängende Resend-Anfragen. Gleichzeitig verbessert es Fehlerdiagnose, Tests, Datenschutzdokumentation und die spätere Einführung einer Content Security Policy.

## Abgrenzung

Dieses Paket umfasst lokale Code-, Test- und Dokumentationsänderungen. Es verändert noch keine Vercel-Firewall- oder Resend-Dashboard-Einstellungen und wird nicht gepusht oder deployed.

Nach diesem Paket folgen getrennt:

1. Vercel Rate Limiting für `POST /api/contact`
2. Prüfung beziehungsweise Austausch des Resend-Schlüssels gegen einen Schlüssel mit `sending_access`
3. Verifizierung der Absenderdomain mit SPF und DKIM sowie optional DMARC
4. Site-weite Security Header und Content Security Policy

## Betrachtete Ansätze

### 1. Code-Härtung plus Honeypot – ausgewählt

Das API validiert Request-Format, Größe und Felder streng, setzt einen Timeout für Resend und unterbindet Caching. Ein unsichtbares Honeypot-Feld filtert einfache Formularbots ohne Interaktion durch echte Besucher. Vercel Rate Limiting wird anschließend als zweite Schutzschicht ergänzt.

Dieser Ansatz bietet für die aktuelle, kleine Sponsoren-Website das beste Verhältnis aus Schutz, Wartbarkeit und geringer Nutzerreibung.

### 2. CAPTCHA sofort

Ein CAPTCHA oder Browser-Challenge wäre stärker gegen anspruchsvollere Bots, bringt aber eine zusätzliche externe Abhängigkeit, Datenschutzprüfung, Konfiguration und mögliche Barrieren für Besucher mit. Es wird erst ergänzt, wenn Honeypot und Rate Limiting im echten Betrieb nicht ausreichen.

### 3. Nur Vercel Rate Limiting

Rate Limiting reduziert Request-Mengen, löst aber keine Probleme bei falschem Content-Type, übergroßen Bodys, fehlerhafter Feldstruktur, Resend-Timeouts oder fehlender Fehlerdiagnose. Es ist deshalb eine ergänzende Plattformmaßnahme und kein Ersatz für die Code-Härtung.

## Komponenten

### `api/contact.js`

Das API bleibt eine einzelne Vercel Function und erhält fokussierte Hilfsfunktionen für:

- Header-Auslesen ohne Abhängigkeit von Groß-/Kleinschreibung
- Prüfung des Content-Type
- Bestimmung der Request-Größe
- JSON-Normalisierung mit erkennbarem Parse-Fehler
- typstrenge Feldnormalisierung und Längenprüfung
- zeitbegrenzten Resend-Aufruf
- datensparsame Fehlerprotokollierung

Der Handler bleibt über `createContactHandler(options)` testbar. Tests dürfen `env`, `fetch`, `timeoutMs` und `logger` injizieren. Der Produktionsstandard für `timeoutMs` beträgt 8.000 Millisekunden.

### `mockups/contact-form.js`

Die bisherige Inline-Logik aus `mockups/impressum.html` wird unverändert im sichtbaren Verhalten in eine eigene Datei verschoben. Das erleichtert später eine CSP ohne `unsafe-inline`.

Das Skript:

- liest Name, E-Mail, Nachricht und Honeypot aus
- sendet JSON an `/api/contact`
- deaktiviert den Button während des Requests
- setzt weiterhin die vorhandenen Statusmeldungen
- setzt das Formular nur nach erfolgreicher Antwort zurück

### `mockups/impressum.html` und `mockups/styles.css`

Das Formular erhält ein Feld `company_website`, das für normale Besucher nicht sichtbar und nicht per Tastatur erreichbar ist. Die CSS-Klasse blendet nur dieses Feld aus und verändert das sichtbare Layout nicht.

Das externe Skript wird mit `defer` geladen. Der bisherige Inline-Skriptblock entfällt vollständig.

### Datenschutz und Projektkontext

`mockups/datenschutz.html` nennt Resend als technischen Dienstleister für den E-Mail-Versand und verlinkt auf dessen Datenschutzhinweise. Die Formulierung beschreibt nur den tatsächlichen technischen Datenfluss und beansprucht keine abschließende Rechtsberatung. Der Stand der Datenschutzerklärung wird auf den 16.07.2026 aktualisiert.

`PROJECT_CONTEXT.md` dokumentiert den gehärteten Formularfluss, den Honeypot, die API-Grenzen und die noch offenen Dashboard-Maßnahmen.

`.vercelignore` gibt `mockups/contact-form.js` ausdrücklich frei.

## Request- und Datenfluss

1. Ein Besucher füllt die sichtbaren Felder aus; `company_website` bleibt leer.
2. Das externe Frontend-Skript sendet `application/json` an `POST /api/contact`.
3. Das API lehnt andere Methoden, falschen Content-Type, übergroße Bodys und ungültiges JSON ab.
4. Ein gefüllter Honeypot wird mit einer generischen erfolgreichen Antwort quittiert, ohne Resend aufzurufen. Dadurch erhält ein Bot kein verwertbares Signal.
5. Name, E-Mail und Nachricht müssen Strings sein, werden getrimmt und gegen feste Maximallängen geprüft.
6. Das API prüft die Resend-Konfiguration.
7. Der Resend-Aufruf erhält ein Abbruchsignal mit acht Sekunden Timeout.
8. Bei Erfolg antwortet das API mit `{ "ok": true }`; das Frontend leert das Formular und zeigt die bestehende Erfolgsmeldung.

Personenbezogene Formulardaten werden nicht in einer Projektdatenbank gespeichert.

## Validierung und Antworten

Maximalwerte:

- gesamter JSON-Body: 12.000 Bytes
- Name: 120 Zeichen
- E-Mail-Adresse: 180 Zeichen
- Nachricht: 4.000 Zeichen

Erlaubter Content-Type ist `application/json`, optional mit Parametern wie `charset=utf-8`.

Antworten:

- `405 METHOD_NOT_ALLOWED` für andere HTTP-Methoden
- `415 UNSUPPORTED_MEDIA_TYPE` für andere Content-Types
- `413 PAYLOAD_TOO_LARGE` für einen zu großen Request
- `400 INVALID_JSON` für nicht parsebares JSON
- `400 VALIDATION_ERROR` für fehlende, falsch typisierte oder zu lange Felder
- `200 { "ok": true }` für einen Honeypot-Treffer ohne Mailversand
- `500 MAIL_NOT_CONFIGURED` bei fehlender Serverkonfiguration
- `502 MAIL_SEND_FAILED` bei Resend-Fehlern, Netzwerkfehlern oder Timeout
- `200 { "ok": true }` nach erfolgreichem Versand

Jede JSON-Antwort setzt:

- `Content-Type: application/json; charset=utf-8`
- `Cache-Control: no-store`
- `X-Content-Type-Options: nosniff`

## Fehlerprotokollierung

Fehler werden über den injizierbaren Logger strukturiert und datensparsam protokolliert:

- bei einer nicht erfolgreichen Resend-Antwort nur der HTTP-Status
- bei Netzwerkfehlern oder Timeout nur der Fehlername, beispielsweise `AbortError`

Name, E-Mail-Adresse, Nachricht, Request-Body, Empfängeradresse und API-Key dürfen nicht protokolliert werden. Validierungsfehler und Honeypot-Treffer erzeugen standardmäßig keine Logs.

## Tests

Die API-Tests decken ab:

- andere HTTP-Methoden
- fehlenden oder falschen Content-Type
- Content-Type mit Charset
- übergroßen Body über Header und tatsächlich gemessene Body-Größe
- ungültiges JSON
- fehlende, falsch typisierte und zu lange Felder
- ungültige E-Mail-Adresse
- Honeypot ohne Resend-Aufruf
- fehlende Serverkonfiguration
- erfolgreichen Resend-Aufruf
- nicht erfolgreiche Resend-Antwort
- Netzwerkfehler
- Timeout und Weitergabe des Abbruchsignals
- `no-store`, `nosniff` und JSON-Content-Type auf Antworten
- Fehlerlogs ohne personenbezogene Inhalte

Ein zusätzlicher Seitentest prüft:

- Honeypot-Markup und zugehörige CSS-Klasse
- externes Formularskript statt Inline-Handler
- Versand des Honeypot-Felds
- Resend-Hinweis und aktualisierten Stand im Datenschutz
- Freigabe von `mockups/contact-form.js` durch die Deployment-Grenze

Danach laufen die vollständige Node-Test-Suite und JavaScript-Syntaxprüfungen.

## Visuelle Prüfung

Obwohl das Honeypot-Feld unsichtbar sein soll, wird `mockups/impressum.html` im sichtbaren In-App-Browser geprüft:

- Desktop bei breiter Ansicht
- Mobile bei 390 Pixeln
- kein zusätzlicher Abstand oder sichtbares Honeypot-Feld
- sichtbare Felder, Button und Statusbereich unverändert

Ein echter E-Mail-Versand ist lokal über den Python-Server nicht möglich und gehört in die spätere Vercel-Preview-Prüfung.

## Nicht Bestandteil dieses Pakets

- Vercel-Firewall- oder Rate-Limit-Änderungen
- Resend-Dashboard-, DNS- oder API-Key-Änderungen
- CAPTCHA oder Turnstile
- Idempotency-Key-Logik
- Origin-Prüfung als vermeintlicher Bot-Schutz
- site-weite Security Header oder CSP
- Änderungen an anderen Websitebereichen
- Push, Preview-Deployment oder Production-Deployment
