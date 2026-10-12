import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { initialProducts } from "../data/sample-data";
import type { Product, ReceiptItem, StorageLocation } from "../types/app";
import { applyDeduction, mergeShoppingItems } from "../lib/recipes/schema";

export type ShoppingItem = { id: string; name: string; quantity?: number | null; unit?: string; done: boolean };

type AppState = {
  products: Product[];
  activeProducts: Product[];
  consume: (id: string) => void;
  freeze: (id: string) => void;
  discard: (id: string) => void;
  addProduct: (product: Pick<Product,"name"|"quantity"|"unit"|"category"|"storageLocation">) => void;
  addReceiptItems: (items: ReceiptItem[]) => void;
  adjustDate: (id: string, date: string) => void;
  shoppingItems: ShoppingItem[];
  addShoppingItem: (name: string) => void;
  toggleShoppingItem: (id: string) => void;
  addMissingToShopping: (items: { name: string; quantity: number | null; unit: string }[]) => { added: number; skipped: number };
  cookRecipe: (usage: { productId: string; amount: number }[]) => void;
};

const AppContext = createContext<AppState | null>(null);
const plusDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0,10);

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState(initialProducts);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([{id:"s1",name:"Banany",done:false},{id:"s2",name:"Kawa ziarnista",done:false},{id:"s3",name:"Woda gazowana",done:true}]);
  const updateStatus = (id: string, status: Product["status"], message: string) => {
    setProducts((current) => current.map((p) => p.id === id ? { ...p, status } : p)); toast.success(message);
  };
  const value = useMemo<AppState>(() => ({
    products,
    activeProducts: products.filter((p) => p.status === "active"),
    consume: (id) => updateStatus(id, "consumed", "Oznaczono jako zjedzone"),
    discard: (id) => updateStatus(id, "discarded", "Produkt usunięty z zapasów"),
    freeze: (id) => { setProducts((current) => current.map((p) => p.id === id ? { ...p, storageLocation: "Zamrażarka" as StorageLocation, estimatedUseBy: plusDays(45) } : p)); toast.success("Przeniesiono do zamrażarki"); },
    adjustDate: (id, date) => { setProducts((current) => current.map((p) => p.id === id ? { ...p, estimatedUseBy: date } : p)); toast.success("Zmieniono szacowany termin"); },
    addProduct: (product) => { setProducts((current) => [{ ...product, id: crypto.randomUUID(), addedAt: plusDays(0), estimatedUseBy: plusDays(7), freshnessConfidence: "low", status: "active" }, ...current]); toast.success("Produkt dodany do zapasów"); },
    addReceiptItems: (items) => { setProducts((current) => [...items.map((item, index) => ({ ...item, price: undefined, id: crypto.randomUUID(), addedAt: plusDays(0), estimatedUseBy: plusDays(item.storageLocation === "Lodówka" ? 5 + index : 14), freshnessConfidence: "medium" as const, sourceReceiptId: "demo-lidl", status: "active" as const })), ...current]); toast.success(`Dodano ${items.length} produktów`); },
    shoppingItems,
    addShoppingItem: (name) => setShoppingItems((c) => [...c, { id: crypto.randomUUID(), name, done: false }]),
    toggleShoppingItem: (id) => setShoppingItems((c) => c.map((i) => i.id === id ? { ...i, done: !i.done } : i)),
    addMissingToShopping: (items) => {
      const { added, skipped } = mergeShoppingItems(shoppingItems, items);
      if (added.length) setShoppingItems((c) => [...c, ...(added as typeof items).map((i) => ({ ...i, id: crypto.randomUUID(), done: false }))]);
      return { added: added.length, skipped };
    },
    cookRecipe: (usage) => {
      setProducts((current) => current.map((p) => {
        const u = usage.find((x) => x.productId === p.id);
        if (!u || p.status !== "active") return p;
        const r = applyDeduction(p.quantity, u.amount);
        return r.depleted ? { ...p, quantity: 0, status: "consumed" } : { ...p, quantity: r.left };
      }));
      toast.success("Zaktualizowano zapasy po gotowaniu");
    },
  }), [products, shoppingItems]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}