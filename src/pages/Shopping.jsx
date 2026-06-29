import React, { useState, useEffect } from "react";
import { Plus, ShoppingCart, Check, ChevronRight, ArrowLeft, Trash2 } from "lucide-react";
import { ShoppingList, ShoppingItem } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";

export default function Shopping() {
  const [lists, setLists] = useState([]);
  const [activeList, setActiveList] = useState(null);
  const [items, setItems] = useState([]);
  const [listFormOpen, setListFormOpen] = useState(false);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [listForm, setListForm] = useState({ name: "", budget: "", notes: "" });
  const [itemForm, setItemForm] = useState({ product_name: "", quantity: 1, unit: "Units", estimated_price: "", store: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const loadLists = () => ShoppingList.list().then(setLists);
  const loadItems = (listId) => ShoppingItem.list({ list_id: listId }).then(setItems);

  useEffect(() => { loadLists(); }, []);

  const openList = (list) => {
    setActiveList(list);
    loadItems(list.id);
  };

  const createList = async (e) => {
    e.preventDefault();
    setSaving(true);
    await ShoppingList.create({ ...listForm, status: "active", budget: parseFloat(listForm.budget) || 0 });
    setSaving(false);
    setListFormOpen(false);
    setListForm({ name: "", budget: "", notes: "" });
    loadLists();
  };

  const addItem = async (e) => {
    e.preventDefault();
    setSaving(true);
    await ShoppingItem.create({ ...itemForm, list_id: activeList.id, purchased: false, quantity: parseFloat(itemForm.quantity) || 1, estimated_price: parseFloat(itemForm.estimated_price) || 0 });
    setSaving(false);
    setItemFormOpen(false);
    setItemForm({ product_name: "", quantity: 1, unit: "Units", estimated_price: "", store: "", notes: "" });
    loadItems(activeList.id);
  };

  const toggleItem = async (item) => {
    await ShoppingItem.update(item.id, { purchased: !item.purchased });
    loadItems(activeList.id);
  };

  const deleteItem = async (id) => {
    await ShoppingItem.delete(id);
    loadItems(activeList.id);
  };

  const completeList = async () => {
    await ShoppingList.update(activeList.id, { status: "completed" });
    setActiveList({ ...activeList, status: "completed" });
    loadLists();
  };

  const deleteList = async (id) => {
    if (confirm("Delete this list?")) {
      await ShoppingList.delete(id);
      loadLists();
    }
  };

  if (activeList) {
    const purchased = items.filter(i => i.purchased).length;
    const total = items.length;
    const estimatedTotal = items.reduce((s, i) => s + (i.estimated_price || 0) * (i.quantity || 1), 0);
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => { setActiveList(null); loadLists(); }}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-heading font-bold">{activeList.name}</h1>
            <p className="text-sm text-muted-foreground">{purchased}/{total} items purchased · est. ${estimatedTotal.toFixed(2)}</p>
          </div>
          <div className="flex gap-2">
            {activeList.status === "active" && total > 0 && purchased === total && (
              <Button size="sm" onClick={completeList}><Check className="w-4 h-4 mr-1" />Complete</Button>
            )}
            <Button size="sm" onClick={() => setItemFormOpen(true)}><Plus className="w-4 h-4 mr-1" />Add Item</Button>
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No items yet" description="Add items to your shopping list" actionLabel="Add Item" onAction={() => setItemFormOpen(true)} />
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className={`flex items-center gap-3 p-4 bg-card rounded-xl border border-border transition-opacity ${item.purchased ? "opacity-60" : ""}`}>
                <Checkbox checked={item.purchased} onCheckedChange={() => toggleItem(item)} />
                <div className="flex-1">
                  <p className={`font-medium text-sm ${item.purchased ? "line-through text-muted-foreground" : "text-foreground"}`}>{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} {item.unit}{item.estimated_price > 0 && ` · est. $${(item.estimated_price * item.quantity).toFixed(2)}`}{item.store && ` · ${item.store}`}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteItem(item.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Dialog open={itemFormOpen} onOpenChange={setItemFormOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Add Item</DialogTitle></DialogHeader>
            <form onSubmit={addItem} className="space-y-3">
              <div>
                <Label>Product Name *</Label>
                <Input value={itemForm.product_name} onChange={e => setItemForm(f => ({ ...f, product_name: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Quantity</Label>
                  <Input type="number" min="0.01" step="0.01" value={itemForm.quantity} onChange={e => setItemForm(f => ({ ...f, quantity: e.target.value }))} />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input value={itemForm.unit} onChange={e => setItemForm(f => ({ ...f, unit: e.target.value }))} />
                </div>
                <div>
                  <Label>Est. Price</Label>
                  <Input type="number" min="0" step="0.01" value={itemForm.estimated_price} onChange={e => setItemForm(f => ({ ...f, estimated_price: e.target.value }))} />
                </div>
                <div>
                  <Label>Store</Label>
                  <Input value={itemForm.store} onChange={e => setItemForm(f => ({ ...f, store: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setItemFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Adding..." : "Add Item"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Shopping Lists" description="Manage your shopping lists">
        <Button onClick={() => setListFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New List
        </Button>
      </PageHeader>

      {lists.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No shopping lists" description="Create your first shopping list" actionLabel="New List" onAction={() => setListFormOpen(true)} />
      ) : (
        <div className="space-y-3">
          {lists.sort((a, b) => (a.status === "completed" ? 1 : -1)).map(list => (
            <div key={list.id} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:shadow-md transition-all cursor-pointer group" onClick={() => openList(list)}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${list.status === "completed" ? "bg-green-100" : "bg-primary/10"}`}>
                  <ShoppingCart className={`w-5 h-5 ${list.status === "completed" ? "text-green-600" : "text-primary"}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{list.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={list.status === "completed" ? "secondary" : "default"} className="text-[10px]">
                      {list.status}
                    </Badge>
                    {list.budget > 0 && <span className="text-xs text-muted-foreground">Budget: ${list.budget}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100" onClick={e => { e.stopPropagation(); deleteList(list.id); }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={listFormOpen} onOpenChange={setListFormOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New Shopping List</DialogTitle></DialogHeader>
          <form onSubmit={createList} className="space-y-3">
            <div>
              <Label>List Name *</Label>
              <Input value={listForm.name} onChange={e => setListForm(f => ({ ...f, name: e.target.value }))} required placeholder="Weekly groceries" />
            </div>
            <div>
              <Label>Budget ($)</Label>
              <Input type="number" min="0" step="0.01" value={listForm.budget} onChange={e => setListForm(f => ({ ...f, budget: e.target.value }))} placeholder="Optional" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={listForm.notes} onChange={e => setListForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setListFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create List"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
