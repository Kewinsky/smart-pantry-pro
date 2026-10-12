// Server-only AI provider for recipes (Lovable AI Gateway, OpenAI Responses, streamed).
export class RecipeAIError extends Error {
  constructor(public userMessage: string, public status = 500) { super(userMessage); }
}

const MODEL = "openai/gpt-6-astra";

export async function generateJSON(instructions: string, input: string, name: string, schema: Record<string, unknown>): Promise<unknown> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new RecipeAIError("Usługa przepisów nie jest skonfigurowana.");
  let res: Response;
  try {
    res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: MODEL, instructions, input, stream: true, store: false,
        reasoning: { effort: "low", summary: "auto" }, include: ["reasoning.encrypted_content"],
        text: { format: { type: "json_schema", name, schema, strict: true } },
      }),
    });
  } catch { throw new RecipeAIError("Nie udało się połączyć z usługą przepisów. Spróbuj ponownie."); }
  if (!res.ok || !res.body) {
    console.error("Recipe AI error", res.status, await res.text().catch(() => ""));
    if (res.status === 429) throw new RecipeAIError("Zbyt wiele zapytań. Odczekaj chwilę i spróbuj ponownie.", 429);
    if (res.status === 402) throw new RecipeAIError("Wyczerpano limit AI w tym miesiącu. Doładuj środki w ustawieniach obszaru roboczego.", 402);
    if (res.status === 403) throw new RecipeAIError("Dostęp do usługi AI jest zablokowany dla tego projektu.", 403);
    throw new RecipeAIError("Usługa przepisów jest chwilowo niedostępna.", res.status);
  }
  const reader = res.body.getReader(); const dec = new TextDecoder();
  let buf = "", text = "", refused = false;
  for (;;) {
    const { done, value } = await reader.read(); if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n"); buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim(); if (!data || data === "[DONE]") continue;
      try {
        const ev = JSON.parse(data);
        if (ev.type === "response.output_text.delta") text += ev.delta;
        else if (ev.type === "response.refusal.delta") refused = true;
        else if (ev.type === "response.failed" || ev.type === "error") { console.error("Recipe AI stream error", data); throw new RecipeAIError("Generowanie nie powiodło się. Spróbuj ponownie."); }
      } catch (e) { if (e instanceof RecipeAIError) throw e; }
    }
  }
  if (refused) throw new RecipeAIError("Model odmówił wygenerowania przepisu dla tego zapytania.");
  try { return JSON.parse(text); } catch { throw new RecipeAIError("Otrzymano niepoprawną odpowiedź. Spróbuj ponownie."); }
}
