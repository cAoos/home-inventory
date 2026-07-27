import { Product, PriceRecord } from "@/api/entities";

// Applies a purchased item to inventory (creates or restocks the product) and,
// when a store is known, logs a price record for the Price Tracker/Analytics pages.
export async function registerPurchase({ product_name, category, brand, quantity, unit, store, purchase_date, price }) {
  if (!product_name) return;
  const qty = parseFloat(quantity) || 0;
  const paid = parseFloat(price) || 0;

  const products = await Product.list();
  const existing = products.find(p => p.name.trim().toLowerCase() === product_name.trim().toLowerCase());

  if (existing) {
    await Product.update(existing.id, {
      quantity: (existing.quantity || 0) + qty,
      purchase_date: purchase_date || existing.purchase_date,
      estimated_price: paid > 0 ? paid : existing.estimated_price,
    });
  } else {
    await Product.create({
      name: product_name,
      category: category || "Other",
      brand: brand || "",
      quantity: qty,
      unit: unit || "Units",
      location: "Kitchen",
      purchase_date: purchase_date || "",
      expiration_date: "",
      min_stock: 1,
      estimated_price: paid,
    });
  }

  if (store) {
    await PriceRecord.create({
      product_name,
      brand: brand || "",
      store,
      purchase_date: purchase_date || "",
      unit_size: unit || "",
      quantity: qty,
      price_paid: paid,
      unit_price: qty > 0 ? paid / qty : 0,
      promotion: "",
      notes: "",
    });
  }
}
