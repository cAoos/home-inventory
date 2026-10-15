import React from "react";

// Colorful pastel tile with white text, inspired by mobile app dashboards
export default function StatCard({ icon: Icon, label, value, subtext, color = "primary" }) {
  const tileMap = {
    primary: "tile-violet",
    accent: "tile-peach",
    destructive: "tile-pink",
    blue: "tile-sky",
    purple: "tile-violet",
    mint: "tile-mint",
    lemon: "tile-lemon",
  };

  return (
    <div className={`${tileMap[color] || tileMap.primary} relative overflow-hidden rounded-3xl p-4 lg:p-5 text-white shadow-lg shadow-primary/10`}>
      <div className="absolute -right-5 -bottom-5 w-20 h-20 rounded-full bg-white/20" />
      <div className="relative flex items-start justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wide text-white/90">{label}</p>
        {Icon && (
          <div className="w-9 h-9 rounded-2xl bg-white/30 flex items-center justify-center">
            <Icon className="w-[18px] h-[18px]" />
          </div>
        )}
      </div>
      <p className="relative text-3xl font-heading font-black mt-2 drop-shadow-sm">{value}</p>
      {subtext && <p className="relative text-xs text-white/90 font-medium">{subtext}</p>}
    </div>
  );
}
