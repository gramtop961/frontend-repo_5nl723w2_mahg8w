import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { inrFormat, formatShortDate, getPaletteForChannel } from "./utils";

function CustomTooltip({ active, payload, label, mode }) {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0]?.value || 0;
  const formatted = mode === "revenue" ? inrFormat(val) : new Intl.NumberFormat("en-IN").format(val);
  return (
    <div className="rounded-md border border-white/20 bg-[#121526]/95 px-3 py-2 text-xs text-[#E8EAF6] shadow-lg">
      <div className="font-semibold">{label}</div>
      <div className="tabular-nums">{formatted}</div>
    </div>
  );
}

export function TimeSeries({ data, mode = "revenue" }) {
  const color = mode === "revenue" ? "#2BD2FF" : mode === "units" ? "#FF3CAC" : "#FF8A00";
  return (
    <div className="h-72 rounded-xl border border-white/10 bg-[#121526]/80 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 4, right: 4, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.6} />
              <stop offset="95%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="label" tick={{ fill: "#A9B1D6", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#A9B1D6", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip mode={mode} />} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#areaGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Stacked100({ data }) {
  const keys = Object.keys(data[0] || {}).filter((k) => k !== "label");
  const colors = keys.map((k) => getPaletteForChannel(k));
  return (
    <div className="h-48 rounded-xl border border-white/10 bg-[#121526]/80 p-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} stackOffset="expand" margin={{ left: 4, right: 4, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="label" tick={{ fill: "#A9B1D6", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={{ fill: "#A9B1D6", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v) => `${Math.round(v * 100)}%`} />
          {keys.map((k, i) => (
            <Bar key={k} dataKey={k} stackId="a" fill={colors[i]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Donut({ data }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  return (
    <div className="h-72 rounded-xl border border-white/10 bg-[#121526]/80 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={3}>
            {data.map((d, i) => (
              <Cell key={i} fill={getPaletteForChannel(d.name)} />
            ))}
          </Pie>
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: "#A9B1D6" }} />
          <Tooltip formatter={(v, n) => [inrFormat(v), n]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#A9B1D6] text-xs">Total</div>
          <div className="text-[#E8EAF6] text-xl font-bold tabular-nums">{inrFormat(total)}</div>
        </div>
      </div>
    </div>
  );
}
