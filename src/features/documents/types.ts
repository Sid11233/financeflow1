import type { AiClassification } from '@/features/requests/types';

export interface ClientDocument {
  id: string;
  organization_id: string;
  request_id: string;
  client_id: string;
  period_label: string | null;
  required_document_id: string | null;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  uploaded_at: string;
  ai_classification: AiClassification | null;
  ai_confidence: number | null;
  review_status: 'unreviewed' | 'auto_accepted' | 'confirmed' | 'reassigned' | 'rejected';
  review_reason: string | null;
}
