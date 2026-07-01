import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "outputs/road_to_hawaii_tracker";
const outputPath = `${outputDir}/road_to_hawaii_todos_aenderungen.xlsx`;

await fs.mkdir(outputDir, { recursive: true });

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("To Dos & Aenderungen");

sheet.showGridLines = false;

sheet.getRange("A1:H1").merge();
sheet.getRange("A1").values = [["Road to Hawaii - To Dos & Aenderungen"]];
sheet.getRange("A1").format = {
  fill: "#17324D",
  font: { bold: true, color: "#FFFFFF", size: 16 },
  horizontalAlignment: "left",
  verticalAlignment: "middle",
};
sheet.getRange("A1:H1").format.rowHeightPx = 34;

sheet.getRange("A2:H2").merge();
sheet.getRange("A2").values = [["Gemeinsame kompakte Liste fuer Aufgaben, Feedback und umgesetzte Aenderungen."]];
sheet.getRange("A2").format = {
  font: { color: "#516070", italic: true },
  fill: "#F5F7FA",
};

const headers = [
  "ID",
  "Typ",
  "Bereich",
  "To Do / Aenderung",
  "Verantwortlich",
  "Prioritaet",
  "Status",
  "Faellig / Notiz",
];

const rows = [
  [1, "To Do", "Landingpage", "Hero-Bild und Headline final abstimmen", "Radem", "Hoch", "Offen", ""],
  [2, "Aenderung", "Inhalt", "Texte auf Klarheit und Ton pruefen", "David", "Mittel", "In Arbeit", ""],
  [3, "Feedback", "Design", "Mobile Ansicht gemeinsam checken", "Radem / David", "Mittel", "Offen", ""],
  [4, "To Do", "Launch", "Offene Punkte vor Veroeffentlichung sammeln", "", "Niedrig", "Offen", ""],
];

sheet.getRange("A4:H4").values = [headers];
sheet.getRange("A5:H8").values = rows;
sheet.getRange("A4:H4").format = {
  fill: "#E8EEF4",
  font: { bold: true, color: "#1F2A37" },
  borders: { preset: "all", style: "thin", color: "#CBD5E1" },
};
sheet.getRange("A5:H54").format = {
  borders: { preset: "all", style: "thin", color: "#E5E7EB" },
  verticalAlignment: "top",
  wrapText: true,
};
sheet.getRange("A4:H54").format.font = { size: 10 };

sheet.getRange("A:A").format.columnWidthPx = 46;
sheet.getRange("B:B").format.columnWidthPx = 94;
sheet.getRange("C:C").format.columnWidthPx = 126;
sheet.getRange("D:D").format.columnWidthPx = 280;
sheet.getRange("E:E").format.columnWidthPx = 132;
sheet.getRange("F:F").format.columnWidthPx = 92;
sheet.getRange("G:G").format.columnWidthPx = 104;
sheet.getRange("H:H").format.columnWidthPx = 168;
sheet.getRange("A5:A103").setNumberFormat("0");

const table = sheet.tables.add("A4:H54", true, "TodosAenderungen");
table.style = "TableStyleLight9";
table.showFilterButton = true;

sheet.getRange("B5:B54").dataValidation = { rule: { type: "list", values: ["To Do", "Aenderung", "Feedback"] } };
sheet.getRange("F5:F54").dataValidation = { rule: { type: "list", values: ["Hoch", "Mittel", "Niedrig"] } };
sheet.getRange("G5:G54").dataValidation = { rule: { type: "list", values: ["Offen", "In Arbeit", "Wartet", "Erledigt"] } };

sheet.getRange("F5:F54").conditionalFormats.add("containsText", {
  text: "Hoch",
  format: { fill: "#FEE2E2", font: { color: "#991B1B", bold: true } },
});
sheet.getRange("G5:G54").conditionalFormats.add("containsText", {
  text: "Erledigt",
  format: { fill: "#DCFCE7", font: { color: "#166534", bold: true } },
});
sheet.getRange("G5:G54").conditionalFormats.add("containsText", {
  text: "In Arbeit",
  format: { fill: "#FEF3C7", font: { color: "#92400E", bold: true } },
});

sheet.getRange("J4:K4").values = [["Status", "Anzahl"]];
sheet.getRange("J5:J8").values = [["Offen"], ["In Arbeit"], ["Wartet"], ["Erledigt"]];
sheet.getRange("K5").formulas = [["=COUNTIF($G$5:$G$54,J5)"]];
sheet.getRange("K5:K8").fillDown();
sheet.getRange("J4:K8").format = {
  borders: { preset: "all", style: "thin", color: "#CBD5E1" },
};
sheet.getRange("J4:K4").format = {
  fill: "#17324D",
  font: { bold: true, color: "#FFFFFF" },
};
sheet.getRange("J:J").format.columnWidthPx = 100;
sheet.getRange("K:K").format.columnWidthPx = 68;

sheet.getRange("J10:K10").values = [["Prioritaet", "Anzahl"]];
sheet.getRange("J11:J13").values = [["Hoch"], ["Mittel"], ["Niedrig"]];
sheet.getRange("K11").formulas = [["=COUNTIF($F$5:$F$54,J11)"]];
sheet.getRange("K11:K13").fillDown();
sheet.getRange("J10:K13").format = {
  borders: { preset: "all", style: "thin", color: "#CBD5E1" },
};
sheet.getRange("J10:K10").format = {
  fill: "#17324D",
  font: { bold: true, color: "#FFFFFF" },
};

sheet.freezePanes.freezeRows(4);
sheet.freezePanes.freezeColumns(1);

const check = await workbook.inspect({
  kind: "table",
  range: "To Dos & Aenderungen!A1:K14",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 12,
});
console.log(check.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 50 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

const preview = await workbook.render({
  sheetName: "To Dos & Aenderungen",
  range: "A1:K14",
  scale: 1,
  format: "png",
});
await fs.writeFile(`${outputDir}/road_to_hawaii_tracker_preview.png`, new Uint8Array(await preview.arrayBuffer()));

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);

console.log(`Saved ${outputPath}`);
