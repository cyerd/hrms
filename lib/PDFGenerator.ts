// lib/PDFGenerator.ts
// This utility function handles the client-side generation of the leave request PDF.
// It uses jsPDF, jspdf-autotable, and qrcode to create a professional document
// with a header, watermark, and a QR code for verification.

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';
import { format } from 'date-fns';

// Extend jsPDF with the autoTable plugin's types
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

// Define the structure of the request data needed for the PDF
type LeaveRequestData = {
  id: string;
  user: {
    name: string | null;
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "DENIED";
  approvedBy?: string | null; // Assuming we'll fetch who approved it
  createdAt: string;
};

export const generateLeaveRequestPDF = async (requestData: LeaveRequestData) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const verificationUrl = `${window.location.origin}/verify/${requestData.id}`;

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { width: 40 });

    // --- Header ---
    const pageWidth = doc.internal.pageSize.getWidth();
    // Add Company Logo (replace with your actual logo URL or base64 string)
    // For this example, we'll use a placeholder.
    // doc.addImage('/logo.png', 'PNG', 15, 10, 30, 15);

    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text('AVOPRO EPZ LIMITED', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(8);
    doc.text('P.O. Box 12345 - 00100, Nairobi, Kenya', pageWidth / 2, 20, { align: 'center' });
    doc.text('Email: hr@avopro.com | Phone: +254 700 000 000', pageWidth / 2, 25, { align: 'center' });

    doc.addImage(qrCodeDataUrl, 'JPEG', pageWidth - 55, 10, 40, 40);

    // --- Document Title ---
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Official Leave Approval Document', pageWidth / 2, 55, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(15, 60, pageWidth - 15, 60);

    // --- Body Content using autoTable ---
    const tableData = [
      ['Request ID', requestData.id],
      ['Employee Name', requestData.user.name || 'N/A'],
      ['Leave Type', requestData.leaveType],
      ['Date Range', `${format(new Date(requestData.startDate), "MMM d, yyyy")} to ${format(new Date(requestData.endDate), "MMM d, yyyy")}`],
      ['Reason Provided', requestData.reason],
      ['Status', requestData.status],
      ['Date Approved', format(new Date(), "MMM d, yyyy")], // Assuming current date is approval date
    ];

    doc.autoTable({
      startY: 70,
      head: [['Field', 'Details']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [22, 160, 133] }, // A green-ish color
      styles: { fontSize: 10 },
    });

    // --- Apply Watermark and Footer to all pages ---
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(50);
    doc.setTextColor(220);
    doc.saveGraphicsState();
    // Corrected GState instantiation with a type assertion
    doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      // Watermark
      doc.text(
        'AVOPRO EPZ LIMITED',
        pageWidth / 2,
        doc.internal.pageSize.getHeight() / 2,
        { align: 'center', angle: 45 }
      );
      // Footer
      doc.setFontSize(8);
      doc.text(
        `This is a system-generated document. Scan the QR code for verification. Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    doc.restoreGraphicsState();


    // --- Save the PDF ---
    doc.save(`Leave-Approval-${requestData.user.name}-${requestData.id.slice(0, 6)}.pdf`);
    return true;

  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
};
