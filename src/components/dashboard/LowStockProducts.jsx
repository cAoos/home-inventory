import React from "react";
import { PackageMinus } from "lucide-react";

export default function LowStockProducts({ products }) {
  const lowStock = products.filter(p => p.quantity <= (p.min_stock || 1) && p.quantity > 0);
  const outOfStock = products.filter(p => p.quantity === 0);

  const combined = [...outOfStock, ...lowStock].slice(0, 6);

  if (combined.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
          <PackageMinus className="w-4 h-4 text-muted-foreground" />
          Stock Alerts
        </h3>
        <p className="text-sm text-muted-foreground">All products are well stocked.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
        <PackageMinus className="w-4 h-4 text-accent-foreground" />
        Stock Alerts
        <span className="ml-auto text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full font-medium">
          {combined.length}
        </span>
      </h3>
      <div className="space-y-2">
        {combined.map((p) => (
          <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div>
              <p className="text-sm font-medium text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.category} · {p.location || "—"}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              p.quantity === 0 ? "bg-destructive/10 text-destructive" : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
            }`}>
              {p.quantity === 0 ? "Out of stock" : `${p.quantity} ${p.unit}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
