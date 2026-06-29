import React, { useState, useEffect } from "react";
import { Plus, Store as StoreIcon, Pencil, Trash2 } from "lucide-react";
import { Store, PriceRecord } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";

const storeTypes = ["Supermarket", "Warehouse", "Convenience", "Online", "Specialty", "Other"];
const emptyForm = { name: "", type: "Supermarket", location: "", notes: "" };

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [priceRecords, setPriceRecords] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editStore, setEditStore] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => Promise.all([Store.list(), PriceRecord.list()]).then(([s, p]) => {
    setStores(s);
    setPriceRecords(p);
  });
  useEffect(() => { load(); }, []);

  const openForm = (store = null) => {
    setEditStore(store);
    setForm(store ? { name: store.name, type: store.type, location: store.location || "", notes: store.notes || "" } : emptyForm);
    setFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editStore) {
      await Store.update(editStore.id, form);
    } else {
      await Store.create(form);
    }
    setSaving(false);
    setFormOpen(false);
    load();
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this store?")) {
      await Store.delete(id);
      load();
    }
  };

  const getStoreStats = (storeName) => {
    const recs = priceRecords.filter(r => r.store === storeName);
    const avg = recs.length > 0 ? recs.reduce((s, r) => s + (r.unit_price || r.price_paid || 0), 0) / recs.length : 0;
    return { count: recs.length, avg };
  };

  return (
    <div>
      <PageHeader title="Store Compare" description="Manage and compare your stores">
        <Button onClick={() => openForm()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Store
        </Button>
      </PageHeader>

      {stores.length === 0 ? (
        <EmptyState icon={StoreIcon} title="No stores yet" description="Add your grocery stores to compare prices" actionLabel="Add Store" onAction={() => openForm()} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map(store => {
            const stats = getStoreStats(store.name);
            return (
              <div key={store.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <StoreIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{store.name}</h3>
                      <Badge variant="secondary" className="text-[10px] mt-0.5">{store.type}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openForm(store)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(store.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                {store.location && <p className="text-xs text-muted-foreground mb-3">{store.location}</p>}
                <div className="flex justify-between text-xs border-t border-border pt-3">
                  <span className="text-muted-foreground">{stats.count} price records</span>
                  {stats.count > 0 && <span className="font-medium">avg ${stats.avg.toFixed(2)}/unit</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editStore ? "Edit Store" : "Add Store"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <Label>Store Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{storeTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Address or area" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : editStore ? "Update" : "Add Store"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
