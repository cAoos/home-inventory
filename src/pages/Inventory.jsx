import React, { useState, useEffect } from "react";
import { Plus, Search, Package } from "lucide-react";
import { Product } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import ProductCard from "@/components/inventory/ProductCard";
import ProductForm from "@/components/inventory/ProductForm";

const categories = ["All", "Food", "Beverages", "Cleaning supplies", "Personal care", "Pet supplies", "Medicines", "Other"];

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProducts = () => Product.list().then(p => { setProducts(p); setLoading(false); });
  useEffect(() => { loadProducts(); }, []);

  const handleSave = async (data) => {
    if (editProduct) {
      await Product.update(editProduct.id, data);
    } else {
      await Product.create(data);
    }
    setEditProduct(null);
    loadProducts();
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this product?")) {
      await Product.delete(id);
      loadProducts();
    }
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <PageHeader title="Inventory" description="Manage your home products">
        <Button onClick={() => { setEditProduct(null); setFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </PageHeader>

      <div className="flex gap-3 mb-6 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={search || category !== "All" ? "Try adjusting your filters" : "Start by adding your first product"}
          actionLabel={!search && category === "All" ? "Add Product" : undefined}
          onAction={() => { setEditProduct(null); setFormOpen(true); }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <ProductForm
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditProduct(null); }}
        product={editProduct}
        onSave={handleSave}
      />
    </div>
  );
}
