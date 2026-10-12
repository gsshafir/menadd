import assert from "node:assert/strict";
import test from "node:test";
import {
  cleanDailyMetrics,
  daysInRange,
  detectAnomalousDays,
  detectAutomatedTraffic,
  monthRange,
  previousMonthInZone,
  renderReport,
} from "../src/index.js";

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

test("new anomaly rule requires three real records in one no-referer profile", () => {
  const values = [20, 10].map((visits, index) => ({
    date: `2026-09-0${index + 1}`,
    start: new Date(),
    end: new Date(),
    visits,
    views: visits,
    realRecords: index === 0 ? 3 : 1,
    sampleInterval: 10,
  }));
  const profile = { country: "China", browser: "Chrome", os: "Windows", referer: "", visits: 20, views: 20, realRecords: 3 };
  const anomalies = detectAnomalousDays(values, [
    { date: "2026-09-01", profiles: [profile] },
    { date: "2026-09-02", profiles: [{ ...profile, visits: 10, views: 10, realRecords: 1 }] },
  ]);
  const result = cleanDailyMetrics(values, anomalies);
  assert.deepEqual(anomalies.map((day) => day.date), ["2026-09-01"]);
  assert.equal(result.cleanVisits, 10);
  assert.equal(result.cleanViews, 10);
  assert.equal(result.realRecords, 4);
  assert.equal(result.sampleInterval, 7.5);
});

test("multiple profiles or a referer prevent anomaly classification", () => {
  const day = { date: "2026-09-01", start: new Date(), end: new Date(), visits: 30, views: 30, realRecords: 3, sampleInterval: 10 };
  const base = { country: "China", browser: "Chrome", os: "Windows", referer: "", visits: 20, views: 20, realRecords: 2 };
  assert.equal(detectAnomalousDays([day], [{ date: day.date, profiles: [base, { ...base, country: "US", realRecords: 1 }] }]).length, 0);
  assert.equal(detectAnomalousDays([day], [{ date: day.date, profiles: [{ ...base, referer: "google.com", realRecords: 3 }] }]).length, 0);
});

test("automated traffic block triggers at 80 percent", () => {
  const automated = detectAutomatedTraffic(100, [
    { country: "China", browser: "Chrome", os: "Windows", referer: "", visits: 80, views: 80, realRecords: 8 },
    { country: "US", browser: "Safari", os: "macOS", referer: "google.com", visits: 20, views: 20, realRecords: 20 },
  ]);
  assert.equal(automated.detected, true);
  assert.equal(automated.share, 0.8);
});

test("report uses lowercase month without abbreviation and handles zero comparison", () => {
  const range = monthRange(2026, 9, "Europe/London");
  const previousRange = monthRange(2026, 8, "Europe/London");
  const emptyRankings = [];
  const email = renderReport({
    currentRange: range,
    previousRange,
    current: { cleanVisits: 30, cleanViews: 30, rawVisits: 30, rawViews: 30, realRecords: 3, sampleInterval: 10, anomalyDetails: [] },
    previous: { cleanVisits: 0 },
    automatedTraffic: { detected: false },
    pages: emptyRankings,
    sources: emptyRankings,
    countries: emptyRankings,
    devices: emptyRankings,
    keyPages: ["/financing-terms/", "/carta/", "/assessment/", "/assessment/structure/"].map((name) => ({ name, visits: 0, views: 0 })),
  });
  assert.equal(email.subject, "menadd.com: посещаемость за сентябрь 2026");
  assert.match(email.text, /^Данные выборочные, коэффициент 10\./);
  assert.match(email.text, /нет данных для сравнения/);
  assert.doesNotMatch(email.text, /2026 г\./);
});
