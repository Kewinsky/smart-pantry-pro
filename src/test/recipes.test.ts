import { describe, expect, it } from "vitest";
import { applyDeduction, defaultAnswers, mergeShoppingItems, SHOPPING, validateProposals, type InventoryItem, type RecipeProposal } from "@/lib/recipes/schema";

const inv: InventoryItem[] = [{ id: "p1", name: "Mleko", quantity: 1, unit: "l", category: "Nabiał", storageLocation: "Lodówka", estimatedUseBy: null, freshnessConfidence: "high" }];
const mk = (title: string, o: Partial<RecipeProposal> = {}): RecipeProposal => ({ id: title, title, description: "", prepMinutes: 5, cookMinutes: 5, difficulty: "łatwy", servings: 2, availableIngredients: [{ name: "Mleko", productId: "p1", quantity: 0.2, unit: "l" }], missingIngredients: [], reason: "", usesSoonExpiring: false, timeException: null, ...o });
const three = [mk("A"), mk("B"), mk("C")];

describe("recipe proposal validation", () => {
  it("accepts exactly three distinct valid proposals", () => expect(validateProposals(three, defaultAnswers, inv)).toEqual([]));
  it("rejects anything other than three proposals", () => expect(validateProposals(three.slice(0, 2), defaultAnswers, inv).length).toBeGreaterThan(0));
  it("rejects invented inventory items", () => expect(validateProposals([mk("A", { availableIngredients: [{ name: "Ser", productId: "x", quantity: 1, unit: "g" }] }), mk("B"), mk("C")], defaultAnswers, inv).length).toBe(1));
  it("rejects missing ingredients in home-only mode", () => expect(validateProposals([mk("A", { missingIngredients: [{ name: "Sól", quantity: null, unit: "" }] }), mk("B"), mk("C")], { ...defaultAnswers, shopping: SHOPPING[0] }, inv).length).toBe(1));
  it("rejects more than 2 missing ingredients when limited", () => { const m = [1, 2, 3].map((i) => ({ name: `x${i}`, quantity: null, unit: "" })); expect(validateProposals([mk("A", { missingIngredients: m }), mk("B"), mk("C")], { ...defaultAnswers, shopping: SHOPPING[2] }, inv).length).toBe(1); });
  it("rejects exceeding the time limit without explanation", () => expect(validateProposals([mk("A", { cookMinutes: 40 }), mk("B"), mk("C")], { ...defaultAnswers, time: "Do 30 minut" }, inv).length).toBe(1));
  it("rejects duplicate titles", () => expect(validateProposals([mk("Owsianka"), mk("owsianka"), mk("C")], defaultAnswers, inv).length).toBe(1));
});

describe("shopping list merge", () => {
  it("skips items already on the open list", () => expect(mergeShoppingItems([{ name: "Cebula", done: false }], [{ name: "cebula" }, { name: "Czosnek" }])).toEqual({ added: [{ name: "Czosnek" }], skipped: 1 }));
});

describe("inventory deduction", () => {
  it("never goes below zero", () => expect(applyDeduction(0.5, 2)).toEqual({ left: 0, used: 0.5, depleted: true }));
  it("subtracts partial amounts", () => expect(applyDeduction(500, 200).left).toBe(300));
});
