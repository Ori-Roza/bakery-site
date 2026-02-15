import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import * as OrderFilterService from '../src/services/OrderFilterService';
import * as OrderExportService from '../src/services/OrderExportService';

const saveMock = vi.fn().mockResolvedValue(undefined);
const fromMock = vi.fn(() => ({ save: saveMock }));
const setMock = vi.fn(() => ({ from: fromMock }));
const html2pdfFactoryMock = vi.fn(() => ({ set: setMock }));

vi.mock('html2pdf.js', () => ({
  default: html2pdfFactoryMock,
}));

describe('Order Filter Service', () => {
  const mockOrders = [
    {
      id: 1,
      order_number: 100,
      customer: { name: 'אלי כהן', phone: '0501234567' },
      created_at: '2024-01-15T10:00:00Z',
      total: 150,
      paid: true,
      notes: 'הערה 1',
      user_notes: 'הערות לקוח 1',
      deleted: false,
      items: [
        { title: 'עוגה', qty: 1, price: 150, lineTotal: 150 }
      ]
    },
    {
      id: 2,
      order_number: 101,
      customer: { name: 'שרה לוי', phone: '0509876543' },
      created_at: '2024-01-10T14:30:00Z',
      total: 200,
      paid: false,
      notes: 'הערה 2',
      user_notes: 'הערות לקוח 2',
      deleted: false,
      items: [
        { title: 'עוגיות', qty: 2, price: 100, lineTotal: 200 }
      ]
    },
    {
      id: 3,
      order_number: 102,
      customer: { name: 'דוד גרין', phone: '0502468135' },
      created_at: '2024-01-05T09:15:00Z',
      total: 300,
      paid: true,
      notes: '',
      user_notes: '',
      deleted: true,
      items: [
        { title: 'כיכר לחם', qty: 3, price: 100, lineTotal: 300 }
      ]
    },
    {
      id: 4,
      order_number: 103,
      customer: { name: 'מירה טייטל', phone: '0507654321' },
      created_at: '2024-02-01T11:00:00Z',
      total: 175,
      paid: false,
      notes: 'הערה מיוחדת',
      user_notes: 'דרישה מיוחדת',
      deleted: false,
      items: []
    }
  ];

  describe('getFilterFields', () => {
    it('should return all available filter fields', () => {
      const fields = OrderFilterService.getFilterFields();
      expect(fields).toBeDefined();
      expect(fields.length).toBeGreaterThan(0);
      expect(fields.some(f => f.name === 'order_number')).toBe(true);
      expect(fields.some(f => f.name === 'customer_name')).toBe(true);
      expect(fields.some(f => f.name === 'total')).toBe(true);
      expect(fields.some(f => f.name === 'created_at')).toBe(true);
    });
  });

  describe('getOperatorsForField', () => {
    it('should return operators for text fields', () => {
      const operators = OrderFilterService.getOperatorsForField('customer_name');
      expect(operators.length).toBeGreaterThan(0);
      expect(operators.some(op => op.value === 'contains')).toBe(true);
      expect(operators.some(op => op.value === 'is')).toBe(true);
    });

    it('should return operators for number fields', () => {
      const operators = OrderFilterService.getOperatorsForField('total');
      expect(operators.some(op => op.value === 'greaterThan')).toBe(true);
      expect(operators.some(op => op.value === 'between')).toBe(true);
    });

    it('should return operators for date fields', () => {
      const operators = OrderFilterService.getOperatorsForField('created_at');
      expect(operators.some(op => op.value === 'before')).toBe(true);
      expect(operators.some(op => op.value === 'after')).toBe(true);
    });

    it('should return operators for boolean fields', () => {
      const operators = OrderFilterService.getOperatorsForField('paid');
      expect(operators.length).toBeGreaterThan(0);
    });
  });

  describe('applyFilters', () => {
    it('should apply text contains filter', () => {
      const filters = [
        { field: 'customer_name', operator: 'contains', value: 'אלי' }
      ];
      const result = OrderFilterService.applyFilters(mockOrders, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
    });

    it('should apply text equals filter', () => {
      const filters = [
        { field: 'customer_name', operator: 'is', value: 'שרה לוי' }
      ];
      const result = OrderFilterService.applyFilters(mockOrders, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(2);
    });

    it('should apply numeric greater than filter', () => {
      const filters = [
        { field: 'total', operator: 'greaterThan', value: 175 }
      ];
      const result = OrderFilterService.applyFilters(mockOrders, filters);
      // Orders with total > 175: order 2 (200) and order 3 (300)
      expect(result.length).toBe(2);
      expect(result.some(o => o.id === 2)).toBe(true);
      expect(result.some(o => o.id === 3)).toBe(true);
    });

    it('should apply numeric less than filter', () => {
      const filters = [
        { field: 'total', operator: 'lessThan', value: 200 }
      ];
      const result = OrderFilterService.applyFilters(mockOrders, filters);
      expect(result.length).toBe(2);
      expect(result.some(o => o.id === 1)).toBe(true);
      expect(result.some(o => o.id === 4)).toBe(true);
    });

    it('should apply numeric between filter', () => {
      const filters = [
        { field: 'total', operator: 'between', value: [150, 200] }
      ];
      const result = OrderFilterService.applyFilters(mockOrders, filters);
      // Orders with total between 150-200: order 1 (150), order 2 (200), order 4 (175)
      expect(result.length).toBe(3);
      expect(result.some(o => o.id === 1)).toBe(true);
      expect(result.some(o => o.id === 2)).toBe(true);
      expect(result.some(o => o.id === 4)).toBe(true);
    });

    it('should apply boolean filter', () => {
      const filters = [
        { field: 'paid', operator: 'is', value: 'yes' }
      ];
      const result = OrderFilterService.applyFilters(mockOrders, filters);
      expect(result.length).toBe(2);
      expect(result.some(o => o.id === 1)).toBe(true);
      expect(result.some(o => o.id === 3)).toBe(true);
    });

    it('should apply combined filters with AND logic', () => {
      const filters = [
        { field: 'customer_name', operator: 'contains', value: 'א' },
        { field: 'paid', operator: 'is', value: 'yes' }
      ];
      const result = OrderFilterService.applyFilters(mockOrders, filters);      // Only order 1 (אלי כהן, paid=true) matches both conditions      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
    });

    it('should apply multiple filters (name + amount + paid)', () => {
      const filters = [
        { field: 'customer_name', operator: 'contains', value: 'ל' },
        { field: 'total', operator: 'greaterThan', value: 150 },
        { field: 'paid', operator: 'is', value: 'no' }
      ];
      const result = OrderFilterService.applyFilters(mockOrders, filters);
      // Contains 'ל', paid: false, total > 150
      // Order 2: שרה לוי, total=200, paid=false ✓
      // Order 4: מירה טייטל, total=175, paid=false ✓
      expect(result.length).toBe(2);
      expect(result.some(o => o.id === 2)).toBe(true);
      expect(result.some(o => o.id === 4)).toBe(true);
    });

    it('should apply date before filter', () => {
      const filters = [
        { field: 'created_at', operator: 'before', value: '2024-01-10' }
      ];
      const result = OrderFilterService.applyFilters(mockOrders, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(3);
    });

    it('should apply date after filter', () => {
      const filters = [
        { field: 'created_at', operator: 'after', value: '2024-01-16' }
      ];
      const result = OrderFilterService.applyFilters(mockOrders, filters);
      // Only order 4 (2024-02-01) is after 2024-01-16
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(4);
    });

    it('should apply date between filter', () => {
      const filters = [
        { field: 'created_at', operator: 'betweenDates', value: ['2024-01-01', '2024-01-20'] }
      ];
      const result = OrderFilterService.applyFilters(mockOrders, filters);
      // Orders 1, 2, 3 are all in January 5-15, order 4 is in February, so should exclude only order 4
      expect(result.length).toBe(3);
      expect(result.some(o => o.id === 1)).toBe(true);
      expect(result.some(o => o.id === 2)).toBe(true);
      expect(result.some(o => o.id === 3)).toBe(true);
    });

    it('should handle empty filters', () => {
      const result = OrderFilterService.applyFilters(mockOrders, []);
      expect(result).toEqual(mockOrders);
    });

    it('should handle null filters', () => {
      const result = OrderFilterService.applyFilters(mockOrders, null);
      expect(result).toEqual(mockOrders);
    });
  });

  describe('validateFilter', () => {
    it('should validate a valid text filter', () => {
      const filter = { field: 'customer_name', operator: 'contains', value: 'test' };
      const validation = OrderFilterService.validateFilter(filter);
      expect(validation.valid).toBe(true);
    });

    it('should reject filter without field', () => {
      const filter = { field: '', operator: 'contains', value: 'test' };
      const validation = OrderFilterService.validateFilter(filter);
      expect(validation.valid).toBe(false);
    });

    it('should reject filter without operator', () => {
      const filter = { field: 'customer_name', operator: '', value: 'test' };
      const validation = OrderFilterService.validateFilter(filter);
      expect(validation.valid).toBe(false);
    });

    it('should reject numeric filter with non-numeric value', () => {
      const filter = { field: 'total', operator: 'greaterThan', value: 'abc' };
      const validation = OrderFilterService.validateFilter(filter);
      expect(validation.valid).toBe(false);
    });

    it('should reject invalid date', () => {
      const filter = { field: 'created_at', operator: 'isOn', value: 'not-a-date' };
      const validation = OrderFilterService.validateFilter(filter);
      expect(validation.valid).toBe(false);
    });
  });

  describe('formatFilterForDisplay', () => {
    it('should format text filter', () => {
      const filter = { field: 'customer_name', operator: 'contains', value: 'אלי' };
      const display = OrderFilterService.formatFilterForDisplay(filter);
      expect(display).toContain('שם לקוח');
      expect(display).toContain('מכיל');
      expect(display).toContain('אלי');
    });

    it('should format numeric filter', () => {
      const filter = { field: 'total', operator: 'greaterThan', value: 150 };
      const display = OrderFilterService.formatFilterForDisplay(filter);
      expect(display).toContain('סכום הזמנה');
      expect(display).toContain('גדול מ');
      expect(display).toContain('150');
    });

    it('should format boolean filter as כן/לא', () => {
      const filterYes = { field: 'paid', operator: 'is', value: 'yes' };
      const displayYes = OrderFilterService.formatFilterForDisplay(filterYes);
      expect(displayYes).toContain('כן');

      const filterNo = { field: 'paid', operator: 'is', value: 'no' };
      const displayNo = OrderFilterService.formatFilterForDisplay(filterNo);
      expect(displayNo).toContain('לא');
    });

    it('should format range filter', () => {
      const filter = { field: 'total', operator: 'between', value: [100, 200] };
      const display = OrderFilterService.formatFilterForDisplay(filter);
      expect(display).toContain('100 - 200');
    });
  });
});

describe('Order Export Service', () => {
  const mockOrders = [
    {
      id: 1,
      order_number: 100,
      customer: { name: 'אלי כהן', phone: '0501234567' },
      created_at: '2024-01-15T10:00:00Z',
      total: 150,
      paid: true,
      notes: 'הערה 1',
      user_notes: 'הערות לקוח 1',
      deleted: false,
      items: [
        { title: 'עוגה', qty: 1, price: 150, lineTotal: 150 }
      ]
    },
    {
      id: 2,
      order_number: 101,
      customer: { name: 'שרה לוי', phone: '0509876543' },
      created_at: '2024-01-10T14:30:00Z',
      total: 200,
      paid: false,
      notes: 'הערה 2',
      user_notes: 'הערות לקוח 2',
      deleted: false,
      items: [
        { title: 'עוגיות', qty: 2, price: 100, lineTotal: 200 }
      ]
    }
  ];

  describe('generateCSV', () => {
    it('should generate CSV with headers', () => {
      const csv = OrderExportService.generateCSV(mockOrders);
      expect(csv).toContain('מזהה הזמנה');
      expect(csv).toContain('שם לקוח');
      expect(csv).toContain('תאריך');
      expect(csv).toContain('סכום הזמנה');
    });

    it('should include order data in CSV', () => {
      const csv = OrderExportService.generateCSV(mockOrders);
      expect(csv).toContain('100');
      expect(csv).toContain('אלי כהן');
      expect(csv).toContain('0501234567');
    });

    it('should format paid status correctly', () => {
      const csv = OrderExportService.generateCSV(mockOrders);
      const lines = csv.split('\n');
      expect(lines[1]).toContain('כן');
      expect(lines[2]).toContain('לא');
    });

    it('should include order items in CSV', () => {
      const csv = OrderExportService.generateCSV(mockOrders);
      expect(csv).toContain('עוגה');
      expect(csv).toContain('עוגיות');
    });

    it('should handle empty orders', () => {
      const csv = OrderExportService.generateCSV([]);
      expect(csv).toContain('מזהה הזמנה');
      // Should only have header row
      const lines = csv.split('\n').filter(line => line.trim().length > 0);
      expect(lines.length).toBe(1);
    });

    it('should escape special characters in CSV', () => {
      const ordersWithQuotes = [
        {
          ...mockOrders[0],
          notes: 'הערה עם "ציטוט"'
        }
      ];
      const csv = OrderExportService.generateCSV(ordersWithQuotes);
      expect(csv).toContain('""');
    });
  });

  describe('generateXLSX', () => {
    it('should generate XLSX as Blob', () => {
      const blob = OrderExportService.generateXLSX(mockOrders);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });

    it('should create non-empty blob', () => {
      const blob = OrderExportService.generateXLSX(mockOrders);
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should handle empty orders', () => {
      const blob = OrderExportService.generateXLSX([]);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe('exportStatsAsPDF', () => {
    beforeEach(() => {
      saveMock.mockClear();
      fromMock.mockClear();
      setMock.mockClear();
      html2pdfFactoryMock.mockClear();
      window.alert = vi.fn();
    });

    it('should alert and skip export when element is missing', async () => {
      await OrderExportService.exportStatsAsPDF(null);

      expect(window.alert).toHaveBeenCalledTimes(1);
      expect(html2pdfFactoryMock).not.toHaveBeenCalled();
    });

    it('should call html2pdf pipeline when element exists', async () => {
      const element = document.createElement('div');
      element.id = 'admin-stats';

      await OrderExportService.exportStatsAsPDF(element);

      expect(html2pdfFactoryMock).toHaveBeenCalledTimes(1);
      expect(setMock).toHaveBeenCalledTimes(1);
      expect(fromMock).toHaveBeenCalledWith(element);
      expect(saveMock).toHaveBeenCalledTimes(1);
    });
  });
});
