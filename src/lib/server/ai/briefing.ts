import OpenAI from 'openai';
import { env } from '$env/dynamic/private';
import { getRollupsForDate, saveAISummary } from '../db/summaries';
import type { CompanyRollup } from '../db/summaries';

export type GeneratedBriefing = {
  greeting: string;
  headline: string;
  summary: string;
  overallStatus: string;
  notableChanges: string[];
  productHighlights: string[];
  risks: string[];
  suggestedAction: string;
  generatedAt: string;
};

const SYSTEM_PROMPT = `You are the analyst behind Pulse, an executive command-centre for a founder.
Write a calm, concise, founder-friendly daily briefing. Rules:
- Summarize ONLY the metrics provided in the user message. Never invent numbers, products, or trends.
- If data is missing or zero, say so plainly rather than guessing.
- Lead with what matters, then what to watch. Keep the tone steady and confident.
- Respond as a single JSON object with exactly these keys:
  "greeting" (string), "headline" (string, one line), "summary" (string, 2-4 sentences),
  "overallStatus" (string), "notableChanges" (string[]), "productHighlights" (string[]),
  "risks" (string[]), "suggestedAction" (string, one concrete next step).`;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildPayload(rollups: CompanyRollup[], date: string): string {
  if (!rollups.length) {
    return `Date: ${date}\nNo analytics snapshots are available for today yet.`;
  }
  const products = rollups.map((r) => ({
    product: r.productName,
    status: r.productStatus,
    ...r.metrics
  }));
  return `Date: ${date}\nProduct metrics snapshot (the ONLY data you may reference):\n${JSON.stringify(products, null, 2)}`;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => String(v)) : [];
}

function normalize(raw: Record<string, unknown>): GeneratedBriefing {
  const str = (key: string, fallback = '') =>
    typeof raw[key] === 'string' ? (raw[key] as string) : fallback;
  return {
    greeting: str('greeting', 'Good morning.'),
    headline: str('headline', 'Daily briefing'),
    summary: str('summary'),
    overallStatus: str('overallStatus'),
    notableChanges: asStringArray(raw.notableChanges),
    productHighlights: asStringArray(raw.productHighlights),
    risks: asStringArray(raw.risks),
    suggestedAction: str('suggestedAction'),
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generate the company daily briefing from stored rollups and persist it.
 * Returns null when there are no snapshots yet (nothing to summarize),
 * so callers can surface an empty state without spending an AI call.
 */
export async function generateDailyBriefing(
  date = todayIso()
): Promise<GeneratedBriefing | null> {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const rollups = await getRollupsForDate(date);
  if (!rollups.length) {
    return null;
  }

  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const model = env.AI_MODEL || 'gpt-4o-mini';

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildPayload(rollups, date) }
    ]
  });

  const content = completion.choices[0]?.message?.content ?? '{}';
  const briefing = normalize(JSON.parse(content) as Record<string, unknown>);

  await saveAISummary({
    productId: null,
    scope: 'company',
    summaryDate: date,
    greeting: briefing.greeting,
    headline: briefing.headline,
    summary: briefing.summary,
    meta: {
      overallStatus: briefing.overallStatus,
      notableChanges: briefing.notableChanges,
      productHighlights: briefing.productHighlights,
      risks: briefing.risks,
      suggestedAction: briefing.suggestedAction,
      model,
      productsConsidered: rollups.length
    }
  });

  return briefing;
}
