import { z } from "zod";

export const MEALS = ["Śniadanie", "Obiad", "Kolacja", "Przekąska", "Bez znaczenia"] as const;
export const TIMES = ["Do 15 minut", "Do 30 minut", "Do 60 minut", "Bez ograniczeń"] as const;
export const CRAVINGS = ["Coś lekkiego i zdrowego", "Coś wysokobiałkowego", "Comfort food", "Kuchnia świata", "Coś prostego i szybkiego", "Zaskocz mnie"] as const;
export const SHOPPING = ["Nie, tylko produkty, które mam w domu", "Tak, mogę dokupić brakujące składniki", "Tak, ale maksymalnie 2 brakujące składniki"] as const;

export const answersSchema = z.object({
  meal: z.enum(MEALS),
  time: z.enum(TIMES),
  servings: z.number().int().min(1).max(12),
  craving: z.enum(CRAVINGS),
  shopping: z.enum(SHOPPING),
});
export type RecipeAnswers = z.infer<typeof answersSchema>;
export const defaultAnswers: RecipeAnswers = { meal: "Bez znaczenia", time: "Do 30 minut", servings: 2, craving: "Zaskocz mnie", shopping: SHOPPING[2] };

export const inventoryItemSchema = z.object({
  id: z.string().max(80),
  name: z.string().max(120),
  quantity: z.number().nullable(),
  unit: z.string().max(20),
  category: z.string().max(60),
  storageLocation: z.string().max(30),
  estimatedUseBy: z.string().max(20).nullable(),
  freshnessConfidence: z.string().max(10),
});
export type InventoryItem = z.infer<typeof inventoryItemSchema>;
export const generateInputSchema = z.object({ answers: answersSchema, inventory: z.array(inventoryItemSchema).max(300) });

const qty = z.number().nullable();
export const availableIngredientSchema = z.object({ name: z.string(), productId: z.string(), quantity: qty, unit: z.string() });
export const missingIngredientSchema = z.object({ name: z.string(), quantity: qty, unit: z.string() });
export const proposalSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  prepMinutes: z.number(),
  cookMinutes: z.number(),
  difficulty: z.enum(["łatwy", "średni", "trudny"]),
  servings: z.number(),
  availableIngredients: z.array(availableIngredientSchema),
  missingIngredients: z.array(missingIngredientSchema),
  reason: z.string(),
  usesSoonExpiring: z.boolean(),
  timeException: z.string().nullable(),
});
export type RecipeProposal = z.infer<typeof proposalSchema>;
export const proposalsSchema = z.object({ proposals: z.array(proposalSchema), limitation: z.string().nullable() });

export const fullRecipeSchema = z.object({
  steps: z.array(z.string()).min(1),
  tips: z.array(z.string()),
  inventoryUsage: z.array(z.object({ productId: z.string(), amount: qty, unit: z.string() })),
});
export type FullRecipe = RecipeProposal & z.infer<typeof fullRecipeSchema>;

export const expandInputSchema = z.object({ answers: answersSchema, inventory: z.array(inventoryItemSchema).max(300), proposal: proposalSchema });

export function timeLimit(time: RecipeAnswers["time"]) {
  return time === "Do 15 minut" ? 15 : time === "Do 30 minut" ? 30 : time === "Do 60 minut" ? 60 : Infinity;
}
export function missingLimit(shopping: RecipeAnswers["shopping"]) {
  return shopping === SHOPPING[0] ? 0 : shopping === SHOPPING[2] ? 2 : Infinity;
}
const norm = (s: string) => s.toLocaleLowerCase("pl-PL").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l").replace(/[^a-z0-9 ]/g, "").trim();
export const sameName = (a: string, b: string) => norm(a) === norm(b);

/** Returns a list of problems; empty means the proposals are valid. */
export function validateProposals(proposals: RecipeProposal[], answers: RecipeAnswers, inventory: InventoryItem[]): string[] {
  const errors: string[] = [];
  if (proposals.length !== 3) errors.push(`Oczekiwano dokładnie 3 propozycji, otrzymano ${proposals.length}.`);
  const ids = new Set(inventory.map((i) => i.id));
  const limit = missingLimit(answers.shopping);
  const maxTime = timeLimit(answers.time);
  proposals.forEach((p, i) => {
    const label = `Propozycja ${i + 1} (${p.title})`;
    p.availableIngredients.forEach((a) => { if (!ids.has(a.productId)) errors.push(`${label}: składnik „${a.name}” nie istnieje w zapasach.`); });
    if (p.missingIngredients.length > limit) errors.push(`${label}: za dużo brakujących składników (${p.missingIngredients.length}, limit ${limit}).`);
    if (p.availableIngredients.length === 0) errors.push(`${label}: brak składników z zapasów.`);
    if (p.prepMinutes + p.cookMinutes > maxTime && !p.timeException) errors.push(`${label}: przekracza limit czasu bez wyjaśnienia.`);
  });
  for (let i = 0; i < proposals.length; i++) for (let j = i + 1; j < proposals.length; j++) if (sameName(proposals[i].title, proposals[j].title)) errors.push(`Propozycje ${i + 1} i ${j + 1} mają ten sam tytuł.`);
  return errors;
}

/** Shopping list merge: skip names already on the (not yet bought) list. */
export function mergeShoppingItems<T extends { name: string; done: boolean }>(current: T[], incoming: { name: string }[]) {
  const seen = new Set(current.filter((c) => !c.done).map((c) => norm(c.name)));
  const added: { name: string }[] = [];
  for (const item of incoming) { const k = norm(item.name); if (!seen.has(k)) { seen.add(k); added.push(item); } }
  return { added, skipped: incoming.length - added.length };
}

/** Clamp a deduction to what's available; never negative. */
export function applyDeduction(available: number, amount: number) {
  const left = Math.max(0, Math.round((available - Math.max(0, amount)) * 1000) / 1000);
  return { left, used: available - left, depleted: left === 0 };
}

export const scaleQty = (q: number | null, from: number, to: number) => (q == null ? null : Math.round((q * to / from) * 100) / 100);
