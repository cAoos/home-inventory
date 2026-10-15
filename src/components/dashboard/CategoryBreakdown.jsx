import React from "react";

const categoryColors = {
  "Food": "tile-mint",
  "Beverages": "tile-sky",
  "Cleaning supplies": "tile-violet",
  "Personal care": "tile-pink",
  "Pet supplies": "tile-peach",
  "Medicines": "tile-pink",
  "Other": "tile-lemon",
};

export default function CategoryBreakdown({ products }) {
  const categories = {};
  products.forEach((p) => {
    categories[p.category] = (categories[p.category] || 0) + 1;
  });

  const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  const total = products.length;

  if (total === 0) {
    return (
      <div className="bg-card rounded-3xl border border-border shadow-sm p-5">
        <h3 className="font-heading font-semibold text-sm mb-3">By Category</h3>
        <p className="text-sm text-muted-foreground">No products yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm p-5">
      <h3 className="font-heading font-semibold text-sm mb-4">By Category</h3>
      <div className="space-y-3">
        {sorted.map(([cat, count]) => {
          const pct = Math.round((count / total) * 100);
          return (
            <div key={cat}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-foreground font-medium">{cat}</span>
                <span className="text-muted-foreground">{count} items · {pct}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${categoryColors[cat] || "tile-lemon"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
