import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, Leaf, PackageCheck, Sparkles, WalletCards } from "lucide-react";
import freshGroceries from "../assets/fresh-groceries.jpg";
import { Button } from "../components/ui/button";
import { ManualProductDialog } from "../components/manual-product-dialog";
import { ProductRow } from "../components/product-row";
import { ProductVisual } from "../components/product-visual";
import { useApp } from "../state/app-context";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title:"Przegląd | Spiżarka" }, { name:"description", content:"Zobacz domowe zapasy i produkty, które warto wykorzystać." },
    { property:"og:title", content:"Przegląd | Spiżarka" }, { property:"og:description", content:"Domowe zapasy pod kontrolą." }, { property:"og:type", content:"website" }, { name:"twitter:card", content:"summary_large_image" },
  ] }),
  component: Index,
});

function Index() {
  const { activeProducts } = useApp(); const soon = activeProducts.filter((p)=>p.estimatedUseBy <= "2026-10-15").slice(0,4); const recent = activeProducts.filter((p)=>p.sourceReceiptId).slice(0,4);
  return <><section className="relative mb-7 min-h-64 overflow-hidden rounded-xl bg-surface-strong text-primary-foreground"><img src={freshGroceries} alt="Świeże produkty na kuchennym blacie" className="absolute inset-0 h-full w-full object-cover opacity-35" width={1400} height={800}/><div className="relative flex min-h-64 flex-col justify-end p-6 sm:p-8"><div className="max-w-xl"><p className="mb-2 text-sm font-bold text-secondary">Poniedziałek, 12 października</p><h1 className="text-3xl font-extrabold sm:text-4xl">Cześć! Co dziś zjemy?</h1><p className="mt-3 max-w-lg text-sm leading-6 text-primary-foreground/80">Masz wszystko pod kontrolą. Zobacz, co warto wykorzystać.</p><div className="mt-6 flex flex-wrap gap-2"><Button asChild variant="secondary" size="touch"><Link to="/skanuj"><Camera /> Skanuj paragon</Link></Button><ManualProductDialog /></div></div></div></section>
    <section className="mb-8 grid gap-3 sm:grid-cols-3"><Metric icon={PackageCheck} value={activeProducts.length.toString()} label="produktów w domu"/><Metric icon={Sparkles} value={soon.length.toString()} label="do wykorzystania"/><Metric icon={WalletCards} value="ok. 86 zł" label="wartości wykorzystanej żywności" hint="szacunek na podstawie oznaczonych produktów"/></section>
    <div className="grid gap-7 xl:grid-cols-[1.45fr_1fr]"><section className="app-card p-5 sm:p-6"><div className="mb-3 flex items-end justify-between"><div><p className="text-xs font-bold uppercase text-soon">Najpierw to</p><h2 className="mt-1 text-xl font-extrabold">Warto wykorzystać</h2></div><Button asChild variant="ghost" size="sm"><Link to="/wykorzystaj">Zobacz wszystkie <ArrowRight /></Link></Button></div>{soon.length ? soon.map((p)=><ProductRow key={p.id} product={p} emphasis />) : <EmptySoon />}</section>
      <section className="app-card p-5 sm:p-6"><div className="mb-3"><p className="text-xs font-bold uppercase text-primary">Ostatnio dodane</p><h2 className="mt-1 text-xl font-extrabold">Z paragonu Biedronka</h2><p className="mt-1 text-xs text-muted-foreground">Dzisiaj, 08:42</p></div>{recent.map((p)=><div key={p.id} className="flex items-center gap-3 border-b border-border py-3 last:border-0"><ProductVisual category={p.category} className="size-9"/><div className="min-w-0"><p className="truncate text-sm font-bold">{p.name}</p><p className="text-xs text-muted-foreground">{p.quantity.toLocaleString("pl-PL")} {p.unit}</p></div></div>)}</section></div></>;
}

function Metric({icon:Icon,value,label,hint}:{icon:typeof Leaf;value:string;label:string;hint?:string}) { return <div className="app-card flex items-center gap-4 p-4"><span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary"><Icon className="size-5"/></span><div><p className="text-xl font-extrabold">{value}</p><p className="text-xs text-muted-foreground">{label}</p>{hint && <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>}</div></div>; }
function EmptySoon(){return <div className="py-12 text-center"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-fresh-soft text-fresh"><Leaf /></span><p className="mt-4 font-bold">Wszystko na spokojnie</p><p className="mt-1 text-sm text-muted-foreground">Na razie nic nie wymaga uwagi.</p></div>}
