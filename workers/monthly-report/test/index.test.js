import assert from "node:assert/strict";
import test from "node:test";
import { cleanDailyMetrics, daysInRange, monthRange, previousMonthInZone } from "../src/index.js";

test("September range follows Europe/London rather than UTC", () => {
  const range = monthRange(2026, 9, "Europe/London");
  assert.equal(range.start.toISOString(), "2026-08-31T23:00:00.000Z");
  assert.equal(range.end.toISOString(), "2026-09-30T23:00:00.000Z");
  assert.equal(daysInRange(range, "Europe/London").length, 30);
});

test("a month containing the DST transition creates 25-hour London day", () => {
  const range = monthRange(2026, 10, "Europe/London");
  const days = daysInRange(range, "Europe/London");
  const transition = days.find((day) => day.date === "2026-10-25");
  assert.equal((transition.end - transition.start) / 3_600_000, 25);
});

test("scheduled report chooses previous London calendar month", () => {
  const range = previousMonthInZone(new Date("2026-10-01T06:00:00Z"), "Europe/London");
  assert.equal(range.key, "2026-09");
});

test("anomaly threshold uses max(10, five times median) and excludes views too", () => {
  const values = [1, 2, 2, 3, 20].map((visits, index) => ({
    date: `2026-09-0${index + 1}`,
    start: new Date(),
    end: new Date(),
    visits,
    views: visits * 2,
  }));
  const result = cleanDailyMetrics(values);
  assert.equal(result.medianVisits, 2);
  assert.equal(result.anomalyThreshold, 10);
  assert.deepEqual(result.anomalies.map((day) => day.visits), [20]);
  assert.equal(result.cleanVisits, 8);
  assert.equal(result.cleanViews, 16);
});

test("a day exactly on the threshold is not anomalous", () => {
  const values = [0, 0, 10].map((visits, index) => ({
    date: `2026-09-0${index + 1}`,
    start: new Date(),
    end: new Date(),
    visits,
    views: visits,
  }));
  assert.equal(cleanDailyMetrics(values).anomalies.length, 0);
});
