import React, { useState, useEffect } from "react";
import { Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PriceRecord } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import moment from "moment";

const emptyForm = {
  product_name: "", brand: "", store: "", purchase_date: moment().format("YYYY-MM-DD"),
  unit_size: "", quantity: 1, price_paid: 0, promotion: "", notes: "",
};

export default function PriceTracker() {
  const [records, setRecords] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("records"); // "records" | "compare"

  const load = () => PriceRecord.list().then(r => setRecords(r.sort((a, b) =>
    new Date(b.purchase_date || b.created_date) - new Date(a.purchase_date || a.created_date)
  )));
  useEffect(() => { load(); }, []);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const unitPrice = form.quantity > 0 ? (parseFloat(form.price_paid) / parseFloat(form.quantity)).toFixed(2) : "0.00";

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await PriceRecord.create({
      ...form,
      price_paid: parseFloat(form.price_paid) || 0,
      quantity: parseFloat(form.quantity) || 1,
      unit_price: parseFloat(unitPrice),
    });
    setSaving(false);
    setFormOpen(false);
    setForm(emptyForm);
    load();
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this price record?")) {
      await PriceRecord.delete(id);
      load();
    }
  };

  const filtered = records.filter(r =>
    r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.store?.toLowerCase().includes(search.toLowerCase())
  );

  // Build comparison: group by product_name
  const comparison = {};
  records.forEach(r => {
    const key = r.product_name;
    if (!comparison[key]) comparison[key] = { prices: [], stores: new Set() };
    comparison[key].prices.push({ price: r.unit_price || r.price_paid, store: r.store, date: r.purchase_date });
    comparison[key].stores.add(r.store);
  });

  return (
    <div>
      <PageHeader title="Price Tracker" description="Track and compare product prices across stores">
        <div className="flex gap-2">
          <Button variant={view === "records" ? "default" : "outline"} size="sm" onClick={() => setView("records")}>Records</Button>
          <Button variant={view === "compare" ? "default" : "outline"} size="sm" onClick={() => setView("compare")}>Compare</Button>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Record Price
          </Button>
        </div>
      </PageHeader>

      {view === "records" && (
        <>
          <div className="mb-4">
            <Input placeholder="Search by product or store..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
          </div>
          {filtered.length === 0 ? (
            <EmptyState icon={TrendingUp} title="No price records" description="Start recording prices to track trends" actionLabel="Record Price" onAction={() => setFormOpen(true)} />
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead>Promo</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{r.product_name}</p>
                          {r.brand && <p className="text-xs text-muted-foreground">{r.brand} {r.unit_size && `· ${r.unit_size}`}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{r.store}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.purchase_date ? moment(r.purchase_date).format("MMM D, YY") : "—"}</TableCell>
                      <TableCell className="text-right font-medium">${(r.price_paid || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">${(r.unit_price || 0).toFixed(2)}</TableCell>
                      <TableCell>{r.promotion && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{r.promotion}</span>}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-destructive h-7 px-2 text-xs" onClick={() => handleDelete(r.id)}>Del</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      {view === "compare" && (
        <div className="space-y-4">
          {Object.keys(comparison).length === 0 ? (
            <EmptyState icon={TrendingUp} title="No data to compare" description="Add price records to compare prices across stores" />
          ) : (
            Object.entries(comparison).map(([product, data]) => {
              const prices = data.prices.map(p => p.price).filter(Boolean);
              const min = Math.min(...prices);
              const max = Math.max(...prices);
              const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
              return (
                <div key={product} className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-heading font-semibold mb-3">{product}</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Best Price</p>
                      <p className="text-lg font-bold text-green-600">${min.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Average</p>
                      <p className="text-lg font-bold text-foreground">${avg.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Highest</p>
                      <p className="text-lg font-bold text-red-500">${max.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {data.prices.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{p.store}</span>
                        <div className="flex items-center gap-2">
                          {p.price === min && <TrendingDown className="w-3 h-3 text-green-500" />}
                          {p.price === max && <TrendingUp className="w-3 h-3 text-red-500" />}
                          <span className={`font-medium ${p.price === min ? "text-green-600" : p.price === max ? "text-red-500" : ""}`}>
                            ${p.price?.toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground">{p.date ? moment(p.date).format("MMM D") : ""}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Price</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Product Name *</Label>
                <Input value={form.product_name} onChange={e => update("product_name", e.target.value)} required />
              </div>
              <div>
                <Label>Brand</Label>
                <Input value={form.brand} onChange={e => update("brand", e.target.value)} />
              </div>
              <div>
                <Label>Store *</Label>
                <Input value={form.store} onChange={e => update("store", e.target.value)} required />
              </div>
              <div>
                <Label>Purchase Date</Label>
                <Input type="date" value={form.purchase_date} onChange={e => update("purchase_date", e.target.value)} />
              </div>
              <div>
                <Label>Unit Size</Label>
                <Input placeholder="e.g. 500g, 1L" value={form.unit_size} onChange={e => update("unit_size", e.target.value)} />
              </div>
              <div>
                <Label>Quantity Bought</Label>
                <Input type="number" min="0.01" step="0.01" value={form.quantity} onChange={e => update("quantity", e.target.value)} />
              </div>
              <div>
                <Label>Total Price Paid *</Label>
                <Input type="number" min="0" step="0.01" value={form.price_paid} onChange={e => update("price_paid", e.target.value)} required />
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Unit price: <span className="font-semibold text-foreground">${unitPrice}</span></p>
              </div>
              <div className="col-span-2">
                <Label>Promotion / Offer</Label>
                <Input placeholder="e.g. 2x1, 20% off" value={form.promotion} onChange={e => update("promotion", e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Record"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
