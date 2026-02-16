/**
 * Order export service
 * Handles generating and downloading orders as CSV or XLSX
 */

import type { Order, OrderFilter } from '../types/models';
import { formatFilterForDisplay } from './OrderFilterService';

/**
 * Format date for export (he-IL locale)
 */
function formatDateForExport(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Escape CSV value (handle quotes and commas)
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * CSV Headers in Hebrew - ordered LTR for natural RTL reading
 */
const CSV_HEADERS = [
  'מזהה הזמנה',
  'שם לקוח',
  'תאריך יצירה',
  'תאריך איסוף',
  'סכום',
  'שולם',
  'הערות מנהל',
  'הערות לקוח',
  'מחוק',
];

/**
 * Generate CSV content from orders
 */
export function generateCSV(orders: Order[]): string {
  const rows: string[] = [];

  // Add header row
  rows.push(CSV_HEADERS.map(escapeCSVValue).join(','));

  // Add data rows
  for (const order of orders) {
    const row = [
      escapeCSVValue(order.order_number || order.id),
      escapeCSVValue(order.customer?.name || order.customer_name || ''),
      escapeCSVValue(formatDateForExport(order.created_at)),
      escapeCSVValue(formatDateForExport(order.pickup_date)),
      escapeCSVValue(order.total || order.total_price || ''),
      escapeCSVValue(order.paid ? 'כן' : 'לא'),
      escapeCSVValue(order.notes || ''),
      escapeCSVValue(order.user_notes || ''),
      escapeCSVValue(order.deleted ? 'כן' : 'לא'),
    ];

    rows.push(row.join(','));
  }

  return rows.join('\n');
}

/**
 * Generate XLSX as CSV-compatible format for now
 * Note: For true XLSX support, the 'xlsx' package would need to be added to dependencies
 * This generates a TSV that can be opened in Excel, or can be converted to XLSX
 */
export function generateXLSX(orders: Order[]): Blob {
  // For now, we'll generate tab-separated values which Excel handles well
  // This is compatible with xlsx library: xlsx.utils.sheet_to_csv(ws, { FS: '\t' })
  const rows: string[] = [];

  // Add header row
  rows.push(CSV_HEADERS.map(escapeCSVValue).join('\t'));

  // Add data rows
  for (const order of orders) {
    const row = [
      escapeCSVValue(order.order_number || order.id),
      escapeCSVValue(order.customer?.name || order.customer_name || ''),
      escapeCSVValue(formatDateForExport(order.created_at)),
      escapeCSVValue(formatDateForExport(order.pickup_date)),
      escapeCSVValue(order.total || order.total_price || ''),
      escapeCSVValue(order.paid ? 'כן' : 'לא'),
      escapeCSVValue(order.notes || ''),
      escapeCSVValue(order.user_notes || ''),
      escapeCSVValue(order.deleted ? 'כן' : 'לא'),
    ];

    rows.push(row.join('\t'));
  }

  const content = rows.join('\n');
  return new Blob([content], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Trigger download of file in browser
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate timestamp for filename
 */
function getTimestamp(): string {
  const now = new Date();
  return now
    .toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\//g, '-');
}

/**
 * Export orders as CSV with download
 */
export function exportOrdersAsCSV(orders: Order[]): void {
  const csv = generateCSV(orders);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const filename = `הזמנות_${getTimestamp()}.csv`;
  downloadFile(blob, filename);
}

/**
 * Export orders as XLSX with download
 */
export function exportOrdersAsXLSX(orders: Order[]): void {
  const blob = generateXLSX(orders);
  const filename = `הזמנות_${getTimestamp()}.xlsx`;
  downloadFile(blob, filename);
}

/**
 * Export admin stats container as PDF
 */
export async function exportStatsAsPDF(element: HTMLElement | null): Promise<void> {
  if (!element) {
    alert('לא נמצא אזור הסטטיסטיקות לייצוא.');
    return;
  }

  const html2pdfModule = await import('html2pdf.js');
  const html2pdf = html2pdfModule.default;

  // Temporarily remove overflow/height constraints for proper PDF capture
  const elementsToUnconstraint = element.querySelectorAll('.stats-table-wrapper, .admin-table-wrapper, .admin-card');
  const originalStyles: Array<{ element: Element; styles: Partial<CSSStyleDeclaration> }> = [];

  elementsToUnconstraint.forEach((el) => {
    const htmlEl = el as HTMLElement;
    originalStyles.push({
      element: el,
      styles: {
        maxHeight: htmlEl.style.maxHeight,
        overflowY: htmlEl.style.overflowY,
        overflowX: htmlEl.style.overflowX,
        overflow: htmlEl.style.overflow,
      },
    });
    htmlEl.style.maxHeight = 'none';
    htmlEl.style.overflowY = 'visible';
    htmlEl.style.overflowX = 'visible';
    htmlEl.style.overflow = 'visible';
  });

  try {
    await html2pdf()
      .set({
        margin: [5, 5, 5, 5],
        filename: `סטטיסטיקות_${getTimestamp()}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollY: 0,
          backgroundColor: '#ffffff',
          ignoreElements: (currentElement: Element) => {
            // Exclude export button and action buttons from stats table
            if (currentElement.id === 'stats-export-pdf') return true;
            // Exclude action button columns in stats table
            if (currentElement.closest('.stats-table')?.contains(currentElement) && 
                currentElement.getAttribute('data-action-buttons') === 'true') {
              return true;
            }
            return false;
          },
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        pagebreak: { mode: ['css', 'legacy'] },
      } as any)
      .from(element)
      .save();
  } finally {
    // Restore original styles
    originalStyles.forEach(({ element: el, styles }) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.maxHeight = styles.maxHeight || '';
      htmlEl.style.overflowY = styles.overflowY || '';
      htmlEl.style.overflowX = styles.overflowX || '';
      htmlEl.style.overflow = styles.overflow || '';
    });
  }
}

/**
 * Format timestamp for print (DD/MM/YYYY HH:MM in he-IL)
 */
function formatTimestampForPrint(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Build active filters summary for print display
 */
function buildFiltersSummary(activeFilters: OrderFilter[], searchQuery: string): string {
  const filterStrings = activeFilters.map((filter) => formatFilterForDisplay(filter));
  const allFilters = [];

  if (searchQuery) {
    allFilters.push(`חיפוש: ${searchQuery}`);
  }
  allFilters.push(...filterStrings);

  return allFilters.join(', ');
}

/**
 * Generate HTML row for order (for print table)
 */
function generatePrintTableRow(order: Order): string {
  const orderNumber = order.order_number || order.id || '';
  const customerName = order.customer?.name || order.customer_name || '';
  const createdAt = formatDateForExport(order.created_at);
  const pickupDate = formatDateForExport(order.pickup_date);
  const total = order.total || order.total_price || '';
  const paid = order.paid ? 'כן' : 'לא';
  const notes = order.notes || '';
  const userNotes = order.user_notes || '';
  const deleted = order.deleted ? 'כן' : 'לא';

  const rowClass = order.deleted ? 'print-deleted-row' : '';

  return `
    <tr class="${rowClass}">
      <td>${escapeHtml(String(orderNumber))}</td>
      <td>${escapeHtml(customerName)}</td>
      <td>${escapeHtml(createdAt)}</td>
      <td>${escapeHtml(pickupDate)}</td>
      <td>${escapeHtml(String(total))}</td>
      <td>${escapeHtml(paid)}</td>
      <td>${escapeHtml(notes)}</td>
      <td>${escapeHtml(userNotes)}</td>
      <td>${escapeHtml(deleted)}</td>
    </tr>
  `;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Print orders table with filters info
 */
export function printOrdersTable(
  orders: Order[],
  activeFilters: OrderFilter[],
  searchQuery: string
): void {
  const timestamp = formatTimestampForPrint(new Date());
  const filtersSummary = buildFiltersSummary(activeFilters, searchQuery);
  const hasFilters = activeFilters.length > 0 || searchQuery.trim().length > 0;

  let tableHtml = '';

  if (orders.length === 0) {
    tableHtml = '<p class="empty-state">אין הזמנות להצגה לפי הסינון הנוכחי</p>';
  } else {
    const tableRows = orders.map((order) => generatePrintTableRow(order)).join('');

    tableHtml = `
      <table class="print-table">
        <thead>
          <tr>
            <th>מזהה הזמנה</th>
            <th>שם מזמין</th>
            <th>תאריך יצירה</th>
            <th>תאריך איסוף</th>
            <th>סכום</th>
            <th>שולם</th>
            <th>הערות מנהל</th>
            <th>הערות לקוח</th>
            <th>מחוק</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;
  }

  const filtersHtml = hasFilters
    ? `<div class="filters-section"><strong>סינונים פעילים:</strong> ${escapeHtml(filtersSummary)}</div>`
    : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>הזמנות</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          direction: rtl;
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.6;
          background: white;
          color: #333;
        }

        @page {
          size: A4 landscape;
          margin: 10mm;
        }

        @media print {
          body {
            margin: 0;
            padding: 10mm;
          }
        }

        .print-header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }

        .print-header h1 {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #92442d;
        }

        .print-info {
          font-size: 11px;
          color: #666;
          margin-bottom: 4px;
        }

        .filters-section {
          font-size: 11px;
          margin-top: 12px;
          padding: 8px;
          background-color: #f5f5f5;
          border-right: 3px solid #92442d;
          margin-bottom: 16px;
        }

        .filters-section strong {
          font-weight: bold;
          color: #92442d;
        }

        .print-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin-top: 10px;
        }

        .print-table thead {
          display: table-header-group;
          background-color: #fff3e0;
        }

        .print-table th {
          border: 1px solid #ccc;
          padding: 8px;
          text-align: right;
          font-weight: bold;
          background-color: #fff3e0;
          color: #333;
        }

        .print-table td {
          border: 1px solid #ccc;
          padding: 6px;
          text-align: right;
          word-break: break-word;
          white-space: normal;
          max-width: 100px;
        }

        .print-table tbody tr:nth-child(even) {
          background-color: #fafafa;
        }

        .print-table tbody tr:hover {
          background-color: #f0f0f0;
        }

        .print-deleted-row {
          opacity: 0.6;
          text-decoration: line-through;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          font-size: 14px;
          color: #999;
        }

        /* Print-specific adjustments */
        @media print {
          body {
            padding: 10mm;
          }
          .print-table {
            page-break-inside: avoid;
          }
          .print-table tbody tr {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1>הזמנות</h1>
        <div class="print-info">הודפס בתאריך: ${timestamp}</div>
      </div>
      ${filtersHtml}
      <div class="print-content">
        ${tableHtml}
      </div>
    </body>
    </html>
  `;

  // Open new window and write content
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Trigger print dialog after content loads
    printWindow.onload = () => {
      printWindow.print();
    };

    // Optional: Close window after print completes
    printWindow.onafterprint = () => {
      printWindow.close();
    };
  }
}
