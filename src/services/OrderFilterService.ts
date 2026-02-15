/**
 * Order filtering service with Hebrew UI
 * Handles advanced filtering for orders with field-type-aware operators
 */

import type { Order, OrderFilter, FilterFieldDef } from '../types/models';

/**
 * Filter field definitions with Hebrew labels and operators
 */
const FILTER_FIELDS: Record<string, FilterFieldDef> = {
  order_number: {
    name: 'order_number',
    label: 'מזהה הזמנה',
    type: 'text',
    operators: [
      { value: 'is', label: 'הוא' },
      { value: 'isNot', label: 'אינו שווה ל' },
      { value: 'contains', label: 'מכיל' },
      { value: 'notContains', label: 'אינו מכיל' },
    ],
  },
  customer_name: {
    name: 'customer_name',
    label: 'שם לקוח',
    type: 'text',
    operators: [
      { value: 'is', label: 'הוא' },
      { value: 'isNot', label: 'אינו שווה ל' },
      { value: 'contains', label: 'מכיל' },
      { value: 'notContains', label: 'אינו מכיל' },
    ],
  },
  created_at: {
    name: 'created_at',
    label: 'תאריך',
    type: 'date',
    operators: [
      { value: 'isOn', label: 'בתאריך' },
      { value: 'before', label: 'לפני' },
      { value: 'after', label: 'אחרי' },
      { value: 'between', label: 'בין' },
    ],
  },
  total: {
    name: 'total',
    label: 'סכום הזמנה',
    type: 'number',
    operators: [
      { value: 'equals', label: 'שווה ל' },
      { value: 'notEquals', label: 'אינו שווה ל' },
      { value: 'greaterThan', label: 'גדול מ' },
      { value: 'lessThan', label: 'קטן מ' },
      { value: 'between', label: 'בין' },
    ],
  },
  paid: {
    name: 'paid',
    label: 'שולם',
    type: 'boolean',
    operators: [
      { value: 'is', label: 'הוא' },
    ],
  },
  deleted: {
    name: 'deleted',
    label: 'נמחק',
    type: 'boolean',
    operators: [
      { value: 'is', label: 'הוא' },
    ],
  },
  notes: {
    name: 'notes',
    label: 'הערות מנהל',
    type: 'text',
    operators: [
      { value: 'contains', label: 'מכיל' },
      { value: 'notContains', label: 'אינו מכיל' },
    ],
  },
  user_notes: {
    name: 'user_notes',
    label: 'הערות לקוח',
    type: 'text',
    operators: [
      { value: 'contains', label: 'מכיל' },
      { value: 'notContains', label: 'אינו מכיל' },
    ],
  },
};

/**
 * Get available filter fields
 */
export function getFilterFields(): FilterFieldDef[] {
  return Object.values(FILTER_FIELDS);
}

/**
 * Get operators for a specific field
 */
export function getOperatorsForField(fieldName: string): Array<{ value: string; label: string }> {
  const field = FILTER_FIELDS[fieldName];
  return field ? field.operators : [];
}

/**
 * Get field definition by name
 */
export function getFieldDef(fieldName: string): FilterFieldDef | undefined {
  return FILTER_FIELDS[fieldName];
}

/**
 * Check if a value matches a filter with given operator
 */
function matchesOperator(
  fieldValue: any,
  operator: string,
  filterValue: any,
  fieldType?: 'text' | 'number' | 'date' | 'boolean'
): boolean {
  if (fieldValue === null || fieldValue === undefined) {
    return false;
  }

  switch (operator) {
    // Text operators
    case 'is': {
      if (fieldType === 'boolean') {
        // Boolean field matching
        let filterBool: boolean;
        if (typeof filterValue === 'boolean') {
          filterBool = filterValue;
        } else if (filterValue === 'yes' || filterValue === 'true' || filterValue === '1' || filterValue === 1) {
          filterBool = true;
        } else if (filterValue === 'no' || filterValue === 'false' || filterValue === '0' || filterValue === 0) {
          filterBool = false;
        } else {
          filterBool = !!filterValue;
        }
        if (typeof fieldValue === 'boolean') {
          return fieldValue === filterBool;
        }
        return (fieldValue ? true : false) === filterBool;
      } else {
        // Text field matching
        const valueStr = String(fieldValue).toLowerCase().trim();
        const filterStr = String(filterValue).toLowerCase().trim();
        return valueStr === filterStr;
      }
    }

    case 'isNot': {
      const valueStr = String(fieldValue).toLowerCase().trim();
      const filterStr = String(filterValue).toLowerCase().trim();
      return valueStr !== filterStr;
    }

    case 'contains': {
      const valueStr = String(fieldValue).toLowerCase();
      const filterStr = String(filterValue).toLowerCase();
      return valueStr.includes(filterStr);
    }

    case 'notContains': {
      const valueStr = String(fieldValue).toLowerCase();
      const filterStr = String(filterValue).toLowerCase();
      return !valueStr.includes(filterStr);
    }

    // Numeric operators
    case 'equals': {
      return Number(fieldValue) === Number(filterValue);
    }

    case 'notEquals': {
      return Number(fieldValue) !== Number(filterValue);
    }

    case 'greaterThan': {
      return Number(fieldValue) > Number(filterValue);
    }

    case 'lessThan': {
      return Number(fieldValue) < Number(filterValue);
    }

    case 'between': {
      const values = Array.isArray(filterValue) ? filterValue : [filterValue];
      if (values.length < 2) return false;

      if (fieldType === 'date') {
        const [start, end] = [new Date(values[0]), new Date(values[1])];
        const dateValue = new Date(fieldValue);
        return dateValue >= start && dateValue <= end;
      }

      const [min, max] = [Number(values[0]), Number(values[1])];
      return Number(fieldValue) >= min && Number(fieldValue) <= max;
    }

    // Date operators
    case 'isOn': {
      const orderDate = new Date(fieldValue).toDateString();
      const filterDate = new Date(filterValue).toDateString();
      return orderDate === filterDate;
    }

    case 'before': {
      return new Date(fieldValue) < new Date(filterValue);
    }

    case 'after': {
      return new Date(fieldValue) > new Date(filterValue);
    }

    case 'betweenDates': {
      const dates = Array.isArray(filterValue) ? filterValue : [filterValue];
      if (dates.length < 2) return false;
      const [start, end] = [new Date(dates[0]), new Date(dates[1])];
      const dateValue = new Date(fieldValue);
      return dateValue >= start && dateValue <= end;
    }

    default:
      return false;
  }
}

