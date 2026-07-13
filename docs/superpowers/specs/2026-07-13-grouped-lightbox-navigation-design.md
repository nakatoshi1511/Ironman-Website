# Gruppierte Lightbox-Navigation – Design

## Ziel

Die vergrößerte Bildansicht soll innerhalb einer bewusst definierten Bildgruppe vor- und zurückblättern können. Bilder aus anderen Abschnitten desselben Artikels dürfen nicht in diese Navigation einfließen.

## Bildgruppen für den Toskana-Artikel

- Mittelmosel: `02.jpeg` als Hauptbild sowie `01.jpeg`, `03.jpeg` und `04.jpeg` als Vorschauen. Reihenfolge in der Lightbox: `02`, `01`, `03`, `04`.
- Toskana: `15.jpeg` als Hauptbild sowie `10.jpeg`, `12.jpeg` und `13.jpeg` als Vorschauen. Reihenfolge in der Lightbox: `15`, `10`, `12`, `13`.
- `11.jpeg` bleibt ein einzelnes Bild ohne Blätterfunktion.
- `14.jpeg` bleibt ausschließlich das Titelbild der News-Kachel.

## Interaktion

- Das Öffnen eines Haupt- oder Vorschaubilds einer Gruppe zeigt das gewählte Bild direkt in der vorhandenen Lightbox.
- In einer Gruppe erscheinen links und rechts Pfeil-Schaltflächen sowie ein Zähler im Format `1 / 4`.
- Die Pfeile wechseln nur innerhalb der aktuell geöffneten Gruppe und laufen am ersten beziehungsweise letzten Bild zyklisch weiter.
- Ein einzelnes Bild wie `11.jpeg` verwendet weiterhin die bisherige Lightbox ohne Pfeile und Zähler.
- Schließen per Schließen-Schaltfläche, Hintergrund oder Escape bleibt unverändert.

## Technischer Zuschnitt

- Die Artikeldaten erhalten eine explizite Gruppenkennung und Reihenfolge für die betroffenen Haupt- und Vorschaubilder.
- Der Renderer übergibt diese Metadaten über die bestehenden `data-lightbox-*`-Attribute an die Lightbox.
- Die Lightbox verwaltet die aktuell geöffnete Gruppe und den Index; sie erzeugt keine Gruppen aus der räumlichen Artikelreihenfolge.
- Neue Lightbox-Steuerelemente sind echte Buttons mit eindeutigen zugänglichen Namen. Bei Einzelbildern sind sie verborgen beziehungsweise nicht bedienbar.

## Darstellung und Prüfung

- Die Pfeile liegen innerhalb der Lightbox, ohne das Bild auf Desktop oder Mobile zu verdecken. Der Zähler bleibt dezent am unteren Rand des Bildbereichs.
- Tests prüfen Gruppenreihenfolge, Direktöffnung einer Vorschau, zyklischen Vor-/Rückwechsel und die fehlenden Steuerelemente für Einzelbilder.
- Die Browserprüfung umfasst Desktop und 390 px Mobile sowie die bestehende Schließen-Funktion.

## Inhaltsgrenze

Es werden keine Bildunterschriften, Alt-Texte, Labels oder sonstigen redaktionellen Inhalte ergänzt. Die Beschriftungen der technischen Steuerelemente dienen ausschließlich der Bedienbarkeit.
