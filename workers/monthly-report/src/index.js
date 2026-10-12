const CLOUDFLARE_GRAPHQL_URL = "https://api.cloudflare.com/client/v4/graphql";
const RESEND_URL = "https://api.resend.com/emails";
const DASHBOARD_URL =
  "https://dash.cloudflare.com/f024204f80bd19142173a1637efa5229/web-analytics/overview?siteTag~in=6b0cd2f4420b446eae10463f2ddad7fa&excludeBots=Yes";
const REPORT_TIME_ZONE = "Europe/London";
const TOP_LIMIT = 10;
const GROUP_LIMIT = 5000;

/** @typedef {{ ACCOUNT_TAG: string, SITE_TAG: string, REPORT_TO: string, REPORT_FROM: string, CF_API_TOKEN: string, RESEND_API_KEY: string, TRIGGER_KEY: string }} Env */
/** @typedef {{ start: Date, end: Date, year: number, month: number, key: string }} MonthRange */
/** @typedef {{ date: string, start: Date, end: Date, visits: number, views: number }} DailyMetric */
/** @typedef {{ name: string, visits: number, views: number }} RankedMetric */

export default {
  /** @param {ScheduledController} _controller @param {Env} env @param {ExecutionContext} ctx */
  scheduled(_controller, env, ctx) {
    const reportMonth = previousMonthInZone(new Date(), REPORT_TIME_ZONE);
    ctx.waitUntil(runAndSendReport(env, reportMonth));
  },

  /** @param {Request} request @param {Env} env */
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== "GET" || url.pathname !== "/run") {
      return new Response("Not found", { status: 404 });
    }

    if (!(await secretsEqual(url.searchParams.get("key") ?? "", env.TRIGGER_KEY ?? ""))) {
      return new Response("Forbidden", { status: 403 });
    }

    const month = url.searchParams.get("month");
    if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return new Response("month must have the format YYYY-MM", { status: 400 });
    }

    const reportMonth = monthRange(Number(month.slice(0, 4)), Number(month.slice(5, 7)), REPORT_TIME_ZONE);
    const result = await runAndSendReport(env, reportMonth);
    return Response.json(result, { status: result.ok ? 200 : 502 });
  },
};

/**
 * Build the report and always attempt to send an email. Cloudflare collection errors
 * are converted into the required failure email; Resend errors still reject so a
 * scheduled invocation is visibly marked as failed.
 * @param {Env} env
 * @param {MonthRange} reportMonth
 */
export async function runAndSendReport(env, reportMonth) {
  try {
    validateEnv(env);
    const report = await collectReport(env, reportMonth);
    const email = renderReport(report);
    const resendId = await sendEmail(env, email);
    return {
      ok: true,
      month: reportMonth.key,
      visitsWithoutAnomalies: report.current.cleanVisits,
      pageViewsWithoutAnomalies: report.current.cleanViews,
      rawVisits: report.current.rawVisits,
      rawPageViews: report.current.rawViews,
      anomalies: report.current.anomalies.length,
      resendId,
    };
  } catch (error) {
    const message = publicErrorMessage(error);
    const failure = renderFailure(message);
    try {
      const resendId = await sendEmail(env, failure);
      return { ok: false, month: reportMonth.key, error: message, resendId };
    } catch (sendError) {
      throw new Error(`Не удалось собрать отчёт (${message}) и отправить письмо (${publicErrorMessage(sendError)})`);
    }
  }
}

/** @param {Env} env @param {MonthRange} currentRange */
export async function collectReport(env, currentRange) {
  await validateCloudflareSchema(env);
  const previousRange = previousMonthRange(currentRange, REPORT_TIME_ZONE);
  const [currentDays, previousDays] = await Promise.all([
    fetchDailyMetrics(env, currentRange),
    fetchDailyMetrics(env, previousRange),
  ]);
  const current = cleanDailyMetrics(currentDays);
  const previous = cleanDailyMetrics(previousDays);

  const cleanDays = current.days.filter((day) => !current.anomalyDates.has(day.date));
  const [pages, sources, countries, devices, anomalyDetails] = await Promise.all([
    fetchRankedMetric(env, cleanDays, "requestPath"),
    fetchRankedMetric(env, cleanDays, "refererHost"),
    fetchRankedMetric(env, cleanDays, "countryName"),
    fetchRankedMetric(env, cleanDays, "deviceType"),
    Promise.all(current.anomalies.map((day) => fetchAnomalyDetails(env, day))),
  ]);

  return {
    currentRange,
    previousRange,
    current: { ...current, anomalyDetails },
    previous,
    pages,
    sources,
    countries,
    devices,
  };
}

