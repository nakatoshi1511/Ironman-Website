# Roadmap: integrierte Meilensteine

## Ziel

Die vier separaten Roadmap-Kacheln werden entfernt. Stattdessen erscheinen die Meilensteine als Teil der bestehenden Illustration `RoadmapV2.png`: Helle, hochwertige "Race Credentials" hängen über feine vertikale Verbindungslinien direkt an der Strecken-Grafik.

Die Darstellung bleibt seriös, sportlich und editorial. Die Illustration führt; die Meilensteine unterstützen die Geschichte, ohne eine zweite Karten-Sektion zu bilden.

## Umfang

Betroffen sind ausschließlich die Roadmap im Tab „Leistung & Vision“ der [Landingpage](../../../mockups/landingpage-flow.html) und die zugehörigen Regeln in [styles.css](../../../mockups/styles.css).

Nicht Bestandteil sind Änderungen an Hero, Profil, Newsfeed, Countdown, Navigation, Assets oder den übrigen Landingpage-Sektionen.

## Inhalt und Reihenfolge

Die Meilensteine werden von links nach rechts genau in dieser Reihenfolge dargestellt:

1. Ironman Lanzarote – Qualifikation für Hawaii
2. Mittelmosel Triathlon
3. Leistungsdiagnostik (September)
4. Finaler Vorbereitungswettkampf (August)

Es werden keine zusätzlichen Daten, Beschreibungen, Statusmarkierungen oder Interaktionen ergänzt.

## Aufbau

Die bisher getrennten Elemente `.roadmap-art` und `.roadmap-milestones` werden zu einer gemeinsamen horizontalen Roadmap-Szene zusammengeführt:

- Die bestehende Illustration bleibt unverändert und bildet den oberen Bereich der Szene.
- Vier semantische Meilenstein-Elemente liegen in derselben Szene unterhalb der Illustration.
- Jedes Element wird durch eine schlanke vertikale Linie und einen kleinen orangefarbenen Ankerpunkt mit der Grafik verbunden.
- Die Karten folgen der gewählten Richtung „Race Credentials“: warmes Papier, feine dunkle Kontur, klarer orangefarbener Kopfbereich, kräftige kondensierte Überschrift.
- Kartenhöhe und Verbindungslänge alternieren leicht, damit die Strecke einen natürlichen Rhythmus behält und die Karten sich nicht gegenseitig stören.

Die Elemente werden über robuste Positionsvariablen entlang einer gemeinsamen Breite ausgerichtet, nicht über JavaScript oder separate Layout-Reihen unterhalb der Grafik.

## Responsives Verhalten

- Desktop: Illustration und alle vier Credentials bilden eine zusammenhängende Komposition innerhalb der Roadmap-Fläche.
- Mobile: Die gesamte Szene behält eine ausreichend breite, gemeinsame Koordinatenfläche und ist horizontal scrollbar. Dadurch bleiben Bild, Ankerpunkte, Linien und Karten präzise zueinander ausgerichtet.
- Die vorhandene horizontale Scroll-Entscheidung für das Roadmap-Visual bleibt erhalten.
- Die Karten bleiben lesbar und werden auf engen Geräten nicht gestapelt oder aus der Streckenbeziehung gelöst.

## Zugänglichkeit

- Die Meilensteine bleiben als echte Textinhalte im DOM und sind unabhängig von der Illustration lesbar.
- Die bestehende Bildbeschreibung wird beibehalten.
- Die Roadmap-Szene erhält eine eindeutige zugängliche Bezeichnung für die Meilensteine.
- Es gibt keine ausschließlich über Farbe vermittelte Information.

## Prüfung

- Desktop-Prüfung im In-App-Browser bei etwa 1280 px Breite.
- Mobile-Prüfung im In-App-Browser bei 390 px und 360 px: horizontaler Scrollbereich, Kartenabstände und die Zuordnung von Linie zu Karte.
- Bestehende Tests mit `npm test` ausführen.
