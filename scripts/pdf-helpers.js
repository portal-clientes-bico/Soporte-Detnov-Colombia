const PDFDocument = require("pdfkit");
const fs = require("fs");

const MARGIN = 56;
const COLOR_TITLE = "#0b3d5c";
const COLOR_ACCENT = "#c0392b";
const COLOR_TEXT = "#222222";
const COLOR_MUTED = "#5a5a5a";
const COLOR_RULE = "#c9d6dd";

function crearDocumento(rutaSalida, meta) {
  const doc = new PDFDocument({ size: "LETTER", margins: { top: 70, bottom: 60, left: MARGIN, right: MARGIN }, bufferPages: true });
  doc.pipe(fs.createWriteStream(rutaSalida));
  doc._metaCurso = meta;
  return doc;
}

function piePagina(doc) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const bottomMarginBackup = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    const bottom = doc.page.height - 40;
    doc
      .fontSize(8)
      .fillColor(COLOR_MUTED)
      .text(doc._metaCurso.pie || "", MARGIN, bottom, { width: doc.page.width - MARGIN * 2, align: "left", lineBreak: false });
    doc.text(`Página ${i - range.start + 1} de ${range.count}`, MARGIN, bottom, { width: doc.page.width - MARGIN * 2, align: "right", lineBreak: false });
    doc.page.margins.bottom = bottomMarginBackup;
  }
}

function portada(doc, { kicker, titulo, subtitulo, notas }) {
  doc.rect(0, 0, doc.page.width, 180).fill(COLOR_TITLE);
  doc
    .fillColor("#ffffff")
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(kicker.toUpperCase(), MARGIN, 60, { characterSpacing: 1.2 });
  doc.fontSize(26).text(titulo, MARGIN, 85, { width: doc.page.width - MARGIN * 2 });
  doc.moveDown(0.3);
  doc.fontSize(13).font("Helvetica").text(subtitulo, MARGIN, doc.y + 4, { width: doc.page.width - MARGIN * 2 });
  doc.fillColor(COLOR_TEXT);
  doc.y = 210;
  if (notas) {
    doc.fontSize(10).fillColor(COLOR_MUTED).font("Helvetica-Oblique").text(notas, MARGIN, doc.y, { width: doc.page.width - MARGIN * 2 });
    doc.fillColor(COLOR_TEXT).font("Helvetica");
  }
  doc.moveDown(1);
}

function h1(doc, texto) {
  if (doc.y > doc.page.height - 140) doc.addPage();
  doc.moveDown(0.6);
  doc.fontSize(16).font("Helvetica-Bold").fillColor(COLOR_TITLE).text(texto);
  doc.moveTo(MARGIN, doc.y + 2).lineTo(doc.page.width - MARGIN, doc.y + 2).strokeColor(COLOR_RULE).lineWidth(1).stroke();
  doc.moveDown(0.5);
  doc.fillColor(COLOR_TEXT).font("Helvetica");
}

function h2(doc, texto) {
  if (doc.y > doc.page.height - 110) doc.addPage();
  doc.moveDown(0.4);
  doc.fontSize(12.5).font("Helvetica-Bold").fillColor(COLOR_ACCENT).text(texto);
  doc.moveDown(0.15);
  doc.fillColor(COLOR_TEXT).font("Helvetica");
}

function p(doc, texto, opts = {}) {
  doc.fontSize(10.3).font("Helvetica").fillColor(COLOR_TEXT).text(texto, { align: "justify", lineGap: 2, ...opts });
  doc.moveDown(0.4);
}

function nota(doc, texto) {
  doc.fontSize(9.3).font("Helvetica-Oblique").fillColor(COLOR_MUTED).text("Nota: " + texto, { align: "justify", lineGap: 1 });
  doc.fillColor(COLOR_TEXT).font("Helvetica");
  doc.moveDown(0.4);
}

function bullets(doc, items) {
  doc.fontSize(10.3).font("Helvetica").fillColor(COLOR_TEXT);
  for (const item of items) {
    if (typeof item === "string") {
      doc.text("•  " + item, { indent: 4, lineGap: 2 });
    } else {
      doc.font("Helvetica-Bold").text("•  " + item.titulo + (item.detalle ? ":" : ""), { continued: !!item.detalle, indent: 4, lineGap: 2 });
      if (item.detalle) doc.font("Helvetica").text(" " + item.detalle, { lineGap: 2 });
      doc.font("Helvetica");
    }
    doc.moveDown(0.12);
  }
  doc.moveDown(0.35);
}

