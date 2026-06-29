import React, { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import { Product, PriceRecord } from "@/api/entities";
import SpendingChart from "@/components/dashboard/SpendingChart";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import EmptyState from "@/components/shared/EmptyState";

export default function Analytics() {
  const [products, setProducts] = useState([]);
  const [priceRecords, setPriceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([Product.list(), PriceRecord.list()]).then(([prods, prices]) => {
      setProducts(prods);
      setPriceRecords(prices);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  // Top 5 products by purchase frequency
  const productFreq = {};
  priceRecords.forEach(r => {
    productFreq[r.product_name] = (productFreq[r.product_name] || 0) + 1;
  });
  const topProducts = Object.entries(productFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Store comparison: avg unit price per store
  const storeData = {};
  priceRecords.forEach(r => {
    if (!r.store) return;
    if (!storeData[r.store]) storeData[r.store] = { total: 0, count: 0 };
    storeData[r.store].total += r.unit_price || r.price_paid || 0;
    storeData[r.store].count++;
  });
  const storeAvgs = Object.entries(storeData)
    .map(([store, d]) => ({ store, avg: d.total / d.count, count: d.count }))
    .sort((a, b) => a.avg - b.avg);

  const totalSpent = priceRecords.reduce((s, r) => s + (r.price_paid * (r.quantity || 1)), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Insights from your spending data</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Spent</p>
          <p className="text-2xl font-heading font-bold">${totalSpent.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">{priceRecords.length} purchases recorded</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Products Tracked</p>
          <p className="text-2xl font-heading font-bold">{products.length}</p>
          <p className="text-xs text-muted-foreground mt-1">in inventory</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Stores Visited</p>
          <p className="text-2xl font-heading font-bold">{Object.keys(storeData).length}</p>
          <p className="text-xs text-muted-foreground mt-1">unique stores</p>
        </div>
      </div>

      {priceRecords.length === 0 ? (
        <EmptyState icon={BarChart3} title="No data yet" description="Add price records to see analytics" />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SpendingChart priceRecords={priceRecords} />
            <CategoryBreakdown products={products} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {topProducts.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-heading font-semibold text-sm mb-4">Most Purchased Products</h3>
                <div className="space-y-3">
                  {topProducts.map(([name, count], i) => (
                    <div key={name} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="flex-1 text-sm font-medium truncate">{name}</span>
                      <span className="text-xs text-muted-foreground">{count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {storeAvgs.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-heading font-semibold text-sm mb-4">Store Avg. Unit Price (lowest first)</h3>
                <div className="space-y-3">
                  {storeAvgs.map((s, i) => (
                    <div key={s.store} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${i === 0 ? "bg-green-500" : "bg-muted-foreground"}`} />
                        <span className="text-sm">{s.store}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-semibold ${i === 0 ? "text-green-600" : "text-foreground"}`}>${s.avg.toFixed(2)}/unit</span>
                        <p className="text-xs text-muted-foreground">{s.count} records</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
