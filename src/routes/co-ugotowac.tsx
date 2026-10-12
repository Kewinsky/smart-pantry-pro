import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Check, ChefHat, Clock, Gauge, Leaf, Minus, Plus, RefreshCw, ShoppingCart, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../components/page-header";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import { expandRecipe, generateProposals } from "../lib/recipes/recipes.functions";
import { CRAVINGS, MEALS, SHOPPING, TIMES, defaultAnswers, scaleQty, type FullRecipe, type InventoryItem, type RecipeAnswers, type RecipeProposal } from "../lib/recipes/schema";
import { useApp } from "../state/app-context";

export const Route = createFileRoute("/co-ugotowac")({
  head: () => ({ meta: [
    { title: "Co ugotować? | Spiżarka" }, { name: "description", content: "Znajdź pomysł na danie z tego, co masz w domu." },
    { property: "og:title", content: "Co ugotować? | Spiżarka" }, { property: "og:description", content: "Trzy propozycje dań dopasowane do Twoich zapasów." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: WhatToCook,
});

type View = { kind: "form" } | { kind: "loading" } | { kind: "error"; message: string } | { kind: "proposals"; proposals: RecipeProposal[] } | { kind: "recipe"; proposals: RecipeProposal[]; recipe: FullRecipe | null; selected: RecipeProposal; error?: string };

const fmt = (q: number | null, unit: string) => (q == null ? "wg uznania" : `${q.toLocaleString("pl-PL")} ${unit}`);

function WhatToCook() {
  const { activeProducts } = useApp();
  const [answers, setAnswers] = useState<RecipeAnswers>(defaultAnswers);
  const [view, setView] = useState<View>({ kind: "form" });
  const inventory: InventoryItem[] = useMemo(() => activeProducts.map((p) => ({ id: p.id, name: p.name, quantity: p.quantity > 0 ? p.quantity : null, unit: p.unit, category: p.category, storageLocation: p.storageLocation, estimatedUseBy: p.estimatedUseBy || null, freshnessConfidence: p.freshnessConfidence })), [activeProducts]);

  const generate = async () => {
    setView({ kind: "loading" });
    try {
      const r = await generateProposals({ data: { answers, inventory } });
      setView(r.ok ? { kind: "proposals", proposals: r.data.proposals } : { kind: "error", message: r.error });
    } catch { setView({ kind: "error", message: "Nie udało się połączyć. Sprawdź internet i spróbuj ponownie." }); }
  };
  const open = async (proposals: RecipeProposal[], selected: RecipeProposal) => {
    setView({ kind: "recipe", proposals, selected, recipe: null }); window.scrollTo({ top: 0 });
    try {
      const r = await expandRecipe({ data: { answers, inventory, proposal: selected } });
      setView({ kind: "recipe", proposals, selected, recipe: r.ok ? r.data : null, error: r.ok ? undefined : r.error });
    } catch { setView({ kind: "recipe", proposals, selected, recipe: null, error: "Nie udało się pobrać przepisu." }); }
  };

  if (view.kind === "recipe") return <RecipeDetail view={view} onBack={() => setView({ kind: "proposals", proposals: view.proposals })} onRetry={() => open(view.proposals, view.selected)} />;

  return <>
    <PageHeader eyebrow="Z tego, co masz" title="Co ugotować?" description="Znajdź pomysł na danie z tego, co masz w domu. Odpowiedz na kilka pytań lub od razu użyj domyślnych ustawień." />
    {view.kind === "form" || view.kind === "error" ? <>
      {view.kind === "error" && <div role="alert" className="app-card mb-5 flex items-start gap-3 border-destructive/40 p-4 text-sm"><AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" /><div><p className="font-bold">Nie udało się przygotować propozycji</p><p className="mt-1 text-muted-foreground">{view.message}</p></div></div>}
      <Questionnaire answers={answers} setAnswers={setAnswers} />
      <div className="sticky bottom-20 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/95 p-4 backdrop-blur lg:bottom-4">
        <p className="text-sm text-muted-foreground">Dopasujemy przepisy do <span className="font-bold text-foreground">{inventory.length} produktów</span> w Twoich zapasach.</p>
        <Button size="touch" onClick={generate} disabled={!inventory.length}><ChefHat /> Pokaż 3 propozycje</Button>
      </div>
    </> : view.kind === "loading" ? <Loading /> : <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><p className="text-sm text-muted-foreground">{answers.meal} · {answers.time} · {answers.servings} os. · {answers.craving}</p><div className="flex gap-2"><Button variant="outline" onClick={() => setView({ kind: "form" })}><ArrowLeft /> Zmień odpowiedzi</Button><Button variant="outline" onClick={generate}><RefreshCw /> Inne propozycje</Button></div></div>
      <div className="grid gap-4 lg:grid-cols-3">{view.proposals.map((p) => <ProposalCard key={p.id} p={p} onOpen={() => open(view.proposals, p)} />)}</div>
    </>}
  </>;
}

function Questionnaire({ answers, setAnswers }: { answers: RecipeAnswers; setAnswers: (a: RecipeAnswers) => void }) {
  const set = <K extends keyof RecipeAnswers>(k: K, v: RecipeAnswers[K]) => setAnswers({ ...answers, [k]: v });
  return <div className="grid gap-4 lg:grid-cols-2">
    <Question n={1} title="Jaki posiłek?"><Chips options={MEALS} value={answers.meal} onChange={(v) => set("meal", v)} /></Question>
    <Question n={2} title="Ile masz czasu?"><Chips options={TIMES} value={answers.time} onChange={(v) => set("time", v)} /></Question>
    <Question n={3} title="Na ile osób gotujesz?">
      <div className="flex items-center gap-3"><Button variant="outline" size="icon" aria-label="Mniej osób" disabled={answers.servings <= 1} onClick={() => set("servings", answers.servings - 1)}><Minus /></Button><span className="w-24 text-center text-lg font-extrabold" aria-live="polite">{answers.servings} {answers.servings === 1 ? "osoba" : answers.servings < 5 ? "osoby" : "osób"}</span><Button variant="outline" size="icon" aria-label="Więcej osób" disabled={answers.servings >= 12} onClick={() => set("servings", answers.servings + 1)}><Plus /></Button></div>
    </Question>
    <Question n={4} title="Na co masz ochotę?"><Chips options={CRAVINGS} value={answers.craving} onChange={(v) => set("craving", v)} /></Question>
    <div className="lg:col-span-2"><Question n={5} title="Czy możesz dokupić składniki?"><Chips options={SHOPPING} value={answers.shopping} onChange={(v) => set("shopping", v)} /></Question></div>
  </div>;
}
function Question({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return <section className="app-card p-5"><p className="text-xs font-bold uppercase text-primary">Pytanie {n} z 5</p><h2 className="mb-3 mt-1 text-lg font-extrabold">{title}</h2>{children}</section>;
}
function Chips<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return <div role="radiogroup" className="flex flex-wrap gap-2">{options.map((o) => <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => onChange(o)} className={cn("flex min-h-10 items-center gap-1.5 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-colors", value === o ? "border-primary bg-secondary text-primary" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground")}>{value === o && <Check className="size-4" />}{o}</button>)}</div>;
}

function Loading() {
  return <div className="app-card flex flex-col items-center px-6 py-16 text-center"><span className="flex size-14 animate-pulse items-center justify-center rounded-full bg-secondary text-primary"><ChefHat className="size-7" /></span><p className="mt-5 text-lg font-extrabold">Dopasowujemy przepisy do Twoich zapasów…</p><p className="mt-2 max-w-md text-sm text-muted-foreground">Sprawdzamy, co warto zużyć najpierw, i wybieramy trzy różne pomysły. To zwykle trwa kilkanaście sekund.</p><div className="mt-8 grid w-full max-w-3xl gap-3 sm:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />)}</div></div>;
}

function Meta({ p }: { p: RecipeProposal }) {
  return <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-muted-foreground"><span className="flex items-center gap-1"><Clock className="size-3.5" />{p.prepMinutes + p.cookMinutes} min</span><span className="flex items-center gap-1"><Gauge className="size-3.5" />{p.difficulty}</span><span className="flex items-center gap-1"><Users className="size-3.5" />{p.servings} porcje</span></div>;
}

function ProposalCard({ p, onOpen }: { p: RecipeProposal; onOpen: () => void }) {
  const total = p.availableIngredients.length + p.missingIngredients.length;
  return <article className="app-card flex flex-col p-5">
    <div className="mb-4 flex h-20 items-center justify-center rounded-lg bg-secondary text-primary"><ChefHat className="size-8" /></div>
    {p.usesSoonExpiring && <span className="mb-2 flex w-fit items-center gap-1 rounded-full bg-soon-soft px-2 py-0.5 text-[11px] font-bold text-soon"><Leaf className="size-3" /> Zużywa produkty z krótkim terminem</span>}
    <h3 className="text-lg font-extrabold">{p.title}</h3>
    <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
    <div className="mt-3"><Meta p={p} /></div>
    {p.timeException && <p className="mt-2 text-xs text-soon">{p.timeException}</p>}
    <p className="mt-4 text-sm font-bold">{p.availableIngredients.length} z {total} składników masz w domu</p>
    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${(p.availableIngredients.length / Math.max(total, 1)) * 100}%` }} /></div>
    {p.missingIngredients.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Brakuje: {p.missingIngredients.map((m) => m.name).join(", ")}</p>}
    <p className="mt-4 rounded-lg bg-muted p-3 text-xs leading-5 text-muted-foreground">{p.reason}</p>
    <Button className="mt-auto w-full" size="touch" onClick={onOpen} style={{ marginTop: "1.25rem" }}>Zobacz przepis</Button>
  </article>;
}

function RecipeDetail({ view, onBack, onRetry }: { view: Extract<View, { kind: "recipe" }>; onBack: () => void; onRetry: () => void }) {
  const { addMissingToShopping, products } = useApp();
  const p = view.recipe ?? view.selected;
  const [servings, setServings] = useState(p.servings);
  const [cooking, setCooking] = useState(false);
  const sc = (q: number | null) => scaleQty(q, p.servings, servings);
  const addMissing = () => {
    if (!p.missingIngredients.length) { toast.info("Masz w domu wszystkie składniki."); return; }
    const r = addMissingToShopping(p.missingIngredients.map((m) => ({ ...m, quantity: sc(m.quantity) })));
    r.added ? toast.success(`Dodano ${r.added} do listy zakupów${r.skipped ? ` (${r.skipped} już było na liście)` : ""}`) : toast.info("Wszystkie brakujące składniki są już na liście zakupów.");
  };
  return <>
    <Button variant="ghost" className="mb-4" onClick={onBack}><ArrowLeft /> Wróć do propozycji</Button>
    <header className="app-card mb-5 p-6"><p className="text-xs font-bold uppercase text-primary">Przepis</p><h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{p.title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{p.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm"><span className="flex items-center gap-1.5"><Clock className="size-4 text-primary" />Przygotowanie {p.prepMinutes} min · gotowanie {p.cookMinutes} min</span><span className="flex items-center gap-1.5"><Gauge className="size-4 text-primary" />{p.difficulty}</span>
        <span className="flex items-center gap-2"><Users className="size-4 text-primary" /><Button variant="outline" size="icon" className="size-8" aria-label="Mniej porcji" disabled={servings <= 1} onClick={() => setServings(servings - 1)}><Minus /></Button><b>{servings} porcje</b><Button variant="outline" size="icon" className="size-8" aria-label="Więcej porcji" disabled={servings >= 12} onClick={() => setServings(servings + 1)}><Plus /></Button></span></div>
      <div className="mt-5 flex flex-wrap gap-2"><Button size="touch" disabled={!view.recipe} onClick={() => setCooking(true)}><ChefHat /> Gotuję to</Button><Button size="touch" variant="outline" onClick={addMissing}><ShoppingCart /> Dodaj brakujące do listy zakupów</Button></div>
    </header>
    <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
      <section className="app-card p-5"><h2 className="font-extrabold">Masz w domu</h2><ul className="mt-2">{p.availableIngredients.map((a) => <li key={a.productId + a.name} className="flex justify-between gap-3 border-b border-border py-2.5 text-sm last:border-0"><span className="flex items-center gap-2"><Check className="size-4 text-fresh" />{a.name}</span><span className="text-muted-foreground">{fmt(sc(a.quantity), a.unit)}</span></li>)}</ul>
        <h2 className="mt-5 font-extrabold">Do dokupienia</h2>{p.missingIngredients.length ? <ul className="mt-2">{p.missingIngredients.map((m) => <li key={m.name} className="flex justify-between gap-3 border-b border-border py-2.5 text-sm last:border-0"><span className="flex items-center gap-2"><ShoppingCart className="size-4 text-soon" />{m.name}</span><span className="text-muted-foreground">{fmt(sc(m.quantity), m.unit)}</span></li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">Nic — wszystko masz w domu.</p>}
      </section>
      <section className="app-card p-5"><h2 className="font-extrabold">Przygotowanie</h2>
        {view.recipe ? <><ol className="mt-3 space-y-3">{view.recipe.steps.map((s, i) => <li key={i} className="flex gap-3 text-sm leading-6"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">{i + 1}</span>{s}</li>)}</ol>
          {view.recipe.tips.length > 0 && <div className="mt-5 rounded-lg bg-muted p-4"><p className="text-sm font-bold">Wskazówki</p><ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">{view.recipe.tips.map((t, i) => <li key={i}>{t}</li>)}</ul></div>}
          {servings !== p.servings && <p className="mt-4 text-xs text-muted-foreground">Ilości w krokach dotyczą {p.servings} porcji — składniki po lewej są przeliczone na {servings}.</p>}</>
          : view.error ? <div role="alert" className="mt-3 text-sm"><p className="text-muted-foreground">{view.error}</p><Button variant="outline" className="mt-3" onClick={onRetry}><RefreshCw /> Spróbuj ponownie</Button></div>
          : <div className="mt-3 space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-5 animate-pulse rounded bg-muted" />)}<p className="pt-2 text-xs text-muted-foreground">Rozpisujemy kroki dla tego dania…</p></div>}
      </section>
    </div>
    {view.recipe && <CookDialog open={cooking} onOpenChange={setCooking} recipe={view.recipe} factor={servings / p.servings} products={products} />}
  </>;
}

function CookDialog({ open, onOpenChange, recipe, factor, products }: { open: boolean; onOpenChange: (o: boolean) => void; recipe: FullRecipe; factor: number; products: ReturnType<typeof useApp>["products"] }) {
  const { cookRecipe } = useApp();
  const rows = recipe.availableIngredients.map((a) => {
    const prod = products.find((x) => x.id === a.productId && x.status === "active");
    const u = recipe.inventoryUsage.find((x) => x.productId === a.productId);
    const reliable = !!prod && u?.amount != null && u.unit === prod.unit;
    const suggested = reliable && prod ? Math.min(prod.quantity, Math.round(u!.amount! * factor * 100) / 100) : 0;
    return { a, prod, reliable, suggested };
  }).filter((r) => r.prod);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const val = (id: string, s: number) => amounts[id] ?? String(s);
  const on = (id: string, reliable: boolean) => checked[id] ?? reliable;
  const confirm = () => {
    const usage = rows.filter((r) => on(r.prod!.id, r.reliable)).map((r) => ({ productId: r.prod!.id, amount: Math.max(0, Number(val(r.prod!.id, r.suggested).replace(",", ".")) || 0) })).filter((u) => u.amount > 0);
    if (!usage.length) { toast.info("Nie wybrano produktów do odjęcia."); return; }
    cookRecipe(usage); onOpenChange(false);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
    <DialogHeader><DialogTitle>Co zużyłeś?</DialogTitle><DialogDescription>Sprawdź ilości przed aktualizacją zapasów. Produkty bez pewnego dopasowania są odznaczone — zaznacz je i wpisz ilość, jeśli ich użyłeś.</DialogDescription></DialogHeader>
    <div className="divide-y divide-border">{rows.map(({ a, prod, reliable, suggested }) => { const id = prod!.id; return <label key={id} className="flex items-center gap-3 py-3 text-sm">
      <input type="checkbox" className="size-4 accent-[var(--primary)]" checked={on(id, reliable)} onChange={(e) => setChecked({ ...checked, [id]: e.target.checked })} />
      <span className="min-w-0 flex-1"><span className="block font-bold">{prod!.name}</span><span className="text-xs text-muted-foreground">Masz: {prod!.quantity.toLocaleString("pl-PL")} {prod!.unit}{!reliable && " · ilość niepewna"}{a.name !== prod!.name && ` · w przepisie: ${a.name}`}</span></span>
      <Input aria-label={`Zużyta ilość: ${prod!.name}`} inputMode="decimal" className="h-9 w-20" value={val(id, suggested)} onChange={(e) => setAmounts({ ...amounts, [id]: e.target.value })} /><span className="w-10 text-xs text-muted-foreground">{prod!.unit}</span>
    </label>; })}</div>
    <p className="text-xs text-muted-foreground">Ilości nie zejdą poniżej zera; produkt zużyty w całości zostanie oznaczony jako zjedzony.</p>
    <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Anuluj</Button><Button onClick={confirm}><Check /> Zaktualizuj zapasy</Button></DialogFooter>
  </DialogContent></Dialog>;
}
