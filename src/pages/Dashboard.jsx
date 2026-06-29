import React, { useState, useEffect } from "react";
import { Package, AlertTriangle, Clock, DollarSign } from "lucide-react";
import moment from "moment";
import { Product, PriceRecord } from "@/api/entities";
import StatCard from "@/components/shared/StatCard";
import SpendingChart from "@/components/dashboard/SpendingChart";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import LowStockProducts from "@/components/dashboard/LowStockProducts";
import ExpiringProducts from "@/components/dashboard/ExpiringProducts";

export default function Dashboard() {
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

  const lowStock = products.filter(p => p.quantity <= (p.min_stock || 1));
  const expiringSoon = products.filter(p =>
    p.expiration_date && moment(p.expiration_date).isBefore(moment().add(7, "days"))
  );
  const totalValue = products.reduce((sum, p) => sum + ((p.estimated_price || 0) * (p.quantity || 0)), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your home inventory</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Products" value={products.length} subtext="items tracked" color="primary" />
        <StatCard icon={AlertTriangle} label="Low Stock" value={lowStock.length} subtext="need restocking" color="destructive" />
        <StatCard icon={Clock} label="Expiring Soon" value={expiringSoon.length} subtext="within 7 days" color="accent" />
        <StatCard icon={DollarSign} label="Inventory Value" value={`$${totalValue.toFixed(0)}`} subtext="estimated total" color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SpendingChart priceRecords={priceRecords} />
        <CategoryBreakdown products={products} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LowStockProducts products={products} />
        <ExpiringProducts products={products} />
      </div>
    </div>
  );
}
