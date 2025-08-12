import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportOptions {
  title?: string;
  filename?: string;
  pageSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

export async function exportToPDF(
  elementId: string,
  options: ExportOptions = {}
) {
  const {
    title = 'Report',
    filename = 'report.pdf',
    pageSize = 'a4',
    orientation = 'portrait',
  } = options;

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id '${elementId}' not found`);
    }

    // Create canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    // Calculate dimensions
    const imgWidth = orientation === 'portrait' ? 210 : 297; // A4 sizes in mm
    const pageHeight = orientation === 'portrait' ? 297 : 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF(orientation, 'mm', pageSize);
    let position = 0;

    // Add title
    pdf.setFontSize(16);
    pdf.text(title, 14, 15);
    position = 25;

    // Add image
    pdf.addImage(
      canvas.toDataURL('image/jpeg', 1.0),
      'JPEG',
      0,
      position,
      imgWidth,
      imgHeight
    );
    heightLeft -= pageHeight;

    // Add new pages if content exceeds page height
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;
    }

    // Save PDF
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}
