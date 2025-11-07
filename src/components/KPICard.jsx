import React from "react";
import { inrFormat } from "./utils";

function Delta({ value }) {
  const up = value >= 0;
  const color = up ? "text-emerald-400" : "text-rose-400";
  const arrow = up ? "▲" : "▼";
  return (
    <div className={`text-xs ${color} font-medium tabular-nums`}> 
      {arrow} {Math.abs(value).toFixed(1)}% vs prior
    </div>
  );
}

export default function KPICard({ label, value, currency = false, spark = [], delta = 0 }) {
  const display = currency ? inrFormat(value) : new Intl.NumberFormat("en-IN").format(value || 0);
  const max = Math.max(...spark, 1);
  const path = spark
    .map((v, i) => `${(i / Math.max(1, spark.length - 1)) * 100},${100 - (v / max) * 100}`)
    .join(" ");

  return (
    <div className="relative rounded-xl bg-[#121526]/90 border border-white/10 p-4 shadow-sm text-[#E8EAF6]">
      <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
        boxShadow: "inset 0 0 40px rgba(90,0,255,0.08)",
      }} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[#A9B1D6]">{label}</div>
          <div className="mt-1 text-3xl font-bold tabular-nums" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>{display}</div>
        </div>
        <Delta value={delta} />
      </div>
      <div className="mt-4 h-10 w-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2BD2FF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#5A00FF" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <polyline fill="none" stroke="url(#grad)" strokeWidth="2" points={path} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
