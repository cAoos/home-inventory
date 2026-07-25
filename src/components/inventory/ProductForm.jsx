import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UNITS } from "@/lib/units";

const categories = ["Food", "Beverages", "Cleaning supplies", "Personal care", "Pet supplies", "Medicines", "Other"];
const locations = ["Kitchen", "Refrigerator", "Freezer", "Bathroom", "Laundry room", "Pantry", "Other"];

export default function ProductForm({ open, onOpenChange, product, initialValues, onSave }) {
  const [form, setForm] = useState(product || {
    name: "", category: "Food", brand: "", quantity: 1, unit: "Units",
    location: "Kitchen", purchase_date: "", expiration_date: "",
    min_stock: 1, consumption_rate: 0, estimated_price: 0, notes: "",
    ...initialValues,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onOpenChange(false);
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{product ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Product Name *</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Brand</Label>
              <Input value={form.brand} onChange={(e) => update("brand", e.target.value)} />
            </div>
            <div>
              <Label>Quantity *</Label>
              <Input type="number" min="0" step="0.01" value={form.quantity} onChange={(e) => update("quantity", parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Unit *</Label>
              <Select value={form.unit} onValueChange={(v) => update("unit", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Select value={form.location || "Kitchen"} onValueChange={(v) => update("location", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Min. Stock Level</Label>
              <Input type="number" min="0" step="0.01" value={form.min_stock} onChange={(e) => update("min_stock", parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Purchase Date</Label>
              <Input type="date" value={form.purchase_date || ""} onChange={(e) => update("purchase_date", e.target.value)} />
            </div>
            <div>
              <Label>Expiration Date</Label>
              <Input type="date" value={form.expiration_date || ""} onChange={(e) => update("expiration_date", e.target.value)} />
            </div>
            <div>
              <Label>Est. Price per Unit ($)</Label>
              <Input type="number" min="0" step="0.01" value={form.estimated_price} onChange={(e) => update("estimated_price", parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Consumption/Week</Label>
              <Input type="number" min="0" step="0.1" value={form.consumption_rate} onChange={(e) => update("consumption_rate", parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes || ""} onChange={(e) => update("notes", e.target.value)} rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || !form.name}>
              {saving ? "Saving..." : product ? "Update" : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