/** @param {Env} env @param {MonthRange} range */
async function fetchDailyMetrics(env, range) {
  const days = daysInRange(range, REPORT_TIME_ZONE);
  const selections = days.map((day, index) => `
    d${index}: rumPageloadEventsAdaptiveGroups(
      limit: 1
      filter: { siteTag: $siteTag, bot: 0, datetime_geq: "${day.start.toISOString()}", datetime_lt: "${day.end.toISOString()}" }
    ) { count sum { visits } }`).join("\n");
  const query = `query Daily($accountTag: string!, $siteTag: string!) {
    viewer { accounts(filter: { accountTag: $accountTag }) { ${selections} } }
  }`;
  const account = await cloudflareQuery(env, query);
  const hasAnyData = days.some((_day, index) => Array.isArray(account[`d${index}`]) && account[`d${index}`].length > 0);
  if (!hasAnyData) throw new Error(`Cloudflare вернул пустой ответ за ${range.key}`);

  return days.map((day, index) => {
    const rows = account[`d${index}`];
    const row = requireSingleAggregate(rows, `день ${day.date}`);
    return { ...day, views: numberMetric(row.count), visits: numberMetric(row.sum?.visits) };
  });
}

/**
 * Query each clean local day separately so an anomalous London calendar day can
 * be excluded exactly, including across BST/GMT boundaries.
 * @param {Env} env @param {DailyMetric[]} days @param {"requestPath"|"refererHost"|"countryName"|"deviceType"} dimension
 */
async function fetchRankedMetric(env, days, dimension) {
  if (days.length === 0) return [];
  const selections = days.map((day, index) => `
    d${index}: rumPageloadEventsAdaptiveGroups(
      limit: ${GROUP_LIMIT}
      orderBy: [sum_visits_DESC]
      filter: { siteTag: $siteTag, bot: 0, datetime_geq: "${day.start.toISOString()}", datetime_lt: "${day.end.toISOString()}" }
    ) { count sum { visits } dimensions { ${dimension} } }`).join("\n");
  const query = `query Ranking($accountTag: string!, $siteTag: string!) {
    viewer { accounts(filter: { accountTag: $accountTag }) { ${selections} } }
  }`;
  const account = await cloudflareQuery(env, query);
  const totals = new Map();

  for (let index = 0; index < days.length; index += 1) {
    const rows = requireRows(account[`d${index}`], `${dimension}, ${days[index].date}`);
    if (rows.length >= GROUP_LIMIT) {
      throw new Error(`Cloudflare вернул лимит ${GROUP_LIMIT} групп для ${dimension} за ${days[index].date}; отчёт мог бы быть неполным`);
    }
    for (const row of rows) {
      const name = normalizeDimension(row.dimensions?.[dimension], dimension);
      const existing = totals.get(name) ?? { name, visits: 0, views: 0 };
      existing.visits += numberMetric(row.sum?.visits);
      existing.views += numberMetric(row.count);
      totals.set(name, existing);
    }
  }

  const sorted = [...totals.values()]
    .sort((a, b) => b.visits - a.visits || b.views - a.views || a.name.localeCompare(b.name));
  const top = sorted.slice(0, TOP_LIMIT);
  const required = dimension === "requestPath"
    ? ["/financing-terms/", "/carta/", "/assessment/"]
    : dimension === "refererHost" ? ["linkedin.com"] : [];
  for (const name of required) {
    if (!top.some((item) => item.name === name)) {
      top.push(totals.get(name) ?? { name, visits: 0, views: 0 });
    }
  }
  return top;
}

