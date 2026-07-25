import { UNITS } from "@/lib/units";

const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

const normalize = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .trim();

const UNIT_SYNONYMS = {
  Units: ["unidad", "unidades", "u", "und", "unid"],
  Packs: ["paquete", "paquetes", "pack", "packs"],
  Boxes: ["caja", "cajas", "box", "boxes"],
  Bottles: ["botella", "botellas", "bottle", "bottles"],
  Bags: ["bolsa", "bolsas", "bag", "bags"],
  Grams: ["gramo", "gramos", "gr", "grs", "g"],
  Kilograms: ["kilo", "kilos", "kilogramo", "kilogramos", "kg", "kgs"],
  Pounds: ["libra", "libras", "lb", "lbs"],
  Ounces: ["onza", "onzas", "oz"],
  Milliliters: ["mililitro", "mililitros", "ml"],
  Liters: ["litro", "litros", "lt", "lts", "l"],
  Gallons: ["galon", "galones", "gal"],
};

const UNIT_LOOKUP = Object.entries(UNIT_SYNONYMS).reduce((acc, [unit, synonyms]) => {
  synonyms.forEach((s) => { acc[s] = unit; });
  return acc;
}, {});

export function matchUnit(token) {
  if (!token) return null;
  const key = normalize(token).replace(/[.,]/g, "");
  return UNIT_LOOKUP[key] || UNITS.find((u) => normalize(u) === key) || null;
}

const INVENTORY_TRIGGERS = ["inventario", "inventory"];
const SHOPPING_TRIGGERS = ["shopping list", "lista de compras", "lista de mercado", "shopping", "lista", "compras"];

function stripTrigger(text, triggers) {
  const normalized = normalize(text);
  const sorted = [...triggers].sort((a, b) => b.length - a.length);
  for (const trigger of sorted) {
    if (normalized.startsWith(trigger)) {
      let rest = text.slice(trigger.length);
      rest = rest.replace(/^[\s,]+/, "");
      return rest;
    }
  }
  return text;
}

const TRAILING_QTY_UNIT = /^(.*?)[,]?\s+(\d+(?:[.,]\d+)?)\s*([a-zA-ZáéíóúñÁÉÍÓÚÑ]+)\.?\s*$/;

export function parseInventoryVoiceCommand(transcript) {
  const stripped = stripTrigger(transcript, INVENTORY_TRIGGERS).trim();
  if (!stripped) return null;

  const match = stripped.match(TRAILING_QTY_UNIT);
  if (match) {
    const [, namePart, qtyRaw, unitToken] = match;
    const name = namePart.replace(/[,]+$/, "").trim();
    const quantity = parseFloat(qtyRaw.replace(",", ".")) || 1;
    const unit = matchUnit(unitToken) || "Units";
    return { name: name || stripped, quantity, unit };
  }

  return { name: stripped, quantity: 1, unit: "Units" };
}

export function parseShoppingVoiceCommand(transcript) {
  let stripped = stripTrigger(transcript, SHOPPING_TRIGGERS).trim();
  if (!stripped) return null;

  stripped = stripped.replace(/\bcoma\b/gi, ",");
  const parts = stripped.split(",").map((p) => p.trim()).filter(Boolean);

  const [store = "", product_name = "", quantityRaw = "", unitRaw = "", priceRaw = ""] = parts;

  const quantity = parseFloat(quantityRaw.replace(",", ".")) || 1;
  const unit = matchUnit(unitRaw) || "Units";
  const estimated_price = parseFloat(priceRaw.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;

  return { store, product_name, quantity, unit, estimated_price };
}
