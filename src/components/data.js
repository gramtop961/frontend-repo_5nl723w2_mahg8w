// Sample JSON data for the commerce dashboard
// Flat rows: date, channel, orders, units, revenue (INR)

const channels = ["shopify", "myntra", "nykaa", "marketplace"];

// Generate 120 days of mock data ending today
const today = new Date();
const days = 120;

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

function seededRand(seed) {
  // simple LCG for deterministic feel
  let x = seed % 2147483647;
  return () => {
    x = (x * 48271) % 2147483647;
    return (x - 1) / 2147483646;
  };
}

const rand = seededRand(123456);

const baseChannelWeights = {
  shopify: 0.38,
  myntra: 0.24,
  nykaa: 0.18,
  marketplace: 0.20,
};

const rows = [];
for (let i = days - 1; i >= 0; i--) {
  const d = new Date(today);
  d.setDate(today.getDate() - i);
  const dateStr = fmtDate(d);

  // Seasonality: weekends up, mid-week down
  const weekday = d.getDay(); // 0 Sun .. 6 Sat
  const season = [0.95, 0.98, 1.0, 1.02, 1.04, 1.15, 1.18][weekday];

  channels.forEach((ch) => {
    const weight = baseChannelWeights[ch] * (0.9 + rand() * 0.2);

    // Smooth trend: slight growth over time
    const trend = 0.92 + (i / days) * 0.05 + rand() * 0.08;

    const orders = Math.max(5, Math.round(60 * weight * season * trend + rand() * 10));
    const units = Math.max(6, Math.round(orders * (1.4 + rand() * 0.8)));

    // Different AOV trends per channel
    const aovBase = {
      shopify: 2200,
      myntra: 1600,
      nykaa: 1400,
      marketplace: 1800,
    }[ch];
    const aov = aovBase * (0.9 + rand() * 0.3);
    const revenue = +(orders * aov * (0.95 + rand() * 0.1)).toFixed(2);

    rows.push({
      date: dateStr,
      channel: ch,
      orders,
      units,
      revenue,
      aov: +(revenue / Math.max(1, orders)).toFixed(2),
    });
  });
}

export { rows, channels };
