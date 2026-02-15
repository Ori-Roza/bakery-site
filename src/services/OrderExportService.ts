/**
 * Order export service
 * Handles generating and downloading orders as CSV or XLSX
 */

import type { Order } from '../types/models';

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
