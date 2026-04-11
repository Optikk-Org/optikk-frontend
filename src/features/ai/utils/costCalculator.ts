import { MODEL_PRICING } from "../constants";

/**
 * Estimates the cost of an LLM call based on the model name and token counts.
 * Uses a fuzzy match against the pricing table — tries exact match first,
 * then prefix match (e.g. "gpt-4o-2024-05-13" matches "gpt-4o").
 */
export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = findPricing(model);
  if (!pricing) return 0;
  return (inputTokens / 1000) * pricing.inputPer1K + (outputTokens / 1000) * pricing.outputPer1K;
}

function findPricing(
  model: string
): { inputPer1K: number; outputPer1K: number } | undefined {
  if (!model) return undefined;

  const lower = model.toLowerCase();

  // Exact match.
  if (MODEL_PRICING[lower]) return MODEL_PRICING[lower];

  // Prefix match: "gpt-4o-2024-05-13" → "gpt-4o".
  const keys = Object.keys(MODEL_PRICING).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.startsWith(key)) return MODEL_PRICING[key];
  }

  return undefined;
}

/** Format a cost value as a dollar amount. */
export function formatCost(cost: number): string {
  if (cost === 0) return "$0.00";
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 1) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(2)}`;
}
