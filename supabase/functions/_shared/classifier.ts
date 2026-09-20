import { z } from 'npm:zod@3.23.8';
import { Buffer } from 'node:buffer';

export const AI_DOCUMENT_TYPES = [
  'bank_statement',
  'sales_invoice',
  'purchase_invoice',
  'payroll_report',
  'expense_receipt',
  'credit_card_statement',
  'tax_return',
  'other',
  'unreadable',
] as const;

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable();

export const classificationSchema = z.object({
  document_type: z.enum(AI_DOCUMENT_TYPES),
  document_type_label: z.string(),
  period: z.object({
    start: isoDate,
    end: isoDate,
    label: z.string().nullable(),
  }),
  company_name: z.string().nullable(),
  counterparty_name: z.string().nullable(),
  currency: z.string().nullable(),
  total_amount: z.number().nullable(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

export type Classification = z.infer<typeof classificationSchema>;

export const CLASSIFICATION_SYSTEM_PROMPT = `You are a document classifier for an accounting firm. You will be shown a
financial document. Identify what it is. Respond with JSON only, no prose,
no markdown fences.

Schema:
{
  "document_type": one of ["bank_statement","sales_invoice","purchase_invoice",
    "payroll_report","expense_receipt","credit_card_statement","tax_return",
    "other","unreadable"],
  "document_type_label": short human label,
  "period": { "start": "YYYY-MM-DD" or null, "end": "YYYY-MM-DD" or null,
              "label": e.g. "September 2026" or null },
  "company_name": string or null,
  "counterparty_name": string or null,
  "currency": ISO code or null,
  "total_amount": number or null,
  "confidence": 0.0 to 1.0,
  "reasoning": one short sentence
}

Rules: if the document covers a date range, report that range, not the issue
date. If you cannot read it, return "unreadable" with confidence 0. Never
guess a period you cannot see evidence for; use null. Do not invent a company
name.`;

const STRICT_REMINDER =
  '\n\nIMPORTANT: Your previous response could not be parsed as valid JSON matching the schema. Respond with ONLY the raw JSON object — no prose, no markdown code fences, nothing before or after it.';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_OUTPUT_TOKENS = 1024;

export interface ClassificationSource {
  pdfBytes?: Uint8Array;
  images?: { bytes: Uint8Array; mimeType: string }[];
}

export interface ClassificationCallResult {
  classification: Classification | null;
  rawResponseText: string;
  parseFailed: boolean;
}

export async function classifyDocument(
  apiKey: string,
  model: string,
  source: ClassificationSource,
): Promise<ClassificationCallResult> {
  const userContent = buildUserContent(source);

  const firstResponseText = await callOpenRouter(apiKey, model, userContent, CLASSIFICATION_SYSTEM_PROMPT);
  const firstParsed = tryParseClassification(firstResponseText);

  if (firstParsed) {
    return { classification: firstParsed, rawResponseText: firstResponseText, parseFailed: false };
  }

  // One retry, same content, a stricter system-prompt reminder — a fresh
  // single-turn call rather than a multi-turn "that wasn't right, retry"
  // conversation, since the goal is just a better-formatted answer, not a
  // discussion.
  const secondResponseText = await callOpenRouter(
    apiKey,
    model,
    userContent,
    `${CLASSIFICATION_SYSTEM_PROMPT}${STRICT_REMINDER}`,
  );
  const secondParsed = tryParseClassification(secondResponseText);

  return {
    classification: secondParsed,
    rawResponseText: secondParsed ? secondResponseText : `${firstResponseText}\n---RETRY---\n${secondResponseText}`,
    parseFailed: !secondParsed,
  };
}

// PDFs always arrive here as rasterized images, never as pdfBytes — see
// classify-document's MAX_PDF_BYTES_BEFORE_RASTERIZE=0 — since OpenRouter's
// free-tier vision models are a heterogeneous pool of many different
// providers, and native PDF handling (a "file" content block) is far less
// consistently supported across them than plain images are. The pdfBytes
// branch below is a defensive fallback, not a path this app's own callers
// currently exercise.
function buildUserContent(source: ClassificationSource): unknown[] {
  const content: unknown[] = [];

  if (source.pdfBytes) {
    content.push({
      type: 'file',
      file: {
        filename: 'document.pdf',
        file_data: `data:application/pdf;base64,${encodeBase64(source.pdfBytes)}`,
      },
    });
  }

  for (const image of source.images ?? []) {
    content.push({
      type: 'image_url',
      image_url: { url: `data:${image.mimeType};base64,${encodeBase64(image.bytes)}` },
    });
  }

  content.push({ type: 'text', text: 'Classify this document.' });
  return content;
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  userContent: unknown[],
  systemPrompt: string,
): Promise<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
      max_tokens: MAX_OUTPUT_TOKENS,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  // Missing on a refused/empty completion — falls through to
  // tryParseClassification failing on '', which the caller already treats
  // as a normal retry-then-unparseable case, same as a response with no
  // usable text ever did.
  return data.choices?.[0]?.message?.content ?? '';
}

function tryParseClassification(rawText: string): Classification | null {
  // Defensive only — the prompt explicitly forbids markdown fences, but
  // stripping them if present costs nothing and saves a retry round trip
  // for an otherwise-good response.
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\n?/, '')
    .replace(/\n?```$/, '');

  let json: unknown;
  try {
    json = JSON.parse(cleaned);
  } catch {
    return null;
  }

  const result = classificationSchema.safeParse(json);
  return result.success ? result.data : null;
}

function encodeBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}
