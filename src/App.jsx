import React, { useMemo, useState } from "react";
import KPICard from "./components/KPICard";
import ChannelCards from "./components/ChannelCards";
import { TimeSeries, Stacked100, Donut } from "./components/Charts";
import Controls from "./components/Controls";
import { rows as dataRows } from "./components/data";
import {
  aggregateTotals,
  computeAOV,
  filterRows,
  groupByDate,
  perChannelTotals,
  priorPeriodDelta,
  getPriorRange,
  filterRowsByDateRange,
  inrFormat,
} from "./components/utils";

export default function App() {
  const [range, setRange] = useState("30d");
  const [activeChannels, setActiveChannels] = useState(["shopify", "myntra", "nykaa", "marketplace"]);
  const toggleChannel = (ch) => {
    setActiveChannels((prev) => (prev.includes(ch) ? prev.filter((x) => x !== ch) : [...prev, ch]));
  };

  const filtered = useMemo(() => filterRows(dataRows, activeChannels, range), [dataRows, activeChannels, range]);

  const totals = useMemo(() => aggregateTotals(filtered), [filtered]);
  const aov = useMemo(() => computeAOV(totals), [totals]);

  const perDay = useMemo(() => groupByDate(filtered).map((d) => ({ label: d.date.slice(5), value: d.revenue })), [filtered]);

  const perChannel = useMemo(() => perChannelTotals(filtered), [filtered]);

  const prior = useMemo(() => {
    const { start, end } = getPriorRange(range, dataRows);
    return filterRowsByDateRange(dataRows, activeChannels, start, end);
  }, [range, dataRows, activeChannels]);

  const deltas = useMemo(() => priorPeriodDelta(filtered, prior), [filtered, prior]);

  // KPI sparklines use last 14 per-day points
  const spark = useMemo(() => {
    const byDate = groupByDate(filtered);
    return {
      revenue: byDate.slice(-14).map((d) => d.revenue),
      orders: byDate.slice(-14).map((d) => d.orders),
      units: byDate.slice(-14).map((d) => d.units),
      aov: byDate.slice(-14).map((d) => (d.orders ? d.revenue / d.orders : 0)),
    };
  }, [filtered]);

  const stackedShare = useMemo(() => {
    // Build 100% stacked over time for selected range
    const byDate = groupByDate(filtered);
    return byDate.map((d) => {
      const label = d.date.slice(5);
      const parts = activeChannels.reduce((acc, ch) => {
        const rows = filtered.filter((r) => r.date === d.date && r.channel === ch);
        const sum = rows.reduce((a, r) => a + r.revenue, 0);
        acc[ch] = sum;
        return acc;
      }, {});
      return { label, ...parts };
    });
  }, [filtered, activeChannels]);

  const donutData = useMemo(() => {
    return perChannel.map((c) => ({ name: c.channel, value: c.revenue }));
  }, [perChannel]);

  return (
    <div className="min-h-screen bg-[#0D0F1A] text-[#E8EAF6]">
      <div className="pointer-events-none fixed inset-0" style={{
        background: "radial-gradient(1200px 800px at 20% -10%, rgba(91,0,255,0.20), transparent 60%), radial-gradient(1000px 700px at 120% 20%, rgba(43,210,255,0.12), transparent 50%)"
      }} />

      <header className="sticky top-0 z-10 backdrop-blur-md border-b border-white/10 bg-[#0D0F1A]/70">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>Commerce Pulse</div>
            <div className="text-xs text-[#A9B1D6]">Orders • Units • Revenue — at a glance</div>
          </div>
          <Controls range={range} setRange={setRange} activeChannels={activeChannels} toggleChannel={toggleChannel} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Total Orders" value={totals.orders} spark={spark.orders} delta={deltas.orders} />
          <KPICard label="Total Units" value={totals.units} spark={spark.units} delta={deltas.units} />
          <KPICard label="Total Revenue" value={Math.round(totals.revenue)} currency spark={spark.revenue} delta={deltas.revenue} />
          <KPICard label="AOV" value={Math.round(aov)} currency spark={spark.aov} delta={deltas.aov} />
        </div>

        {/* Channels */}
        <ChannelCards
          channels={["shopify", "myntra", "nykaa", "marketplace"]}
          totalsByChannel={perChannel}
          activeChannels={activeChannels}
          onToggle={toggleChannel}
        />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-xs text-[#A9B1D6]">
              <span>Metric:</span>
              {/* Simple local toggle by state */}
            </div>
            <TimeSeries data={groupByDate(filtered).map((d) => ({ label: d.date.slice(5), value: d.revenue }))} mode="revenue" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <Donut data={donutData} />
            <Stacked100 data={stackedShare} />
          </div>
        </div>
      </main>
    </div>
  );
}
