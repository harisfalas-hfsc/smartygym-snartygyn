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
  const headerHeight = 25;
  const footerHeight = 15;
  const usableHeight = pageHeight - headerHeight - footerHeight - (margin * 2);

  // Create PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Clone the content element for modification
  const clone = contentElement.cloneNode(true) as HTMLElement;
  clone.style.width = '800px';
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#1a1a1a';
  clone.style.padding = '20px';
  
  // Force light theme colors on all elements
  const allElements = clone.querySelectorAll('*');
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.color = '#1a1a1a';
    if (htmlEl.classList.contains('bg-background')) {
      htmlEl.style.backgroundColor = '#ffffff';
    }
    if (htmlEl.classList.contains('text-muted-foreground')) {
      htmlEl.style.color = '#666666';
    }
  });
  
  // Create a temporary container
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'fixed';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '800px';
  tempContainer.style.backgroundColor = '#ffffff';
  tempContainer.appendChild(clone);
  document.body.appendChild(tempContainer);

  try {
    // Capture the entire content as canvas
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 800,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Calculate how many pages we need
    const totalPages = Math.ceil(imgHeight / usableHeight);
    
    // Add header function
    const addHeader = (pageNum: number, totalPages: number) => {
      // Header background
      pdf.setFillColor(250, 250, 250);
      pdf.rect(0, 0, pageWidth, headerHeight, 'F');
      
      // Title
      pdf.setFontSize(12);
      pdf.setTextColor(26, 26, 26);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin, 15);
      
      // SmartyGym branding
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('SmartyGym', pageWidth - margin - 25, 15);
    };

    // Add footer function
    const addFooter = (pageNum: number, totalPages: number) => {
      const footerY = pageHeight - 10;
      
      // Footer line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
      
      // Page number
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });
      
      // Website
      pdf.text('smartygym.com', margin, footerY);
      
      // Date
      const date = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      pdf.text(date, pageWidth - margin, footerY, { align: 'right' });
    };

    // Generate pages
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      // Add header and footer
      addHeader(page + 1, totalPages);
      addFooter(page + 1, totalPages);

      // Calculate the portion of the image to show on this page
      const sourceY = page * usableHeight * (canvas.width / imgWidth);
      const sourceHeight = Math.min(
        usableHeight * (canvas.width / imgWidth),
        canvas.height - sourceY
      );
      
      // Create a temporary canvas for this page's portion
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;
      const ctx = pageCanvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(
          canvas,
          0, sourceY,
          canvas.width, sourceHeight,
          0, 0,
          canvas.width, sourceHeight
        );
        
        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;
        
        pdf.addImage(
          pageImgData,
          'JPEG',
          margin,
          headerHeight + margin / 2,
          imgWidth,
          pageImgHeight
        );
      }
    }

    // Save the PDF
    pdf.save(`${filename}.pdf`);
  } finally {
    // Cleanup
    document.body.removeChild(tempContainer);
  }
};
