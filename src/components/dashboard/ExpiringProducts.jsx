import React from "react";
import { AlertTriangle, Clock } from "lucide-react";
import moment from "moment";

export default function ExpiringProducts({ products }) {
  const expiring = products
    .filter(p => p.expiration_date && moment(p.expiration_date).isBefore(moment().add(7, "days")))
    .sort((a, b) => moment(a.expiration_date).diff(moment(b.expiration_date)));

  if (expiring.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Expiring Soon
        </h3>
        <p className="text-sm text-muted-foreground">No products expiring within 7 days.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        Expiring Soon
        <span className="ml-auto text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium">
          {expiring.length}
        </span>
      </h3>
      <div className="space-y-2">
        {expiring.slice(0, 5).map((p) => {
          const days = moment(p.expiration_date).diff(moment(), "days");
          const isExpired = days < 0;
          return (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.brand || "No brand"} · {p.quantity} {p.unit}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                isExpired ? "bg-destructive/10 text-destructive" : days <= 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
              }`}>
                {isExpired ? "Expired" : days === 0 ? "Today" : `${days}d left`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
