import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

const categoryTiles = {
  "Food": "bg-[hsl(152_70%_90%)]", "Beverages": "bg-[hsl(205_90%_92%)]", "Cleaning supplies": "bg-[hsl(258_80%_93%)]",
  "Personal care": "bg-[hsl(330_90%_93%)]", "Pet supplies": "bg-[hsl(28_100%_91%)]", "Medicines": "bg-[hsl(350_85%_93%)]", "Other": "bg-[hsl(45_95%_89%)]",
};

const categoryIcons = {
  "Food": "🍎", "Beverages": "🥤", "Cleaning supplies": "🧹",
  "Personal care": "🧴", "Pet supplies": "🐾", "Medicines": "💊", "Other": "📦",
};

export default function ProductCard({ product, onEdit, onDelete }) {
  const daysToExpiry = product.expiration_date
    ? moment(product.expiration_date).diff(moment(), "days")
    : null;
  const isExpired = daysToExpiry !== null && daysToExpiry < 0;
  const isExpiring = daysToExpiry !== null && daysToExpiry >= 0 && daysToExpiry <= 7;
  const isLowStock = product.quantity <= (product.min_stock || 1);
  const isOut = product.quantity === 0;

  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm p-4 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${categoryTiles[product.category] || categoryTiles.Other}`}>
            {categoryIcons[product.category] || "📦"}
          </span>
          <div>
            <h4 className="font-semibold text-sm text-foreground leading-tight">{product.name}</h4>
            <p className="text-xs text-muted-foreground">{product.brand || "No brand"}</p>
          </div>
        </div>
        <div className="flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-9 w-9 lg:h-7 lg:w-7" onClick={() => onEdit(product)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 lg:h-7 lg:w-7 text-destructive" onClick={() => onDelete(product.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-muted-foreground">{product.location || "—"}</span>
        <span className="font-bold text-primary bg-accent px-2.5 py-1 rounded-full">{product.quantity} {product.unit}</span>
      </div>

      {product.estimated_price > 0 && (
        <p className="text-xs text-muted-foreground mb-2">${product.estimated_price.toFixed(2)}/unit</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {isOut && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Out of stock</span>
        )}
        {!isOut && isLowStock && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400">Low stock</span>
        )}
        {isExpired && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Expired</span>
        )}
        {isExpiring && !isExpired && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">
            {daysToExpiry === 0 ? "Expires today" : `${daysToExpiry}d left`}
          </span>
        )}
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{product.category}</span>
      </div>
    </div>
  );
}
