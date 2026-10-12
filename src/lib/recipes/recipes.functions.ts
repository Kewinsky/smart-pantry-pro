import { createServerFn } from "@tanstack/react-start";
import { expandInputSchema, fullRecipeSchema, generateInputSchema, missingLimit, proposalsSchema, timeLimit, validateProposals, type FullRecipe, type InventoryItem, type RecipeAnswers, type RecipeProposal } from "./schema";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const n = { type: ["number", "null"] };
const s = { type: "string" };
const obj = (properties: Record<string, unknown>) => ({ type: "object", properties, required: Object.keys(properties), additionalProperties: false });
const proposalJson = obj({
  id: s, title: s, description: s, prepMinutes: { type: "number" }, cookMinutes: { type: "number" },
  difficulty: { type: "string", enum: ["łatwy", "średni", "trudny"] }, servings: { type: "number" },
  availableIngredients: { type: "array", items: obj({ name: s, productId: s, quantity: n, unit: s }) },
  missingIngredients: { type: "array", items: obj({ name: s, quantity: n, unit: s }) },
  reason: s, usesSoonExpiring: { type: "boolean" }, timeException: { type: ["string", "null"] },
});
const proposalsJson = obj({ proposals: { type: "array", items: proposalJson }, limitation: { type: ["string", "null"] } });
const fullJson = obj({ steps: { type: "array", items: s }, tips: { type: "array", items: s }, inventoryUsage: { type: "array", items: obj({ productId: s, amount: n, unit: s }) } });

function inventoryText(inv: InventoryItem[]) {
  return inv.map((i) => `- id=${i.id} | ${i.name} | ilość: ${i.quantity ?? "nieznana"} ${i.unit} | ${i.category} | ${i.storageLocation} | szac. termin: ${i.estimatedUseBy ?? "brak"} (pewność: ${i.freshnessConfidence})`).join("\n");
}

function rules(a: RecipeAnswers) {
  const lim = missingLimit(a.shopping);
  return [
    `Dzisiejsza data: ${new Date().toISOString().slice(0, 10)}. Odpowiadasz po polsku.`,
    "Jesteś asystentem kulinarnym aplikacji Spiżarka. Używasz WYŁĄCZNIE produktów z listy zapasów jako dostępnych składników; każdy dostępny składnik musi mieć productId z listy. Nigdy nie wymyślaj produktów w zapasach.",
    "Nie zakładaj dostępności podstawowych produktów (sól, pieprz, olej itp.), chyba że są na liście — w przeciwnym razie są brakującymi składnikami.",
    lim === 0 ? "Tryb: TYLKO produkty z domu. missingIngredients musi być pustą tablicą. Jeśli nie da się zaproponować sensownych dań, zwróć mniej propozycji i opisz ograniczenie w polu limitation." : lim === 2 ? "Każda propozycja może mieć maksymalnie 2 brakujące składniki, tanie i łatwo dostępne." : "Brakujące składniki są dozwolone, ale preferuj tanie i łatwo dostępne.",
    `Limit czasu: ${a.time}. Jeśli przepis przekracza limit, wpisz wyjaśnienie w timeException, inaczej null.`,
    `Posiłek: ${a.meal}. Ochota: ${a.craving}. Porcje: ${a.servings} — ilości składników przelicz na tę liczbę porcji. Gdy ilość w zapasach jest nieznana, nie podawaj dokładnych ilości dostępnych (użyj null).`,
    "Priorytetyzuj produkty z najbliższym szacowanym terminem, ale traktuj terminy jako przybliżone.",
  ].join("\n");
}

export const generateProposals = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => generateInputSchema.parse(d))
  .handler(async ({ data }): Promise<Result<{ proposals: RecipeProposal[]; limitation: string | null }>> => {
    const { generateJSON, RecipeAIError } = await import("./ai.server");
    const { answers, inventory } = data;
    if (!inventory.length) return { ok: false, error: "Twoje zapasy są puste. Dodaj produkty, aby otrzymać propozycje." };
    const instructions = rules(answers) + "\nZwróć dokładnie 3 wyraźnie różne dania (nie warianty tego samego), np. najlepsze dopasowanie do zapasów, opcja najszybsza i opcja najlepiej oddająca ochotę użytkownika — dostosuj strategię do odpowiedzi. id: p1, p2, p3.";
    let feedback = "";
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        const raw = await generateJSON(instructions, `Zapasy:\n${inventoryText(inventory)}${feedback}`, "recipe_proposals", proposalsJson);
        const parsed = proposalsSchema.safeParse(raw);
        if (!parsed.success) { feedback = "\nPoprzednia odpowiedź miała niepoprawny format."; continue; }
        const { proposals, limitation } = parsed.data;
        if (missingLimit(answers.shopping) === 0 && proposals.length < 3 && limitation) return { ok: false, error: `${limitation} Możesz zezwolić na dokupienie składników w pytaniu 5.` };
        const errors = validateProposals(proposals, answers, inventory);
        if (!errors.length) return { ok: true, data: { proposals: proposals.map((p, i) => ({ ...p, id: `p${i + 1}-${Date.now()}`, servings: answers.servings })), limitation } };
        console.warn("Recipe validation failed", errors);
        feedback = `\nPoprzednia odpowiedź była niepoprawna — popraw: ${errors.join(" ")}`;
      }
      return { ok: false, error: "Nie udało się dobrać 3 przepisów spełniających Twoje warunki. Spróbuj złagodzić ograniczenia (czas lub dokupienie składników)." };
    } catch (e) {
      if (e instanceof RecipeAIError) return { ok: false, error: e.userMessage };
      console.error(e); return { ok: false, error: "Coś poszło nie tak. Spróbuj ponownie." };
    }
  });

export const expandRecipe = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => expandInputSchema.parse(d))
  .handler(async ({ data }): Promise<Result<FullRecipe>> => {
    const { generateJSON, RecipeAIError } = await import("./ai.server");
    const { answers, inventory, proposal } = data;
    const instructions = rules(answers) + `\nRozwiń WYBRANE danie w pełny przepis, zachowując jego tożsamość i składniki (nie zmieniaj dania). Podaj kroki, wskazówki oraz inventoryUsage: dla każdego dostępnego składnika productId i ilość zużycia w JEDNOSTCE produktu z zapasów (amount=null, jeśli nie da się tego wiarygodnie określić). Limit czasu: ${timeLimit(answers.time)} min.`;
    try {
      const raw = await generateJSON(instructions, `Zapasy:\n${inventoryText(inventory)}\n\nWybrane danie:\n${JSON.stringify(proposal)}`, "full_recipe", fullJson);
      const parsed = fullRecipeSchema.safeParse(raw);
      if (!parsed.success) return { ok: false, error: "Otrzymano niekompletny przepis. Spróbuj ponownie." };
      const ids = new Set(proposal.availableIngredients.map((a) => a.productId));
      return { ok: true, data: { ...proposal, ...parsed.data, inventoryUsage: parsed.data.inventoryUsage.filter((u) => ids.has(u.productId)) } };
    } catch (e) {
      if (e instanceof RecipeAIError) return { ok: false, error: e.userMessage };
      console.error(e); return { ok: false, error: "Coś poszło nie tak. Spróbuj ponownie." };
    }
  });
