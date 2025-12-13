import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFExportOptions {
  title: string;
  filename: string;
  accentColor: string;
}

export const exportToPDF = async (
  contentElement: HTMLElement,
  options: PDFExportOptions
): Promise<void> => {
  const { title, filename, accentColor } = options;
  
  // A4 dimensions in mm
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  const headerHeight = 20;
  const footerHeight = 12;
  const sectionGap = 5;
  const usableHeight = pageHeight - headerHeight - footerHeight - margin;

  // Create PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Find all sections marked with data-pdf-section
  const sections = contentElement.querySelectorAll('[data-pdf-section]');
  
  if (sections.length === 0) {
    // Fallback: treat entire content as one section
    console.warn('No data-pdf-section elements found, exporting entire content');
    await exportEntireContent(pdf, contentElement, options);
    return;
  }

  let currentY = headerHeight + margin / 2;
  let currentPage = 1;
  let totalPages = 1; // Will be calculated after processing

  // Helper function to add header
  const addHeader = (pageNum: number) => {
    pdf.setFillColor(250, 250, 250);
    pdf.rect(0, 0, pageWidth, headerHeight, 'F');
    
    pdf.setFontSize(11);
    pdf.setTextColor(26, 26, 26);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, 12);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('SmartyGym', pageWidth - margin - 20, 12);
  };

  // Helper function to add footer
  const addFooter = (pageNum: number, total: number) => {
    const footerY = pageHeight - 8;
    
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
    
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Page ${pageNum} of ${total}`, pageWidth / 2, footerY, { align: 'center' });
    
    pdf.text('smartygym.com', margin, footerY);
    
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.text(date, pageWidth - margin, footerY, { align: 'right' });
  };

  // First pass: calculate total pages needed
  const sectionData: { canvas: HTMLCanvasElement; height: number }[] = [];
  
  for (const section of Array.from(sections)) {
    const sectionEl = section as HTMLElement;
    
    // Clone and style for light theme
    const clone = sectionEl.cloneNode(true) as HTMLElement;
    clone.style.width = '800px';
    clone.style.backgroundColor = '#ffffff';
    clone.style.color = '#1a1a1a';
    clone.style.padding = '16px';
    
    // Force light theme on all elements
    const allElements = clone.querySelectorAll('*');
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(sectionEl.querySelector(el.tagName) || sectionEl);
      htmlEl.style.color = '#1a1a1a';
      if (htmlEl.classList.contains('bg-background') || htmlEl.classList.contains('bg-muted/30')) {
        htmlEl.style.backgroundColor = '#f5f5f5';
      }
      if (htmlEl.classList.contains('text-muted-foreground')) {
        htmlEl.style.color = '#666666';
      }
    });
    
    // Create temp container
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '800px';
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);
    
    try {
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 800,
      });
      
      // Calculate height in mm
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      sectionData.push({ canvas, height: imgHeight });
    } finally {
      document.body.removeChild(tempContainer);
    }
  }

  // Calculate total pages
  let tempY = headerHeight + margin / 2;
  totalPages = 1;
  
  for (const data of sectionData) {
    let sectionHeight = data.height;
    
    // If section is too tall for a page, it will be scaled
    if (sectionHeight > usableHeight - margin) {
      sectionHeight = usableHeight - margin;
    }
    
    // Check if section fits on current page
    if (tempY + sectionHeight + sectionGap > usableHeight + headerHeight) {
      totalPages++;
      tempY = headerHeight + margin / 2;
    }
    
    tempY += sectionHeight + sectionGap;
  }

  // Second pass: generate PDF with sections
  addHeader(currentPage);
  
  for (let i = 0; i < sectionData.length; i++) {
    const { canvas, height } = sectionData[i];
    let sectionHeight = height;
    let scaleFactor = 1;
    
    // Scale down if section is too tall for a single page
    if (sectionHeight > usableHeight - margin) {
      scaleFactor = (usableHeight - margin) / sectionHeight;
      sectionHeight = usableHeight - margin;
    }
    
    // Check if section fits on current page
    if (currentY + sectionHeight + sectionGap > usableHeight + headerHeight) {
      // Add footer to current page
      addFooter(currentPage, totalPages);
      
      // Start new page
      pdf.addPage();
      currentPage++;
      currentY = headerHeight + margin / 2;
      addHeader(currentPage);
    }
    
    // Add section image
    const imgWidth = contentWidth;
    const imgHeight = sectionHeight;
    
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    pdf.addImage(imgData, 'JPEG', margin, currentY, imgWidth, imgHeight);
    
    currentY += sectionHeight + sectionGap;
  }
  
  // Add footer to last page
  addFooter(currentPage, totalPages);

  // Save the PDF
  pdf.save(`${filename}.pdf`);
};

// Fallback function for content without sections
async function exportEntireContent(
  pdf: jsPDF,
  contentElement: HTMLElement,
  options: PDFExportOptions
): Promise<void> {
  const { title, filename } = options;
  
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  const headerHeight = 20;
  const footerHeight = 12;
  const usableHeight = pageHeight - headerHeight - footerHeight - margin;

  // Clone and style
  const clone = contentElement.cloneNode(true) as HTMLElement;
  clone.style.width = '800px';
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#1a1a1a';
  clone.style.padding = '20px';
  
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'fixed';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.appendChild(clone);
  document.body.appendChild(tempContainer);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 800,
    });

    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const totalPages = Math.ceil(imgHeight / usableHeight);

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage();

      // Header
      pdf.setFillColor(250, 250, 250);
      pdf.rect(0, 0, pageWidth, headerHeight, 'F');
      pdf.setFontSize(11);
      pdf.setTextColor(26, 26, 26);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin, 12);

      // Footer
      const footerY = pageHeight - 8;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Page ${page + 1} of ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });

      // Content slice
      const sourceY = page * usableHeight * (canvas.width / imgWidth);
      const sourceHeight = Math.min(usableHeight * (canvas.width / imgWidth), canvas.height - sourceY);
      
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;
      const ctx = pageCanvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.92);
        const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;
        pdf.addImage(pageImgData, 'JPEG', margin, headerHeight + margin / 2, imgWidth, pageImgHeight);
      }
    }

    pdf.save(`${filename}.pdf`);
  } finally {
    document.body.removeChild(tempContainer);
  }
}
