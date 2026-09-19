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

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
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
  const parts = buildParts(source);

  const firstResponseText = await callGemini(apiKey, model, parts, CLASSIFICATION_SYSTEM_PROMPT);
  const firstParsed = tryParseClassification(firstResponseText);

  if (firstParsed) {
    return { classification: firstParsed, rawResponseText: firstResponseText, parseFailed: false };
  }

  // One retry, same content, a stricter system-prompt reminder — a fresh
  // single-turn call rather than a multi-turn "that wasn't right, retry"
  // conversation, since the goal is just a better-formatted answer, not a
  // discussion.
  const secondResponseText = await callGemini(
    apiKey,
    model,
    parts,
    `${CLASSIFICATION_SYSTEM_PROMPT}${STRICT_REMINDER}`,
  );
  const secondParsed = tryParseClassification(secondResponseText);

  return {
    classification: secondParsed,
    rawResponseText: secondParsed ? secondResponseText : `${firstResponseText}\n---RETRY---\n${secondResponseText}`,
    parseFailed: !secondParsed,
  };
}

function buildParts(source: ClassificationSource): unknown[] {
  const parts: unknown[] = [];

  if (source.pdfBytes) {
    parts.push({
      inline_data: { mime_type: 'application/pdf', data: encodeBase64(source.pdfBytes) },
    });
  }

  for (const image of source.images ?? []) {
    parts.push({
      inline_data: { mime_type: image.mimeType, data: encodeBase64(image.bytes) },
    });
  }

  parts.push({ text: 'Classify this document.' });
  return parts;
}

async function callGemini(
  apiKey: string,
  model: string,
  parts: unknown[],
  systemPrompt: string,
): Promise<string> {
  const response = await fetch(`${GEMINI_API_BASE}/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'x-goog-api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      systemInstruction: { parts: { text: systemPrompt } },
      generationConfig: {
        temperature: 0,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        response_mime_type: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  // Missing on a safety-filtered or otherwise empty response — falls
  // through to tryParseClassification failing on '', which the caller
  // already treats as a normal retry-then-unparseable case, same as a
  // response with no usable text ever did.
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
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