/**
 * Get value from order by field path (supports nested properties)
 */
function getOrderFieldValue(order: Order, fieldName: string): any {
  if (fieldName === 'customer_name') {
    return order.customer?.name || order.customer_name || '';
  }
  return (order as any)[fieldName];
}

/**
 * Apply filters to orders with AND logic (all filters must match)
 */
export function applyFilters(orders: Order[], filters: OrderFilter[]): Order[] {
  if (!filters || filters.length === 0) {
    return orders;
  }

  return orders.filter((order) => {
    // All filters must match (AND logic)
    return filters.every((filter) => {
      const fieldValue = getOrderFieldValue(order, filter.field);
      const fieldDef = FILTER_FIELDS[filter.field];
      const fieldType = fieldDef?.type;
      return matchesOperator(fieldValue, filter.operator, filter.value, fieldType as any);
    });
  });
}

/**
 * Validate filter before applying
 */
export function validateFilter(filter: OrderFilter): { valid: boolean; error?: string } {
  const { field, operator, value } = filter;

  if (!field) {
    return { valid: false, error: 'Field is required' };
  }

  if (!FILTER_FIELDS[field]) {
    return { valid: false, error: 'Invalid field' };
  }

  if (!operator) {
    return { valid: false, error: 'Operator is required' };
  }

  const fieldDef = FILTER_FIELDS[field];
  const validOperators = fieldDef.operators.map((op) => op.value);

  if (!validOperators.includes(operator)) {
    return { valid: false, error: 'Invalid operator for this field' };
  }

  // Validate value based on field type
  if (fieldDef.type === 'number' && operator !== 'between' && operator !== 'betweenDates') {
    if (isNaN(Number(value))) {
      return { valid: false, error: 'Value must be a number' };
    }
  }

  if (fieldDef.type === 'date' && operator !== 'between' && operator !== 'betweenDates') {
    const dateValue = new Date(value);
    if (isNaN(dateValue.getTime())) {
      return { valid: false, error: 'Invalid date' };
    }
  }

  if ((operator === 'between' || operator === 'betweenDates') && !Array.isArray(value)) {
    return { valid: false, error: 'Between operator requires two values' };
  }

  if (fieldDef.type === 'boolean') {
    if (value === '' || value === null || value === undefined) {
      return { valid: false, error: 'Boolean value is required' };
    }
  }

  if (operator === 'between' || operator === 'betweenDates') {
    const values = Array.isArray(value) ? value : [];
    if (!values[0] || !values[1]) {
      return { valid: false, error: 'Both range values are required' };
    }
  }

  return { valid: true };
}

/**
 * Format filter for display (for chip rendering)
 */
export function formatFilterForDisplay(filter: OrderFilter): string {
  const fieldDef = FILTER_FIELDS[filter.field];
  if (!fieldDef) return '';

  const operatorDef = fieldDef.operators.find((op) => op.value === filter.operator);
  const operatorLabel = operatorDef?.label || filter.operator;

  let valueStr = '';
  if (filter.field === 'created_at' || filter.field === 'total') {
    if (Array.isArray(filter.value)) {
      if (filter.operator === 'between' || filter.operator === 'betweenDates') {
        valueStr = `${filter.value[0]} - ${filter.value[1]}`;
      }
    } else {
      valueStr = String(filter.value);
    }
  } else if (filter.field === 'paid' || filter.field === 'deleted') {
    valueStr = filter.value === 'yes' || filter.value === true ? 'כן' : 'לא';
  } else {
    valueStr = String(filter.value);
  }

  return `${fieldDef.label} ${operatorLabel} ${valueStr}`;
}