/** @param {Env} env @param {DailyMetric} day */
async function fetchAnomalyDetails(env, day) {
  const filter = `filter: { siteTag: $siteTag, bot: 0, datetime_geq: "${day.start.toISOString()}", datetime_lt: "${day.end.toISOString()}" }`;
  const query = `query Anomaly($accountTag: string!, $siteTag: string!) {
    viewer { accounts(filter: { accountTag: $accountTag }) {
      country: rumPageloadEventsAdaptiveGroups(limit: 1, orderBy: [sum_visits_DESC], ${filter}) {
        count sum { visits } dimensions { countryName }
      }
      client: rumPageloadEventsAdaptiveGroups(limit: 1, orderBy: [sum_visits_DESC], ${filter}) {
        count sum { visits } dimensions { userAgentBrowser userAgentOS }
      }
      page: rumPageloadEventsAdaptiveGroups(limit: 1, orderBy: [sum_visits_DESC], ${filter}) {
        count sum { visits } dimensions { requestPath }
      }
    } }
  }`;
  const account = await cloudflareQuery(env, query);
  const country = requireFirstRow(account.country, `топ-страна ${day.date}`);
  const client = requireFirstRow(account.client, `браузер и ОС ${day.date}`);
  const page = requireFirstRow(account.page, `топ-страница ${day.date}`);
  return {
    ...day,
    country: displayDimension(country.dimensions?.countryName, "countryName"),
    browser: displayDimension(client.dimensions?.userAgentBrowser, "userAgentBrowser"),
    os: displayDimension(client.dimensions?.userAgentOS, "userAgentOS"),
    page: displayDimension(page.dimensions?.requestPath, "requestPath"),
  };
}

/** @param {Env} env @param {string} query */
async function cloudflareQuery(env, query) {
  const payload = await cloudflareGraphql(env, query, {
    accountTag: env.ACCOUNT_TAG,
    siteTag: env.SITE_TAG,
  });
  const accounts = payload?.data?.viewer?.accounts;
  if (!Array.isArray(accounts) || accounts.length === 0 || !accounts[0]) {
    throw new Error("Cloudflare GraphQL вернул пустой список аккаунтов");
  }
  return accounts[0];
}

/** @param {Env} env */
async function validateCloudflareSchema(env) {
  const query = `query SchemaCheck {
    group: __type(name: "AccountRumPageloadEventsAdaptiveGroups") { fields { name } }
    dimensions: __type(name: "AccountRumPageloadEventsAdaptiveGroupsDimensions") { fields { name } }
    sum: __type(name: "AccountRumPageloadEventsAdaptiveGroupsSum") { fields { name } }
    filter: __type(name: "AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject") { inputFields { name } }
    orderBy: __type(name: "AccountRumPageloadEventsAdaptiveGroupsOrderBy") { enumValues { name } }
  }`;
  const payload = await cloudflareGraphql(env, query, {});
  const data = payload?.data;
  requireSchemaNames(data?.group?.fields, ["count", "dimensions", "sum"], "поля группы");
  requireSchemaNames(data?.dimensions?.fields, ["requestPath", "refererHost", "countryName", "deviceType", "userAgentBrowser", "userAgentOS"], "dimensions");
  requireSchemaNames(data?.sum?.fields, ["visits"], "sum");
  requireSchemaNames(data?.filter?.inputFields, ["siteTag", "bot", "datetime_geq", "datetime_lt"], "filter");
  requireSchemaNames(data?.orderBy?.enumValues, ["sum_visits_DESC"], "orderBy");
}

/** @param {Env} env @param {string} query @param {Record<string, unknown>} variables */
async function cloudflareGraphql(env, query, variables) {
  const response = await fetch(CLOUDFLARE_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  const payload = await parseJsonResponse(response, "Cloudflare");
  if (!response.ok) throw new Error(`Cloudflare API: HTTP ${response.status}`);
  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    throw new Error(`Cloudflare GraphQL: ${payload.errors.map((item) => item.message ?? String(item)).join("; ")}`);
  }
  if (!payload?.data) throw new Error("Cloudflare GraphQL вернул пустое поле data");
  return payload;
}

/** @param {unknown} entries @param {string[]} required @param {string} context */
function requireSchemaNames(entries, required, context) {
  if (!Array.isArray(entries)) throw new Error(`Интроспекция Cloudflare не вернула ${context}`);
  const names = new Set(entries.map((entry) => entry?.name));
  const missing = required.filter((name) => !names.has(name));
  if (missing.length) throw new Error(`Схема Cloudflare: в ${context} отсутствуют поля ${missing.join(", ")}`);
}

/** @param {Env} env @param {{subject:string, html:string, text:string}} email */
async function sendEmail(env, email) {
  if (!env.RESEND_API_KEY) throw new Error("Не задан секрет RESEND_API_KEY");
  const response = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.REPORT_FROM,
      to: [env.REPORT_TO],
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  });
  const payload = await parseJsonResponse(response, "Resend");
  if (!response.ok || !payload?.id) {
    throw new Error(`Resend API: HTTP ${response.status}${payload?.message ? ` — ${payload.message}` : ""}`);
  }
  return payload.id;
}

