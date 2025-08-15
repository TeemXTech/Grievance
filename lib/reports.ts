import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import PptxGenJS from 'pptxgenjs';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const REPORTS_DIR = process.env.REPORTS_DIR || './public/reports';
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

export async function saveExcel(filename: string, data: any[], title = 'Report') {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Data');

  if (data.length) {
    ws.columns = Object.keys(data[0]).map(key => ({ header: key, key }));
    data.forEach(row => ws.addRow(row));
  } else {
    ws.addRow(['No rows']);
  }
  const fp = path.join(REPORTS_DIR, filename);
  await wb.xlsx.writeFile(fp);
  return `/reports/${filename}`;
}

export async function saveChartImage(filename: string, labels: string[], values: number[], chartTitle: string) {
  const width = 800, height = 400;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  const configuration = {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: chartTitle, data: values }]
    },
    options: { responsive: false, plugins: { legend: { display: false }, title: { display: true, text: chartTitle } } }
  } as any;

  const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
  const fp = path.join(REPORTS_DIR, filename);
  fs.writeFileSync(fp, buffer);
  return `/reports/${filename}`;
}

export async function savePDF(filename: string, title: string, table: any[], chartPath?: string) {
  const fp = path.join(REPORTS_DIR, filename);
  const doc = new PDFDocument({ margin: 40 });
  const stream = fs.createWriteStream(fp);
  doc.pipe(stream);

  doc.fontSize(18).text(title, { underline: true });
  doc.moveDown();

  if (chartPath) {
    const full = path.join(process.cwd(), 'public', chartPath);
    if (fs.existsSync(full)) { doc.image(full, { width: 500 }); doc.moveDown(); }
  }

  doc.fontSize(12);
  if (table.length) {
    const keys = Object.keys(table[0]);
    doc.text(keys.join(' | '));
    doc.moveDown(0.5);
    table.forEach(row => doc.text(keys.map(k => String(row[k] ?? '')).join(' | ')));
  } else {
    doc.text('No rows');
  }

  doc.end();
  await new Promise(r => stream.on('finish', r));
  return `/reports/${filename}`;
}

export async function savePPT(filename: string, title: string, table: any[], chartPath?: string) {
  const pptx = new PptxGenJS();
  const slide = pptx.addSlide();
  slide.addText(title, { x: 0.5, y: 0.3, fontSize: 24, bold: true });

  if (chartPath) {
    const full = path.join(process.cwd(), 'public', chartPath);
    if (fs.existsSync(full)) {
      slide.addImage({ path: full, x: 0.5, y: 1.0, w: 9.0 });
    }
  }

  const rows = table.length ? [Object.keys(table[0]), ...table.map(r => Object.values(r).map(v => String(v ?? '')))] : [['No rows']];
  slide.addTable(rows, { x: 0.5, y: 4.2, w: 9.0, fontSize: 12 });

  const fp = path.join(REPORTS_DIR, filename);
  await pptx.writeFile({ fileName: fp });
  return `/reports/${filename}`;
}