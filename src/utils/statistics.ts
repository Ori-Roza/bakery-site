import type { Order } from "../types/models";

export type StatsRangeKey = "this_month" | "last_30_days" | "last_90_days" | "this_year";
export type StatsSeriesKey = "revenue" | "orders";

export type DateRange = {
  start: Date;
  end: Date;
};

export type DailySeriesEntry = {
  date: Date;
  label: string;
  orders: number;
  revenue: number;
};

export type PopularProduct = {
  title: string;
  qty: number;
  share: number;
};

export type DistributionEntry = {
  label: string;
  count: number;
};

const startOfDay = (value: Date): Date =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

const endOfDay = (value: Date): Date =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate(), 23, 59, 59, 999);

const addDays = (value: Date, days: number): Date =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate() + days);

const addMonths = (value: Date, months: number): Date =>
  new Date(value.getFullYear(), value.getMonth() + months, 1);

const safeDate = (value: string | Date | undefined): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

export const getDateRange = (key: StatsRangeKey, now: Date = new Date()): DateRange => {
  const today = startOfDay(now);
  switch (key) {
    case "this_month": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = endOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0));
      return { start, end };
    }
    case "last_30_days": {
      const start = startOfDay(addDays(today, -29));
      return { start, end: endOfDay(today) };
    }
    case "last_90_days": {
      const start = startOfDay(addDays(today, -89));
      return { start, end: endOfDay(today) };
    }
    case "this_year": {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = endOfDay(new Date(today.getFullYear(), 11, 31));
      return { start, end };
    }
    default:
      return { start: today, end: endOfDay(today) };
  }
};

export const getPreviousDateRange = (
  key: StatsRangeKey,
  now: Date = new Date()
): DateRange => {
  const current = getDateRange(key, now);
  const daysInRange = Math.round(
    (startOfDay(current.end).getTime() - startOfDay(current.start).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (key === "this_month") {
    const start = new Date(current.start.getFullYear(), current.start.getMonth() - 1, 1);
    const end = endOfDay(new Date(current.start.getFullYear(), current.start.getMonth(), 0));
    return { start, end };
  }

  if (key === "this_year") {
    const start = new Date(current.start.getFullYear() - 1, 0, 1);
    const end = endOfDay(new Date(current.start.getFullYear() - 1, 11, 31));
    return { start, end };
  }

  const start = startOfDay(addDays(current.start, -(daysInRange + 1)));
  const end = endOfDay(addDays(current.start, -1));
  return { start, end };
};

export const isWithinRange = (value: string | Date | undefined, range: DateRange): boolean => {
  const date = safeDate(value);
  if (!date) return false;
  return date >= range.start && date <= range.end;
};

export const filterOrdersByRange = (orders: Order[], range: DateRange): Order[] =>
  orders.filter((order) => isWithinRange(order.created_at, range));

export const getOrderTotal = (order: Order): number =>
  Number(order.total ?? order.total_price ?? 0) || 0;

export const computeKpis = (orders: Order[], previousOrders: Order[]) => {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + getOrderTotal(order), 0);
  const paidOrders = orders.filter((order) => order.paid && !order.deleted).length;
  const conversionRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const previousOrdersCount = previousOrders.length;
  const previousRevenue = previousOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);
  const previousAverage =
    previousOrdersCount > 0 ? previousRevenue / previousOrdersCount : 0;

  const percentChange = (current: number, previous: number): number => {
    if (!previous) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    totalOrders,
    totalRevenue,
    conversionRate,
    averageOrderValue,
    deltaOrders: percentChange(totalOrders, previousOrdersCount),
    deltaRevenue: percentChange(totalRevenue, previousRevenue),
    deltaAverageOrder: percentChange(averageOrderValue, previousAverage),
  };
};

export const buildDailySeries = (orders: Order[], range: DateRange): DailySeriesEntry[] => {
  const series: DailySeriesEntry[] = [];
  const current = startOfDay(range.start);
  const end = startOfDay(range.end);

  while (current <= end) {
    const dayStart = startOfDay(current);
    const dayEnd = endOfDay(current);
    const dayOrders = orders.filter((order) =>
      isWithinRange(order.created_at, { start: dayStart, end: dayEnd })
    );
    series.push({
      date: new Date(dayStart),
      label: dayStart.toLocaleDateString("he-IL", {
        day: "2-digit",
        month: "2-digit",
      }),
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, order) => sum + getOrderTotal(order), 0),
    });
    current.setDate(current.getDate() + 1);
  }

  return series;
};

export const computePopularProducts = (orders: Order[], max = 5): PopularProduct[] => {
  const totals = new Map<string, number>();
  let totalQty = 0;

  orders.forEach((order) => {
    const relatedItems = Array.isArray(order.order_items) ? order.order_items : [];
    const items = relatedItems.length ? relatedItems : order.items || [];

    items.forEach((item: any) => {
      const relatedProduct = Array.isArray(item.products) ? item.products[0] : item.products;
      const title = relatedProduct?.title || item.title || "";
      const qty = Number(item.qty || 0) || 0;
      if (!title || !qty) return;
      totals.set(title, (totals.get(title) || 0) + qty);
      totalQty += qty;
    });
  });

  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([title, qty]) => ({
      title,
      qty,
      share: totalQty > 0 ? (qty / totalQty) * 100 : 0,
    }));
};

export const computePickupHourDistribution = (orders: Order[]): DistributionEntry[] => {
  const counts = new Map<string, number>();
  orders.forEach((order) => {
    const time = order.pickup_time;
    if (!time) return;
    const hour = time.split(":")[0];
    if (!hour) return;
    const label = `${hour.padStart(2, "0")}:00`;
    counts.set(label, (counts.get(label) || 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0], "he"))
    .map(([label, count]) => ({ label, count }));
};

export const computeOrderHourDistribution = (orders: Order[]): DistributionEntry[] => {
  const counts = new Map<string, number>();
  orders.forEach((order) => {
    const date = safeDate(order.created_at);
    if (!date) return;
    const hour = String(date.getHours()).padStart(2, "0");
    const label = `${hour}:00`;
    counts.set(label, (counts.get(label) || 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0], "he"))
    .map(([label, count]) => ({ label, count }));
};

export const computeAverageOrders = (orders: Order[], range: DateRange) => {
  const start = startOfDay(range.start);
  const end = startOfDay(range.end);
  const days = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
  const weeks = days / 7;
  return {
    perDay: orders.length / days,
    perWeek: orders.length / weeks,
  };
};

export const computeMonthlySeasonality = (
  orders: Order[],
  now: Date = new Date(),
  months = 12
): DistributionEntry[] => {
  const results: DistributionEntry[] = [];
  const startMonth = addMonths(now, -(months - 1));

  for (let i = 0; i < months; i += 1) {
    const monthDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
    const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const end = endOfDay(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0));
    const count = orders.filter((order) => isWithinRange(order.created_at, { start, end }))
      .length;
    results.push({
      label: monthDate.toLocaleDateString("he-IL", { month: "short" }),
      count,
    });
  }

  return results;
};
