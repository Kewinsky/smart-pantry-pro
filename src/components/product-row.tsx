import { Check, MoreHorizontal, Snowflake, Trash2 } from "lucide-react";
import { useApp } from "../state/app-context";
import type { Product } from "../types/app";
import { ProductVisual } from "./product-visual";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

export function ProductRow({ product, emphasis = false }: { product: Product; emphasis?: boolean }) {
  const { consume, freeze, discard } = useApp();
  return <div className="flex min-w-0 items-center gap-3 border-b border-border py-3.5 last:border-0 sm:gap-4"><ProductVisual category={product.category} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{product.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{product.quantity.toLocaleString("pl-PL")} {product.unit} · {product.storageLocation}</p></div><div className="hidden min-w-32 text-right sm:block"><p className={emphasis ? "text-xs font-bold text-soon" : "text-xs font-semibold text-foreground"}>{friendlyDate(product.estimatedUseBy)}</p><p className="mt-1 text-[11px] text-muted-foreground">szacowany termin</p></div><Button aria-label={`Oznacz ${product.name} jako zjedzone`} title="Oznacz jako zjedzone" variant="outline" size="icon" onClick={()=>consume(product.id)}><Check /></Button><DropdownMenu><DropdownMenuTrigger asChild><Button aria-label="Więcej działań" variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={()=>freeze(product.id)}><Snowflake /> Zamroź</DropdownMenuItem><DropdownMenuItem onClick={()=>discard(product.id)}><Trash2 /> Wyrzuć</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>;
}

export function friendlyDate(date: string) { const today = new Date("2026-10-12T12:00:00"); const target = new Date(`${date}T12:00:00`); const days = Math.round((target.getTime()-today.getTime())/86400000); return days <= 0 ? "Warto wykorzystać dziś" : days === 1 ? "Najlepiej jutro" : days < 7 ? `Około ${days} dni` : "Bez pośpiechu"; }