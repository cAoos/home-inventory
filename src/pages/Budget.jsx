import React, { useState, useEffect } from "react";
import { Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import { PriceRecord, Budget as BudgetEntity } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatCard from "@/components/shared/StatCard";
import moment from "moment";

const categoryColors = {
  "Food": "bg-green-500", "Beverages": "bg-blue-500", "Cleaning supplies": "bg-purple-500",
  "Personal care": "bg-pink-500", "Pet supplies": "bg-orange-500", "Medicines": "bg-red-500", "Other": "bg-gray-500",
};

export default function Budget() {
  const [month, setMonth] = useState(moment().format("YYYY-MM"));
  const [records, setRecords] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([PriceRecord.list(), BudgetEntity.list()]).then(([recs, buds]) => {
      setRecords(recs);
      setBudgets(buds);
    });
  }, []);

  const monthRecords = records.filter(r => {
    const d = r.purchase_date || r.created_date;
    return d && d.startsWith(month);
  });

  const totalSpent = monthRecords.reduce((s, r) => s + (r.price_paid * (r.quantity || 1)), 0);

  const budgetRecord = budgets.find(b => b.month === month);
  const budgetAmount2 = budgetRecord ? budgetRecord.amount : 0;
  const remaining = budgetAmount2 - totalSpent;
  const pct = budgetAmount2 > 0 ? Math.min(100, (totalSpent / budgetAmount2) * 100) : 0;

  const saveBudget = async (e) => {
    e.preventDefault();
    setSaving(true);
    const amount = parseFloat(budgetAmount) || 0;
    if (budgetRecord) {
      await BudgetEntity.update(budgetRecord.id, { amount, month });
    } else {
      await BudgetEntity.create({ month, amount, spent: 0 });
    }
    setSaving(false);
    setFormOpen(false);
    BudgetEntity.list().then(setBudgets);
  };

  const prevMonth = () => setMonth(moment(month).subtract(1, "month").format("YYYY-MM"));
  const nextMonth = () => setMonth(moment(month).add(1, "month").format("YYYY-MM"));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Budget</h1>
          <p className="text-sm text-muted-foreground">Track your monthly spending</p>
        </div>
        <Button onClick={() => { setBudgetAmount(budgetAmount2 || ""); setFormOpen(true); }}>
          Set Budget
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
        <span className="font-heading font-semibold text-lg min-w-[140px] text-center">{moment(month).format("MMMM YYYY")}</span>
        <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Wallet} label="Budget" value={budgetAmount2 > 0 ? `$${budgetAmount2.toFixed(0)}` : "Not set"} color="primary" />
        <StatCard icon={Wallet} label="Spent" value={`$${totalSpent.toFixed(2)}`} color={pct > 100 ? "destructive" : "blue"} />
        <StatCard icon={Wallet} label="Remaining" value={budgetAmount2 > 0 ? `$${remaining.toFixed(2)}` : "—"} color={remaining < 0 ? "destructive" : "accent"} />
      </div>

      {budgetAmount2 > 0 && (
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Budget used</span>
            <span className={`font-semibold ${pct > 100 ? "text-destructive" : "text-foreground"}`}>{pct.toFixed(0)}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pct > 100 ? "bg-destructive" : pct > 80 ? "bg-orange-500" : "bg-primary"}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-sm mb-4">Purchases this month ({monthRecords.length})</h3>
        {monthRecords.length === 0 ? (
          <p className="text-sm text-muted-foreground">No purchases recorded for {moment(month).format("MMMM YYYY")}.</p>
        ) : (
          <div className="space-y-2">
            {monthRecords.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{r.product_name}</p>
                  <p className="text-xs text-muted-foreground">{r.store} · {r.purchase_date ? moment(r.purchase_date).format("MMM D") : "—"}</p>
                </div>
                <span className="font-semibold text-sm">${(r.price_paid * (r.quantity || 1)).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold text-sm pt-2">
              <span>Total</span>
              <span>${totalSpent.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Set Budget for {moment(month).format("MMMM YYYY")}</DialogTitle></DialogHeader>
          <form onSubmit={saveBudget} className="space-y-3">
            <div>
              <Label>Monthly Budget ($)</Label>
              <Input type="number" min="0" step="0.01" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} placeholder="e.g. 500" required />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
