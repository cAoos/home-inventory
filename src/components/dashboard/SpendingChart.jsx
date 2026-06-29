import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import moment from "moment";

export default function SpendingChart({ priceRecords }) {
  const monthlyData = {};
  priceRecords.forEach((r) => {
    const month = moment(r.purchase_date || r.created_date).format("MMM YY");
    monthlyData[month] = (monthlyData[month] || 0) + (r.price_paid * (r.quantity || 1));
  });

  const data = Object.entries(monthlyData)
    .map(([month, total]) => ({ month, total: Math.round(total * 100) / 100 }))
    .slice(-6);

  if (data.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-sm mb-3">Monthly Spending</h3>
        <p className="text-sm text-muted-foreground">No spending data yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-heading font-semibold text-sm mb-4">Monthly Spending</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(val) => [`$${val.toFixed(2)}`, "Spent"]}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
