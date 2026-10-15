import React, { useState, useEffect } from "react";
import { Plus, Search, Package } from "lucide-react";
import { Product } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

      <div className="relative mb-3">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 rounded-full"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-2 mb-4 lg:mx-0 lg:px-0 lg:flex-wrap [scrollbar-width:none]">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 px-4 h-9 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
              category === c
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25"
                : "bg-card text-muted-foreground border-border"
            }`}
          >
            {c}
          </button>
        ))}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
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
