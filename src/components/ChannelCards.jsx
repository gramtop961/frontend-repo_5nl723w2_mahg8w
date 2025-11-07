import React from "react";
import { inrFormat, getPaletteForChannel } from "./utils";

const ChannelCard = ({ channel, data, active, onToggle }) => {
  const color = getPaletteForChannel(channel);
  const name = channel.charAt(0).toUpperCase() + channel.slice(1);
  const totalOrders = data.orders || 0;
  const totalUnits = data.units || 0;
  const totalRevenue = data.revenue || 0;

  return (
    <button
      onClick={() => onToggle(channel)}
      className={`group text-left rounded-xl p-4 border transition-colors w-full ${
        active ? "border-white/30 bg-[#1B1F37]/70" : "border-white/10 bg-[#121526]/80 hover:border-white/20"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
          />
          <span className="text-sm text-[#E8EAF6] font-semibold">{name}</span>
        </div>
        <div className="text-[10px] text-[#A9B1D6]">Click to {active ? "exclude" : "focus"}</div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 text-[#E8EAF6]">
        <div>
          <div className="text-[10px] text-[#A9B1D6]">Orders</div>
          <div className="font-semibold tabular-nums">{new Intl.NumberFormat("en-IN").format(totalOrders)}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#A9B1D6]">Units</div>
          <div className="font-semibold tabular-nums">{new Intl.NumberFormat("en-IN").format(totalUnits)}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#A9B1D6]">Revenue</div>
          <div className="font-semibold tabular-nums">{inrFormat(totalRevenue)}</div>
        </div>
      </div>
    </button>
  );
};

export default function ChannelCards({ channels, totalsByChannel, activeChannels, onToggle }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {channels.map((ch) => (
        <ChannelCard
          key={ch}
          channel={ch}
          data={totalsByChannel.find((x) => x.channel === ch) || {}}
          active={activeChannels.includes(ch)}
          onToggle={onToggle}
        />)
      )}
    </div>
  );
}
