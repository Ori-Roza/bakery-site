import { describe, it, expect } from "vitest";
import {
  computeKpis,
  computePopularProducts,
  filterOrdersByRange,
  getDateRange,
  getPreviousDateRange,
} from "../src/utils/statistics";

const makeOrder = (id, createdAt, total, paid = true, items = []) => ({
  id,
  created_at: createdAt,
  total,
  paid,
  deleted: false,
  pickup_date: "",
  pickup_time: "",
  items,
});

describe("statistics helpers", () => {
  it("filters orders by the current month range", () => {
    const now = new Date(2026, 1, 15); // Feb 15, 2026
    const range = getDateRange("this_month", now);
    const orders = [
      makeOrder(1, "2026-02-01T10:00:00Z", 100),
      makeOrder(2, "2026-02-14T12:00:00Z", 200),
      makeOrder(3, "2026-01-28T09:00:00Z", 150),
    ];

    const filtered = filterOrdersByRange(orders, range);
    expect(filtered).toHaveLength(2);
  });

  it("returns a previous range for comparisons", () => {
    const now = new Date(2026, 1, 15); // Feb 15, 2026
    const previous = getPreviousDateRange("this_month", now);
    expect(previous.start.getMonth()).toBe(0);
    expect(previous.end.getMonth()).toBe(0);
  });

  it("computes KPI totals and deltas", () => {
    const current = [
      makeOrder(1, "2026-02-10T12:00:00Z", 100, true),
      makeOrder(2, "2026-02-12T12:00:00Z", 50, false),
    ];
    const previous = [makeOrder(3, "2026-01-12T12:00:00Z", 80, true)];

    const kpis = computeKpis(current, previous);
    expect(kpis.totalOrders).toBe(2);
    expect(kpis.totalRevenue).toBe(150);
    expect(kpis.conversionRate).toBeCloseTo(50, 1);
    expect(kpis.averageOrderValue).toBeCloseTo(75, 1);
    expect(kpis.deltaOrders).toBeGreaterThan(0);
  });

  it("computes popular products from order items", () => {
    const orders = [
      makeOrder(1, "2026-02-10T12:00:00Z", 100, true, [
        { title: "חלה קלועה", qty: 2 },
        { title: "עוגת שוקולד", qty: 1 },
      ]),
      makeOrder(2, "2026-02-12T12:00:00Z", 50, true, [
        { title: "חלה קלועה", qty: 1 },
      ]),
    ];

    const popular = computePopularProducts(orders, 2);
    expect(popular[0].title).toBe("חלה קלועה");
    expect(popular[0].qty).toBe(3);
  });
});
