import React from "react";

export default function Controls({ range, setRange, activeChannels, toggleChannel }) {
  const chips = [
    { key: "today", label: "Today" },
    { key: "7d", label: "7d" },
    { key: "30d", label: "30d" },
  ];
  const allChannels = ["shopify", "myntra", "nykaa", "marketplace"];
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {chips.map((c) => (
          <button
            key={c.key}
            onClick={() => setRange(c.key)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              range === c.key
                ? "border-[#2BD2FF] text-[#E8EAF6] shadow-[0_0_0_2px_rgba(43,210,255,0.15)]"
                : "border-white/10 text-[#A9B1D6] hover:border-white/20"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {allChannels.map((ch) => (
          <button
            key={ch}
            onClick={() => toggleChannel(ch)}
            className={`px-3 py-1.5 rounded-full text-xs border capitalize transition-colors ${
              activeChannels.includes(ch)
                ? "border-white/30 text-[#E8EAF6]"
                : "border-white/10 text-[#A9B1D6] hover:border-white/20"
            }`}
          >
            {ch}
          </button>
        ))}
      </div>
    </div>
  );
}
