import React from "react";

// Purple-scale tile; each tile class sets its own text color
export default function StatCard({ icon: Icon, label, value, subtext, color = "primary" }) {
  const tileMap = {
    primary: "tile-deep",
    destructive: "tile-intense",
    accent: "tile-lavender",
    mint: "tile-mist",
    blue: "tile-mist",
    purple: "tile-medium",
  };

  return (
    <div className={`${tileMap[color] || tileMap.primary} relative overflow-hidden rounded-3xl p-4 lg:p-5 shadow-lg shadow-primary/10`}>
      <div className="absolute -right-5 -bottom-5 w-20 h-20 rounded-full bg-white/20 mix-blend-soft-light" />
      <div className="relative flex items-start justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wide opacity-85">{label}</p>
        {Icon && (
          <div className="w-9 h-9 rounded-2xl bg-white/25 flex items-center justify-center">
            <Icon className="w-[18px] h-[18px]" />
          </div>
        )}
      </div>
      <p className="relative text-3xl font-heading font-black mt-2">{value}</p>
      {subtext && <p className="relative text-xs opacity-85 font-medium">{subtext}</p>}
    </div>
  );
}
