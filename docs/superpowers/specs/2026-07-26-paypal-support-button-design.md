# PayPal-Unterstützungsbutton – Designspezifikation

## Ziel

Die Sektion „Partner werden“ erhält einen dritten Aktionsbutton, über den Besucher Davids Road to Hawaii direkt über den bestehenden PayPal-Pool unterstützen können. Der Button soll sich visuell wie ein Bestandteil der vorhandenen Website anfühlen und zugleich durch eine kleine Triathlon-Animation Aufmerksamkeit erzeugen.

## Position und Layout

- Der Button wird innerhalb von `.partner-actions` direkt nach den beiden vorhandenen Aktionen eingefügt.
- Auf Desktop stehen „Gespräch vereinbaren“ und „Sponsoring-Konzept herunterladen“ weiterhin in der ersten Zeile.
- Der PayPal-Button beginnt darunter eine eigene zweite Zeile und ist links an den vorhandenen Aktionen ausgerichtet.
- Höhe, Innenabstände, rechteckige Form und Ecken entsprechen den vorhandenen Buttons.
- Auf schmalen Ansichten folgt der Button dem bestehenden mobilen Verhalten: Alle drei Aktionen werden untereinander in voller verfügbarer Breite dargestellt.
- Die vorhandenen Buttons dürfen durch die neue Zeilensteuerung weder in ihrer Größe noch in ihrem Verhalten verändert werden.

## Visuelle Gestaltung

Der neue Link verwendet die vorhandene Button-Gestaltung der Partner-Sektion:

- dunkler, mehrschichtiger Hintergrund,
- orangefarbene Akzent- und Textfarbe,
- vorhandene Schriftfamilie und Schriftstärke,
- `48px` Mindesthöhe,
- `4px` Eckenradius,
- vorhandener Fokus- und Interaktionscharakter.

Die kupferfarbene Pillenform, die cremefarbene Kreisfläche und die eigenständige Caprasimo-Typografie aus der gelieferten Referenzdatei werden nicht übernommen. Die Referenz dient ausschließlich als Vorlage für die detaillierte Triathlon-Animation.

## Inhalt und Ziel

- Sichtbare Beschriftung: `Mit PayPal unterstützen`
- Zieladresse: `https://www.paypal.com/pool/9rcUXMFriT?sr=accr`
- Der Link öffnet in einem neuen Tab.
- Der Link erhält `rel="noopener noreferrer"`.

## Triathlon-Animation

Links neben der stabilen Beschriftung befindet sich ein kompakter, fester Iconbereich. Die Beschriftung bewegt sich nicht.

Der Iconbereich zeigt nacheinander:

1. eine schwimmende Strichfigur mit Armzug, Beinschlag und bewegter Wasserlinie,
2. eine Radfahrfigur mit rotierenden Rädern und Tretbewegung,
3. eine laufende Strichfigur mit gegenläufigen Armen und Beinen sowie leichter Laufbewegung.

Jede Disziplin bleibt ungefähr zwei Sekunden sichtbar. Der vollständige Zyklus dauert sechs Sekunden und wiederholt sich dauerhaft. Die Übergänge erfolgen über eine kurze Skalierungs- und Einblendbewegung. Die Umsetzung nutzt ausschließlich eingebettetes SVG und CSS-Keyframes; JavaScript und zusätzliche Bibliotheken sind nicht erforderlich.

Der Iconbereich ist `aria-hidden="true"`, weil die Animation rein dekorativ ist. Die sichtbare Buttonbeschriftung trägt allein die verständliche Bedeutung des Links.

## Reduzierte Bewegung

Bei `prefers-reduced-motion: reduce` werden sämtliche Bewegungsanimationen deaktiviert. Als statisches Symbol bleibt die Schwimmfigur sichtbar. Der Button bleibt vollständig bedienbar und visuell als Unterstützungsaktion erkennbar.

## Interaktion und Barrierefreiheit

- Der vollständige Button ist ein semantischer Link.
- Hover und aktiver Zustand bleiben im Stil der bestehenden Partner-Aktionen.
- Die Tastaturfokussierung ist deutlich sichtbar.
- Die Animation darf die Beschriftung nicht verdecken oder die Buttonbreite verändern.
- Der Farbkontrast orientiert sich an den bereits verwendeten Farben der Partner-Sektion.
- Der Linktext ist ohne Animation verständlich.

## Technische Integration

- HTML-Anpassung: `mockups/landingpage-flow.html`
- CSS-Anpassung: `mockups/styles.css`
- Keine neue JavaScript-Datei
- Keine neue externe Schrift oder Bibliothek
- Keine Änderung an Newsfeed-, Kontakt- oder Artikelseiten
- Keine Änderung am PayPal-Ziel durch clientseitige Logik

Für den Zeilenumbruch erhält der neue Link eine eigene, klar benannte Klasse. Die Buttonbasis bleibt `.button.primary`; spezielle CSS-Regeln betreffen nur Positionierung und Animation des PayPal-Buttons.

## Verifikation

Automatisiert:

- Ein Test prüft das Vorhandensein des PayPal-Links, die exakte Zieladresse, `target="_blank"` und den sicheren `rel`-Wert.
- Ein Test prüft die drei SVG-Disziplinen und die Reduced-Motion-Regel.
- Der vollständige Testlauf `npm test` muss erfolgreich sein.
- `git diff --check` muss erfolgreich sein.

Im sichtbaren In-App-Browser:

- Desktop bei ungefähr `1280px`: zwei vorhandene Buttons in der ersten Zeile, PayPal-Button darunter; keine Verschiebung der Partnerkarte.
- Mobile bei `390px`: drei gleich breite Aktionen untereinander; Animation und Text ohne Überlauf.
- Schmale Mobile-Ansicht bei `360px`: keine abgeschnittene Beschriftung und kein horizontaler Seitenüberlauf.
- Linkziel und Öffnen in einem neuen Tab werden geprüft.
- Browserkonsole wird auf neue Fehler geprüft.
- Reduced-Motion-Verhalten wird geprüft, soweit die Browsersteuerung dies zuverlässig ermöglicht.

## Veröffentlichungsgrenze

Die Arbeit bleibt im Feature-Worktree auf `codex/paypal-support-button`. Es erfolgt kein Push ohne ausdrückliche Beteiligung des Users. Vor einem späteren Push wird ein Vercel-Preview-Deployment erstellt und gemeinsam geprüft. Erst nach erfolgreicher Preview, vollständigem Testlauf und ausdrücklicher Freigabe darf der Branch gepusht oder Production berührt werden.
