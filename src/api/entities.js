import { createStore } from './localDb';

export const Product = createStore('products');
export const PriceRecord = createStore('price_records');
export const Store = createStore('stores');
export const ShoppingList = createStore('shopping_lists');
export const ShoppingItem = createStore('shopping_items');
export const Budget = createStore('budget');
export const Alert = createStore('alerts');
