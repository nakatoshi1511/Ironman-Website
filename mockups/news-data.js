export const newsArticles = [
  {
    slug: "17-stunden-zum-ruhm",
    url: "newsfeed-17-stunden-zum-ruhm.html",
    title: "17 Stunden zum Ruhm - Mythos Ironman Hawaii",
    teaser: "Wie alles begann - Ein Buch, ein Polizeieinsatz und ein großer Traum",
    category: "Road to Hawaii",
    dateLabel: "06.07.2026",
    dateTime: "2026-07-06",
    image: "../Bilder%20Landingpage/Newsfeed/Artikel%2001/Mythos%20Ironman.jpeg",
    imageAlt: "Buchcover 17 Stunden zum Ruhm - Mythos Ironman Hawaii",
    mediaCaption: "Das Buch, das aus einer losen Idee einen echten Hawaii-Traum gemacht hat.",
    blocks: [
      {
        type: "lead",
        text: "Wenn mir vor 10 Jahren jemand gesagt hätte, dass ich im Oktober 2026 an der Startlinie des legendärsten Triathlons der Welt stehen würde, hätte ich ihn vermutlich belächelt. Und doch sitze ich jetzt hier, halte das Ticket für die Ironman-Weltmeisterschaft auf Hawaii in den Händen und kann es selbst kaum fassen.",
      },
      {
        type: "lead",
        text: "Um zu verstehen wie es dazu kam, müssen wir die Uhr zurückdrehen. Genau 10 Jahre. In das Jahr 2016.",
      },
      {
        type: "paragraph",
        text: "Nachdem ich 2014 meine Karriere als professioneller Mountainbiker beendet hatte, spielte ich immer mal wieder mit dem Gedanken, einen Triathlon zu absolvieren. Aber so richtig wollte der Funke mit Blick auf den damit verbundenen Trainingsaufwand nicht überspringen. Das änderte sich im Frühjahr 2016, als mir ein Arbeitskollege während eines Einsatzes mit der Bereitschaftspolizei ein Buch in die Hände drückte: „17 Stunden zum Ruhm - Mythos Ironman Hawaii“ von Mathias Müller. Ich fing an zu blättern, las die ersten Seiten und war sofort gefesselt. Das Buch beschreibt die Faszination, die Qualen und den unbändigen Willen, den es braucht, um die 3,8 km Schwimmen, 180 km Radfahren und 42,195 km Laufen auf Big Island zu bezwingen. 17 Stunden - das ist das offizielle Zeitlimit, um sich an diesem Tag „Ironman“ nennen zu dürfen.",
      },
      {
        type: "media",
      },
      {
        type: "paragraph",
        text: "Was mich beim Lesen besonders gepackt hat, war eine fundamentale Erkenntnis: Bei diesem Rennen geht es für die absolute Mehrheit nicht um Platzierungen, Podestplätze oder Preisgelder. Es geht einzig und allein um die Frage, ob und wie schnell man diese extreme Distanz bezwingen kann. Der Ironman ist in erster Linie kein Wettkampf gegen die Konkurrenz, es ist der ultimative Kampf gegen sich selbst, den eigenen Körper und den inneren Schweinehund.",
      },
      {
        type: "paragraph",
        text: "Obwohl der Ironman Hawaii natürlich auch mir ein Begriff war, entfachten erst diese 17 bewegenden Schicksale in dem Buch ein echtes Feuer in mir. Aus einer vagen Vorstellung wurde plötzlich ein handfester Traum: Ich wollte selbst einmal auf Big Island an den Start gehen. Und der erste Schritt ließ nicht lange auf sich warten, denn nur wenige Monate später fand ich mich tatsächlich bei meinem allerersten Triathlon an der Startlinie wieder.",
      },
    ],
  },
];

export function getArticleBySlug(slug) {
  return newsArticles.find((article) => article.slug === slug);
}
