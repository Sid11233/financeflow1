import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { ClientDocument } from '../types';

async function toDocumentError(error: unknown): Promise<Error> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      if (typeof body?.error === 'string') return new Error(body.error);
    } catch {
      // fall through to the generic message below
    }
  }
  return new Error('Something went wrong. Please try again.');
}

export interface DocumentUrlResult {
  url: string;
  expiresInSeconds: number;
}

export async function getDocumentUrl(documentId: string): Promise<DocumentUrlResult> {
  const { data, error } = await supabase.functions.invoke<DocumentUrlResult>('get-document-url', {
    body: { documentId },
  });
  if (error) throw await toDocumentError(error);
  return data!;
}

export async function listClientDocuments(clientId: string): Promise<ClientDocument[]> {
  const { data, error } = await supabase
    .from('document_overview')
    .select('*')
    .eq('client_id', clientId)
    .order('uploaded_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ClientDocument[];
}

// Inserting directly into classification_jobs — permitted by that table's
// own "org isolation" RLS policy (for all to authenticated) — is enough on
// its own: classification_jobs_after_insert (0025_classification_pipeline.sql)
// fires classify-document automatically, the same pipeline every upload
// already goes through. No dedicated Edge Function needed for this.
export async function triggerClassification(
  jobs: { organizationId: string; documentId: string }[],
): Promise<void> {
  if (jobs.length === 0) return;
  const { error } = await supabase.from('classification_jobs').insert(
    jobs.map((job) => ({ organization_id: job.organizationId, document_id: job.documentId })),
  );
  if (error) throw error;
}
