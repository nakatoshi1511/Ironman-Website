# To-do before live

## Vor dem aktiven Bewerben der Website

- [ ] Kontaktformular einmal vollständig live testen
  - Testanfrage über die Produktionswebsite absenden.
  - Eingang im vorgesehenen Postfach prüfen.
  - Absender, Antwortadresse und Inhalt der E-Mail kontrollieren.

- [x] Rate Limiting für `POST /api/contact` einrichten
  - Passende Regel in der Vercel Firewall konfigurieren.
  - Prüfen, dass normale Anfragen weiterhin funktionieren.
  - Honeypot und bestehende serverseitige Validierung bleiben zusätzlich aktiv.

- [x] Resend-Konfiguration kontrollieren
  - API-Schlüssel auf reinen Versandzugriff (`sending_access`) begrenzen.
  - Absenderdomain in Resend verifizieren.
  - SPF und DKIM prüfen.
  - DMARC nach Möglichkeit ergänzen.

- [ ] Site-weite Security Header einrichten und testen
  - Content Security Policy (CSP)
  - `X-Content-Type-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - Schutz vor Einbettung in fremde Frames
  - Startseite, Newsfeed, Artikel, Rechtstexte und Kontaktformular danach erneut prüfen.

- [ ] Abschließenden Gesamt-Code-Review durchführen
  - Sicherheit und Datenschutz
  - Barrierefreiheit
  - Desktop- und Mobile-Darstellung
  - SEO-Grundlagen
  - Fehlerfälle und Wartbarkeit

## Sinnvolle Veröffentlichungsthemen

- [x] Eigene Domain verbinden.
- [ ] Seitentitel und Meta-Descriptions abschließend prüfen.
- [ ] Social-Media-Vorschaubilder und Open-Graph-Daten ergänzen.
- [ ] Favicon ergänzen.
- [ ] `robots.txt` und Sitemap ergänzen.
- [ ] Fehlerüberwachung oder Benachrichtigungen für Produktionsfehler einrichten.

## Nur bei tatsächlichem Bedarf

- [ ] CAPTCHA oder Turnstile ergänzen, falls trotz Honeypot und Rate Limiting weiterhin relevanter Formular-Spam auftritt.

## Bereits vorhanden

- [x] Website ist über Vercel erreichbar.
- [x] Git-Stand ist auf `main` mit GitHub synchronisiert.
- [x] Vercel veröffentlicht nur die freigegebene Laufzeitoberfläche.
- [x] Kontaktformular validiert Eingaben serverseitig und verwendet einen Honeypot.
- [x] HTTPS und HSTS sind aktiv.
- [x] Benötigte Vercel-Environment-Variablen sind angelegt.
- [x] Automatisierte Tests für Kontaktformular und Deployment-Grenze sind vorhanden.
- [x] `npm audit` meldet aktuell keine bekannten Schwachstellen.
