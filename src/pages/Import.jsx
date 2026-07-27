import React, { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Product, PriceRecord, ShoppingList, ShoppingItem } from "@/api/entities";
import { registerPurchase } from "@/lib/purchaseSync";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";

function parseCSV(text) {
  const lines = text.trim().split("\n").filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] || "" }), {});
  });
  return { headers, rows };
}

const PRODUCT_TEMPLATE = "name,category,brand,quantity,unit,location,purchase_date,expiration_date,min_stock,estimated_price\nMilk,Beverages,Generic,2,Liters,Refrigerator,2026-06-01,2026-07-01,1,1.50\n";
const PRICE_TEMPLATE = "product_name,brand,store,purchase_date,unit_size,quantity,price_paid,promotion,notes\nMilk,Generic,Supermarket A,2026-06-01,1L,2,3.00,,\n";
const PURCHASE_TEMPLATE = "list_name,purchase_date,product_name,category,brand,quantity,unit,store,price_paid\nWeekly groceries,2026-06-01,Milk,Beverages,Generic,2,Liters,Supermarket A,3.00\n";

export default function Import() {
  const [productFile, setProductFile] = useState(null);
  const [priceFile, setPriceFile] = useState(null);
  const [purchaseFile, setPurchaseFile] = useState(null);
  const [productPreview, setProductPreview] = useState(null);
  const [pricePreview, setPricePreview] = useState(null);
  const [purchasePreview, setPurchasePreview] = useState(null);
  const [status, setStatus] = useState({ product: null, price: null, purchase: null });

  const readFile = (file, setter) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseCSV(e.target.result);
      setter(parsed);
    };
    reader.readAsText(file);
  };

  const handleProductFile = (e) => {
    const f = e.target.files[0];
    if (f) { setProductFile(f); readFile(f, setProductPreview); setStatus(s => ({ ...s, product: null })); }
  };

  const handlePriceFile = (e) => {
    const f = e.target.files[0];
    if (f) { setPriceFile(f); readFile(f, setPricePreview); setStatus(s => ({ ...s, price: null })); }
  };

  const handlePurchaseFile = (e) => {
    const f = e.target.files[0];
    if (f) { setPurchaseFile(f); readFile(f, setPurchasePreview); setStatus(s => ({ ...s, purchase: null })); }
  };

  const importProducts = async () => {
    if (!productPreview) return;
    let count = 0;
    for (const row of productPreview.rows) {
      if (!row.name) continue;
      await Product.create({
        name: row.name,
        category: row.category || "Other",
        brand: row.brand || "",
        quantity: parseFloat(row.quantity) || 0,
        unit: row.unit || "Units",
        location: row.location || "Kitchen",
        purchase_date: row.purchase_date || "",
        expiration_date: row.expiration_date || "",
        min_stock: parseFloat(row.min_stock) || 1,
        estimated_price: parseFloat(row.estimated_price) || 0,
      });
      count++;
    }
    setStatus(s => ({ ...s, product: { ok: true, count } }));
    setProductPreview(null);
    setProductFile(null);
  };

  const importPrices = async () => {
    if (!pricePreview) return;
    let count = 0;
    for (const row of pricePreview.rows) {
      if (!row.product_name || !row.store) continue;
      const qty = parseFloat(row.quantity) || 1;
      const paid = parseFloat(row.price_paid) || 0;
      await PriceRecord.create({
        product_name: row.product_name,
        brand: row.brand || "",
        store: row.store,
        purchase_date: row.purchase_date || "",
        unit_size: row.unit_size || "",
        quantity: qty,
        price_paid: paid,
        unit_price: qty > 0 ? paid / qty : 0,
        promotion: row.promotion || "",
        notes: row.notes || "",
      });
      count++;
    }
    setStatus(s => ({ ...s, price: { ok: true, count } }));
    setPricePreview(null);
    setPriceFile(null);
  };

  const importPurchases = async () => {
    if (!purchasePreview) return;
    let count = 0;
    const listCache = new Map();
    for (const l of await ShoppingList.list()) {
      listCache.set(`${l.name}|${l.purchase_date || ""}`, l);
    }

    for (const row of purchasePreview.rows) {
      if (!row.product_name) continue;
      const purchaseDate = row.purchase_date || "";
      const listName = row.list_name || `Purchase ${purchaseDate || new Date().toISOString().slice(0, 10)}`;
      const key = `${listName}|${purchaseDate}`;
      let list = listCache.get(key);
      if (!list) {
        list = await ShoppingList.create({ name: listName, status: "completed", purchase_date: purchaseDate || null, budget: 0, notes: "Imported from CSV" });
        listCache.set(key, list);
      }

      const qty = parseFloat(row.quantity) || 1;
      const price = parseFloat(row.price_paid) || 0;

      await ShoppingItem.create({
        list_id: list.id,
        product_name: row.product_name,
        quantity: qty,
        unit: row.unit || "Units",
        estimated_price: price,
        actual_price: price,
        store: row.store || "",
        purchased: true,
        notes: "",
      });

      await registerPurchase({
        product_name: row.product_name,
        category: row.category,
        brand: row.brand,
        quantity: qty,
        unit: row.unit,
        store: row.store,
        purchase_date: purchaseDate,
        price,
      });

      count++;
    }
    setStatus(s => ({ ...s, purchase: { ok: true, count } }));
    setPurchasePreview(null);
    setPurchaseFile(null);
  };

  const downloadTemplate = (content, filename) => {
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Import Data" description="Import products and price records from CSV files" />

      {/* Products */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-semibold">Import Products</h2>
              <p className="text-xs text-muted-foreground">CSV with product inventory</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => downloadTemplate(PRODUCT_TEMPLATE, "products_template.csv")}>
            Download Template
          </Button>
        </div>

        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center mb-4">
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-2">Select a CSV file</p>
          <input type="file" accept=".csv" onChange={handleProductFile} className="hidden" id="product-file" />
          <label htmlFor="product-file">
            <Button variant="outline" size="sm" asChild><span>Choose File</span></Button>
          </label>
          {productFile && <p className="text-xs text-muted-foreground mt-2">{productFile.name}</p>}
        </div>

        {productPreview && productPreview.rows.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">{productPreview.rows.length} rows to import:</p>
            <div className="max-h-40 overflow-y-auto border border-border rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr>{productPreview.headers.map(h => <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {productPreview.rows.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {productPreview.headers.map(h => <td key={h} className="px-3 py-1.5 truncate max-w-[100px]">{row[h]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button className="mt-3" onClick={importProducts}>Import {productPreview.rows.length} Products</Button>
          </div>
        )}

        {status.product && (
          <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${status.product.ok ? "bg-green-50 text-green-700" : "bg-destructive/10 text-destructive"}`}>
            {status.product.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {status.product.ok ? `Successfully imported ${status.product.count} products!` : "Import failed"}
          </div>
        )}
      </div>

      {/* Price Records */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-heading font-semibold">Import Price Records</h2>
              <p className="text-xs text-muted-foreground">CSV with purchase history</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => downloadTemplate(PRICE_TEMPLATE, "prices_template.csv")}>
            Download Template
          </Button>
        </div>

        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center mb-4">
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-2">Select a CSV file</p>
          <input type="file" accept=".csv" onChange={handlePriceFile} className="hidden" id="price-file" />
          <label htmlFor="price-file">
            <Button variant="outline" size="sm" asChild><span>Choose File</span></Button>
          </label>
          {priceFile && <p className="text-xs text-muted-foreground mt-2">{priceFile.name}</p>}
        </div>

        {pricePreview && pricePreview.rows.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">{pricePreview.rows.length} rows to import:</p>
            <div className="max-h-40 overflow-y-auto border border-border rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr>{pricePreview.headers.map(h => <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {pricePreview.rows.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {pricePreview.headers.map(h => <td key={h} className="px-3 py-1.5 truncate max-w-[100px]">{row[h]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button className="mt-3" onClick={importPrices}>Import {pricePreview.rows.length} Price Records</Button>
          </div>
        )}

        {status.price && (
          <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${status.price.ok ? "bg-green-50 text-green-700" : "bg-destructive/10 text-destructive"}`}>
            {status.price.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {status.price.ok ? `Successfully imported ${status.price.count} price records!` : "Import failed"}
          </div>
        )}
      </div>

      {/* Completed Purchase */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-heading font-semibold">Import Completed Purchase</h2>
              <p className="text-xs text-muted-foreground">CSV of what you actually bought — registers the shopping list with prices and updates inventory</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => downloadTemplate(PURCHASE_TEMPLATE, "purchase_template.csv")}>
            Download Template
          </Button>
        </div>

        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center mb-4">
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-2">Select a CSV file</p>
          <input type="file" accept=".csv" onChange={handlePurchaseFile} className="hidden" id="purchase-file" />
          <label htmlFor="purchase-file">
            <Button variant="outline" size="sm" asChild><span>Choose File</span></Button>
          </label>
          {purchaseFile && <p className="text-xs text-muted-foreground mt-2">{purchaseFile.name}</p>}
        </div>

        {purchasePreview && purchasePreview.rows.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">{purchasePreview.rows.length} rows to import:</p>
            <div className="max-h-40 overflow-y-auto border border-border rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr>{purchasePreview.headers.map(h => <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {purchasePreview.rows.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {purchasePreview.headers.map(h => <td key={h} className="px-3 py-1.5 truncate max-w-[100px]">{row[h]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button className="mt-3" onClick={importPurchases}>Import {purchasePreview.rows.length} Purchase Items</Button>
          </div>
        )}

        {status.purchase && (
          <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${status.purchase.ok ? "bg-green-50 text-green-700" : "bg-destructive/10 text-destructive"}`}>
            {status.purchase.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {status.purchase.ok ? `Successfully imported ${status.purchase.count} purchased items into shopping lists and inventory!` : "Import failed"}
          </div>
        )}
      </div>
    </div>
  );
}