function ficha(doc, { referencia, nombre, estado, texto, specs }) {
  if (doc.y > doc.page.height - 130) doc.addPage();
  const yStart = doc.y;
  doc.fontSize(11).font("Helvetica-Bold").fillColor(COLOR_TITLE).text(referencia + "  —  " + nombre, { continued: false });
  const colorEstado = estado === "ACTIVO" ? "#1e7a34" : estado === "NUEVO" ? "#0b5fa5" : estado === "PENDIENTE" ? "#a5720b" : COLOR_MUTED;
  doc.fontSize(8.5).font("Helvetica-Bold").fillColor(colorEstado).text("ESTADO: " + estado);
  doc.fillColor(COLOR_TEXT).font("Helvetica").fontSize(10.3);
  doc.moveDown(0.15);
  doc.text(texto, { align: "justify", lineGap: 2 });
  if (specs && specs.length) {
    doc.moveDown(0.15);
    for (const s of specs) {
      doc.fontSize(9.6).font("Helvetica-Bold").fillColor(COLOR_MUTED).text(s.nombre + ": ", { continued: true, indent: 4 });
      doc.font("Helvetica").fillColor(COLOR_TEXT).text(s.valor);
    }
  }
  doc.moveDown(0.5);
}

function tabla(doc, headers, rows, widths) {
  if (doc.y > doc.page.height - 150) doc.addPage();
  const startX = MARGIN;
  const totalWidth = doc.page.width - MARGIN * 2;
  const colWidths = widths ? widths.map((w) => w * totalWidth) : headers.map(() => totalWidth / headers.length);
  let y = doc.y;
  doc.fontSize(9.5).font("Helvetica-Bold").fillColor("#ffffff");
  doc.rect(startX, y, totalWidth, 20).fill(COLOR_TITLE);
  let x = startX;
  headers.forEach((hd, i) => {
    doc.fillColor("#ffffff").text(hd, x + 4, y + 5, { width: colWidths[i] - 8 });
    x += colWidths[i];
  });
  y += 20;
  doc.font("Helvetica").fontSize(9);
  rows.forEach((row, ri) => {
    const heights = row.map((cell, i) => doc.heightOfString(cell, { width: colWidths[i] - 8 }));
    const rowH = Math.max(...heights) + 8;
    if (y + rowH > doc.page.height - 60) {
      doc.addPage();
      y = doc.y;
      x = startX;
      doc.fontSize(9.5).font("Helvetica-Bold").fillColor("#ffffff");
      doc.rect(startX, y, totalWidth, 20).fill(COLOR_TITLE);
      x = startX;
      headers.forEach((hd, i) => {
        doc.fillColor("#ffffff").text(hd, x + 4, y + 5, { width: colWidths[i] - 8 });
        x += colWidths[i];
      });
      y += 20;
      doc.font("Helvetica").fontSize(9);
    }
    if (ri % 2 === 0) doc.rect(startX, y, totalWidth, rowH).fill("#f2f6f8");
    x = startX;
    row.forEach((cell, i) => {
      doc.fillColor(COLOR_TEXT).text(cell, x + 4, y + 4, { width: colWidths[i] - 8 });
      x += colWidths[i];
    });
    y += rowH;
  });
  doc.y = y + 10;
}

function finalizar(doc) {
  piePagina(doc);
  doc.end();
}

const LETRAS = ["A", "B", "C", "D", "E"];

function pregunta(doc, numero, item) {
  if (doc.y > doc.page.height - 150) doc.addPage();
  doc.fontSize(10.6).font("Helvetica-Bold").fillColor(COLOR_TITLE).text(`${numero}. ${item.enunciado}`, { lineGap: 2 });
  doc.moveDown(0.15);
  doc.font("Helvetica").fillColor(COLOR_TEXT).fontSize(10.2);
  item.opciones.forEach((op, i) => {
    doc.text(`   ${LETRAS[i]})  ${op}`, { indent: 4, lineGap: 3 });
  });
  doc.moveDown(0.5);
}

function hojaRespuestas(doc, tituloModulo, preguntas) {
  doc.addPage();
  h1(doc, "Hoja de respuestas (uso del instructor)");
  p(doc, `Respuestas correctas — ${tituloModulo}.`);
  doc.moveDown(0.3);
  preguntas.forEach((item, i) => {
    doc.fontSize(10.3).font("Helvetica-Bold").fillColor(COLOR_TEXT).text(`${i + 1}. ${LETRAS[item.correcta]}`, { continued: true });
    doc.font("Helvetica-Oblique").fillColor(COLOR_MUTED).text("   " + (item.justificacion || ""));
  });
  doc.fillColor(COLOR_TEXT).font("Helvetica");
}

module.exports = {
  crearDocumento,
  portada,
  h1,
  h2,
  p,
  nota,
  bullets,
  ficha,
  tabla,
  pregunta,
  hojaRespuestas,
  finalizar,
  MARGIN,
  COLOR_TITLE,
  COLOR_ACCENT,
  COLOR_MUTED,
  COLOR_TEXT,
};
