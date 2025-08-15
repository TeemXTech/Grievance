// /lib/reports.js
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const PptxGenJS = require('pptxgenjs');

const REPORTS_DIR = process.env.REPORTS_DIR || './public/reports';
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

async function saveExcel(filename, data) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Data');
  if (data?.length) {
    ws.columns = Object.keys(data[0]).map(k => ({ header: k, key: k }));
    data.forEach(r => ws.addRow(r));
  } else {
    ws.addRow(['No rows']);
  }
  const fp = path.join(REPORTS_DIR, filename);
  await wb.xlsx.writeFile(fp);
  return `/reports/${filename}`;
}

async function savePDF(filename, title, table) {
  const fp = path.join(REPORTS_DIR, filename);
  const doc = new PDFDocument({ margin: 36 });
  const out = fs.createWriteStream(fp);
  doc.pipe(out);

  doc.fontSize(18).text(title, { underline: true });
  doc.moveDown();

  if (table?.length) {
    const keys = Object.keys(table[0]);
    doc.fontSize(12).text(keys.join(' | '));
    doc.moveDown(0.5);
    table.forEach(row => {
      doc.text(keys.map(k => String(row[k] ?? '')).join(' | '));
    });
  } else {
    doc.text('No rows');
  }

  doc.end();
  await new Promise(r => out.on('finish', r));
  return `/reports/${filename}`;
}

async function savePPT(filename, title, table) {
  const pptx = new PptxGenJS();
  const slide = pptx.addSlide();
  slide.addText(title, { x: 0.5, y: 0.4, fontSize: 24, bold: true });

  const rows = table?.length ? [Object.keys(table[0]), ...table.map(r => Object.values(r).map(v => String(v ?? '')))] : [['No rows']];
  slide.addTable(rows, { x: 0.5, y: 1.2, w: 9.0, fontSize: 12 });

  const fp = path.join(REPORTS_DIR, filename);
  await pptx.writeFile({ fileName: fp });
  return `/reports/${filename}`;
}

module.exports = { saveExcel, savePDF, savePPT };