/** @param {Response} response @param {string} service */
async function parseJsonResponse(response, service) {
  const text = await response.text();
  if (!text) throw new Error(`${service} вернул пустой ответ`);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${service} вернул ответ не в формате JSON`);
  }
}

/** @param {DailyMetric[]} days */
export function cleanDailyMetrics(days) {
  if (days.length === 0) throw new Error("Cloudflare не вернул дневные данные");
  const medianVisits = median(days.map((day) => day.visits));
  const anomalyThreshold = Math.max(10, 5 * medianVisits);
  const anomalies = days.filter((day) => day.visits > anomalyThreshold);
  const anomalyDates = new Set(anomalies.map((day) => day.date));
  const cleanDays = days.filter((day) => !anomalyDates.has(day.date));
  return {
    days,
    medianVisits,
    anomalyThreshold,
    anomalies,
    anomalyDates,
    cleanVisits: sum(cleanDays.map((day) => day.visits)),
    cleanViews: sum(cleanDays.map((day) => day.views)),
    rawVisits: sum(days.map((day) => day.visits)),
    rawViews: sum(days.map((day) => day.views)),
  };
}

/** @param {ReturnType<typeof collectReport> extends Promise<infer T> ? T : never} report */
export function renderReport(report) {
  const monthName = formatMonth(report.currentRange);
  const change = percentChange(report.current.cleanVisits, report.previous.cleanVisits);
  const subject = `menadd.com: посещаемость за ${monthName}`;
  const anomalyRows = report.current.anomalyDetails.length
    ? report.current.anomalyDetails.map((item) => `<tr><td>${escapeHtml(formatDate(item.date))}</td><td>${formatNumber(item.visits)}</td><td>${formatNumber(item.views)}</td><td>${escapeHtml(item.country)}</td><td>${escapeHtml(item.browser)} / ${escapeHtml(item.os)}</td><td><strong>${escapeHtml(item.page)}</strong></td></tr>`).join("")
    : '<tr><td colspan="6">Аномальных дней нет</td></tr>';

  const html = `<!doctype html><html lang="ru"><body style="font-family:Arial,sans-serif;color:#222;line-height:1.45">
    <h1 style="font-size:22px">menadd.com: посещаемость за ${escapeHtml(monthName)}</h1>
    <table style="border-collapse:collapse"><tbody>
      ${summaryRow("Визиты (без аномалий)", formatNumber(report.current.cleanVisits))}
      ${summaryRow(`Изменение к ${formatMonth(report.previousRange)}`, change)}
      ${summaryRow("Просмотры страниц (без аномалий)", formatNumber(report.current.cleanViews))}
    </tbody></table>
    <h2 style="font-size:18px">Аномальные дни</h2>
    <p>Критерий: визиты за день &gt; max(10, 5 × медиана). Медиана: ${formatNumber(report.current.medianVisits)}, порог: ${formatNumber(report.current.anomalyThreshold)}.</p>
    <table style="border-collapse:collapse"><thead>${tableHeader(["Дата", "Визиты", "Просмотры", "Топ-страна", "Топ-браузер / ОС", "Топ-страница"])}</thead><tbody>${anomalyRows}</tbody></table>
    ${rankingHtml("Топ страниц", report.pages, true)}
    ${rankingHtml("Топ источников", report.sources, true)}
    ${rankingHtml("Топ стран", report.countries, false)}
    ${rankingHtml("Устройства", report.devices, false)}
    <p><a href="${DASHBOARD_URL}">Открыть Cloudflare Web Analytics</a></p>
  </body></html>`;

  const anomalyText = report.current.anomalyDetails.length
    ? report.current.anomalyDetails.map((item) => `${formatDate(item.date)} — визиты: ${formatNumber(item.visits)}, просмотры: ${formatNumber(item.views)}, страна: ${item.country}, браузер/ОС: ${item.browser} / ${item.os}, страница: ${item.page}`).join("\n")
    : "Аномальных дней нет";
  const text = `menadd.com: посещаемость за ${monthName}\n\n` +
    `Визиты (без аномалий): ${formatNumber(report.current.cleanVisits)}\n` +
    `Изменение к ${formatMonth(report.previousRange)}: ${change}\n` +
    `Просмотры страниц (без аномалий): ${formatNumber(report.current.cleanViews)}\n\n` +
    `Аномальные дни\nКритерий: визиты > max(10, 5 × медиана). Медиана: ${formatNumber(report.current.medianVisits)}, порог: ${formatNumber(report.current.anomalyThreshold)}.\n${anomalyText}\n\n` +
    `${rankingText("Топ страниц", report.pages)}\n\n${rankingText("Топ источников", report.sources)}\n\n` +
    `${rankingText("Топ стран", report.countries)}\n\n${rankingText("Устройства", report.devices)}\n\n${DASHBOARD_URL}`;
  return { subject, html, text };
}

/** @param {string} message */
function renderFailure(message) {
  const safe = escapeHtml(message);
  return {
    subject: "menadd.com: отчёт не собран",
    html: `<!doctype html><html lang="ru"><body style="font-family:Arial,sans-serif"><h1>Отчёт не собран</h1><p>${safe}</p><p><a href="${DASHBOARD_URL}">Открыть Cloudflare Web Analytics</a></p></body></html>`,
    text: `Отчёт menadd.com не собран.\n\nОшибка: ${message}\n\n${DASHBOARD_URL}`,
  };
}

/** @param {string} title @param {RankedMetric[]} rows @param {boolean} emphasize */
function rankingHtml(title, rows, emphasize) {
  const body = rows.length ? rows.map((row) => {
    const highlighted = emphasize && shouldEmphasize(title, row.name);
    const name = highlighted ? `<strong>${escapeHtml(row.name)}</strong>` : escapeHtml(row.name);
    const visits = highlighted ? `<strong>${formatNumber(row.visits)}</strong>` : formatNumber(row.visits);
    const views = highlighted ? `<strong>${formatNumber(row.views)}</strong>` : formatNumber(row.views);
    return `<tr><td>${name}</td><td>${visits}</td><td>${views}</td></tr>`;
  }).join("") : '<tr><td colspan="3">Нет данных</td></tr>';
  return `<h2 style="font-size:18px">${escapeHtml(title)}</h2><table style="border-collapse:collapse"><thead>${tableHeader([title === "Устройства" ? "Устройство" : "Значение", "Визиты", "Просмотры"])}</thead><tbody>${body}</tbody></table>`;
}

/** @param {string} title @param {RankedMetric[]} rows */
function rankingText(title, rows) {
  return `${title}\n${rows.length ? rows.map((row, index) => `${index + 1}. ${row.name}: ${formatNumber(row.visits)} визитов, ${formatNumber(row.views)} просмотров`).join("\n") : "Нет данных"}`;
}

/** @param {string} title @param {string} value */
function shouldEmphasize(title, value) {
  if (title === "Топ источников") return value.toLowerCase() === "linkedin.com";
  if (title === "Топ страниц") return ["/financing-terms/", "/carta/", "/assessment/"].includes(value);
  return false;
}

/** @param {string[]} labels */
function tableHeader(labels) {
  return `<tr>${labels.map((label) => `<th style="border:1px solid #ccc;padding:6px;text-align:left">${escapeHtml(label)}</th>`).join("")}</tr>`;
}

/** @param {string} label @param {string} value */
function summaryRow(label, value) {
  return `<tr><th style="border:1px solid #ccc;padding:7px;text-align:left">${escapeHtml(label)}</th><td style="border:1px solid #ccc;padding:7px">${escapeHtml(value)}</td></tr>`;
}

/** @param {Date} now @param {string} timeZone */
export function previousMonthInZone(now, timeZone) {
  const parts = zonedParts(now, timeZone);
  const month = parts.month === 1 ? 12 : parts.month - 1;
  const year = parts.month === 1 ? parts.year - 1 : parts.year;
  return monthRange(year, month, timeZone);
}

/** @param {MonthRange} range @param {string} timeZone */
function previousMonthRange(range, timeZone) {
  const month = range.month === 1 ? 12 : range.month - 1;
  const year = range.month === 1 ? range.year - 1 : range.year;
  return monthRange(year, month, timeZone);
}

/** @param {number} year @param {number} month @param {string} timeZone */
export function monthRange(year, month, timeZone) {
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  return {
    year,
    month,
    key: `${year}-${String(month).padStart(2, "0")}`,
    start: zonedDateTimeToUtc(year, month, 1, 0, 0, 0, timeZone),
    end: zonedDateTimeToUtc(nextYear, nextMonth, 1, 0, 0, 0, timeZone),
  };
}

/** @param {MonthRange} range @param {string} timeZone */
export function daysInRange(range, timeZone) {
  const result = [];
  const days = new Date(Date.UTC(range.year, range.month, 0)).getUTCDate();
  for (let day = 1; day <= days; day += 1) {
    const next = new Date(Date.UTC(range.year, range.month - 1, day + 1));
    const start = zonedDateTimeToUtc(range.year, range.month, day, 0, 0, 0, timeZone);
    const end = zonedDateTimeToUtc(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), 0, 0, 0, timeZone);
    result.push({ date: `${range.key}-${String(day).padStart(2, "0")}`, start, end, visits: 0, views: 0 });
  }
  return result;
}

/** @param {number} year @param {number} month @param {number} day @param {number} hour @param {number} minute @param {number} second @param {string} timeZone */
function zonedDateTimeToUtc(year, month, day, hour, minute, second, timeZone) {
  const desired = Date.UTC(year, month - 1, day, hour, minute, second);
  let candidate = desired;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const actual = zonedParts(new Date(candidate), timeZone);
    const actualAsUtc = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
    const adjustment = desired - actualAsUtc;
    candidate += adjustment;
    if (adjustment === 0) return new Date(candidate);
  }
  throw new Error(`Не удалось преобразовать локальное время для ${timeZone}`);
}

/** @param {Date} date @param {string} timeZone */
function zonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
  return { year: values.year, month: values.month, day: values.day, hour: values.hour, minute: values.minute, second: values.second };
}

/** @param {number[]} values */
function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** @param {number[]} values */
function sum(values) { return values.reduce((total, value) => total + value, 0); }

/** @param {unknown} value */
function numberMetric(value) {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number)) throw new Error("Cloudflare вернул некорректное числовое значение");
  return number;
}

/** @param {unknown} rows @param {string} context */
function requireRows(rows, context) {
  if (!Array.isArray(rows)) throw new Error(`Cloudflare вернул пустой ответ: ${context}`);
  return rows;
}

/** @param {unknown} rows @param {string} context */
function requireSingleAggregate(rows, context) {
  const values = requireRows(rows, context);
  return values[0] ?? { count: 0, sum: { visits: 0 } };
}

/** @param {unknown} rows @param {string} context */
function requireFirstRow(rows, context) {
  const values = requireRows(rows, context);
  if (!values[0]) throw new Error(`Cloudflare вернул пустой ответ: ${context}`);
  return values[0];
}

/** @param {unknown} value @param {string} dimension */
function displayDimension(value, dimension) {
  const string = String(value ?? "").trim();
  if (string) return string;
  if (dimension === "refererHost") return "Прямой переход";
  return "Не определено";
}

/** @param {unknown} value @param {string} dimension */
function normalizeDimension(value, dimension) {
  const displayed = displayDimension(value, dimension);
  if (dimension === "refererHost") {
    const host = displayed.toLowerCase().replace(/\.$/, "");
    if (host === "linkedin.com" || host.endsWith(".linkedin.com")) return "linkedin.com";
  }
  return displayed;
}

/** @param {number} current @param {number} previous */
function percentChange(current, previous) {
  if (previous === 0) return current === 0 ? "0%" : "— (в прошлом месяце 0)";
  const value = ((current - previous) / previous) * 100;
  return `${value > 0 ? "+" : ""}${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value)}%`;
}

/** @param {MonthRange} range */
function formatMonth(range) {
  return new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(range.year, range.month - 1, 1))).replace(/^./u, (letter) => letter.toUpperCase());
}

/** @param {string} date */
function formatDate(date) {
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

/** @param {number} value */
function formatNumber(value) { return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value); }

/** @param {unknown} value */
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

/** @param {Env} env */
function validateEnv(env) {
  for (const key of ["ACCOUNT_TAG", "SITE_TAG", "REPORT_TO", "REPORT_FROM", "CF_API_TOKEN", "RESEND_API_KEY", "TRIGGER_KEY"]) {
    if (!env[key]) throw new Error(`Не задана настройка ${key}`);
  }
}

/** @param {unknown} error */
function publicErrorMessage(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/Bearer\s+\S+/gi, "Bearer [скрыто]").slice(0, 2000);
}

/** @param {string} supplied @param {string} expected */
async function secretsEqual(supplied, expected) {
  if (!supplied || !expected) return false;
  const encoder = new TextEncoder();
  const [left, right] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(supplied)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const leftBytes = new Uint8Array(left);
  const rightBytes = new Uint8Array(right);
  let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) difference |= leftBytes[index] ^ rightBytes[index];
  return difference === 0;
}
