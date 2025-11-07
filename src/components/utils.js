// Utilities: currency, date helpers, aggregations, and mock adapter

export const CHANNELS = ["shopify", "myntra", "nykaa", "marketplace"];

export function inrFormat(n) {
  if (n == null || isNaN(n)) return "₹0";
  const sign = n < 0 ? "-" : "";
  const x = Math.abs(n).toFixed(0);
  // Indian numbering format 12,34,567
  const lastThree = x.slice(-3);
  const other = x.slice(0, -3);
  const withCommas = other.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + (other ? "," : "") + lastThree;
  return `${sign}₹ ${withCommas}`;
}

export function parseDate(str) {
  const [y, m, d] = str.split("-").map((v) => parseInt(v, 10));
  return new Date(y, m - 1, d);
}

export function formatShortDate(d) {
  return d.toLocaleDateString("en-IN", { month: "short", day: "2-digit" });
}

export function getRangeDates(range, rows) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let start;
  if (range === "today") {
    start = new Date(today);
  } else if (range === "7d") {
    start = new Date(today);
    start.setDate(today.getDate() - 6);
  } else if (range === "30d") {
    start = new Date(today);
    start.setDate(today.getDate() - 29);
  } else {
    // fallback to 30d
    start = new Date(today);
    start.setDate(today.getDate() - 29);
  }
  const end = today;
  // find min available if dataset doesn't include today yet
  const minDate = rows.reduce((acc, r) => {
    const d = parseDate(r.date);
    return d < acc ? d : acc;
  }, parseDate(rows[0].date));
  if (start < minDate) start = minDate;
  return { start, end };
}

export function filterRows(rows, channels, range) {
  const { start, end } = getRangeDates(range, rows);
  return rows.filter((r) => channels.includes(r.channel) && inBetween(parseDate(r.date), start, end));
}

function inBetween(d, a, b) {
  const t = d.setHours(0, 0, 0, 0);
  return t >= a.getTime() && t <= b.getTime();
}

export function groupByDate(rows) {
  const map = new Map();
  for (const r of rows) {
    const key = r.date;
    if (!map.has(key)) map.set(key, { date: r.date, orders: 0, units: 0, revenue: 0 });
    const agg = map.get(key);
    agg.orders += r.orders;
    agg.units += r.units;
    agg.revenue += r.revenue;
  }
  const arr = Array.from(map.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
  return arr;
}

export function aggregateTotals(rows) {
  return rows.reduce(
    (acc, r) => {
      acc.orders += r.orders;
      acc.units += r.units;
      acc.revenue += r.revenue;
      return acc;
    },
    { orders: 0, units: 0, revenue: 0 }
  );
}

export function computeAOV(totals) {
  return totals.orders ? totals.revenue / totals.orders : 0;
}

export function perChannelTotals(rows) {
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r.channel)) map.set(r.channel, { channel: r.channel, orders: 0, units: 0, revenue: 0 });
    const agg = map.get(r.channel);
    agg.orders += r.orders;
    agg.units += r.units;
    agg.revenue += r.revenue;
  }
  return Array.from(map.values());
}

export function priorPeriodDelta(rows, priorRows) {
  const now = aggregateTotals(rows);
  const prev = aggregateTotals(priorRows);
  const pct = (curr, prevv) => (prevv === 0 ? 0 : ((curr - prevv) / prevv) * 100);
  return {
    orders: pct(now.orders, prev.orders),
    units: pct(now.units, prev.units),
    revenue: pct(now.revenue, prev.revenue),
    aov: pct(computeAOV(now), computeAOV(prev)),
  };
}

export function getPriorRange(range, rows) {
  const { start, end } = getRangeDates(range, rows);
  const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  const priorEnd = new Date(start);
  priorEnd.setDate(start.getDate() - 1);
  const priorStart = new Date(priorEnd);
  priorStart.setDate(priorEnd.getDate() - (days - 1));
  return { start: priorStart, end: priorEnd };
}

export function filterRowsByDateRange(rows, channels, start, end) {
  return rows.filter((r) => channels.includes(r.channel) && inBetween(parseDate(r.date), start, end));
}

export function getPaletteForChannel(ch) {
  const map = {
    shopify: "#2BD2FF",
    myntra: "#FF3CAC",
    nykaa: "#5A00FF",
    marketplace: "#FF8A00",
  };
  return map[ch] || "#A9B1D6";
}
