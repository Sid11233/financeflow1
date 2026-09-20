import { useEffect, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { getConfidenceLabel } from '@/features/requests/lib/reviewFormatting';
import { useClientDocuments } from '../hooks/useClientDocuments';
import { useTriggerClassification } from '../hooks/useTriggerClassification';
import type { ClientDocument } from '../types';

const CONFIDENCE_BADGE_VARIANT = { High: 'success', Medium: 'warning', Low: 'danger' } as const;
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 20; // ~1 minute — long enough for the near-instant trigger path, short enough not to poll forever if a job dead-letters.

// Fixed categories, matching AI_DOCUMENT_TYPES in
// supabase/functions/_shared/classifier.ts — grouping by this rather than
// by ai_classification.document_type_label, since that label is free text
// the model writes per document ("short human label" in the system
// prompt), not a canonical value; grouping by it would split what should
// be one "Bank Statements" section into several near-duplicate ones over
// slightly different wording.
const TYPE_LABELS: Record<string, string> = {
  bank_statement: 'Bank Statements',
  sales_invoice: 'Sales Invoices',
  purchase_invoice: 'Purchase Invoices',
  payroll_report: 'Payroll Reports',
  expense_receipt: 'Expense Receipts',
  credit_card_statement: 'Credit Card Statements',
  tax_return: 'Tax Returns',
  other: 'Other',
  unreadable: 'Unreadable',
};
const TYPE_ORDER = Object.keys(TYPE_LABELS);

interface DocumentGroup {
  key: string;
  label: string;
  documents: ClientDocument[];
}

function groupByType(documents: ClientDocument[]): { unclassified: ClientDocument[]; groups: DocumentGroup[] } {
  const unclassified: ClientDocument[] = [];
  const byType = new Map<string, ClientDocument[]>();

  for (const doc of documents) {
    if (!doc.ai_classification) {
      unclassified.push(doc);
      continue;
    }
    const key = doc.ai_classification.document_type;
    if (!byType.has(key)) byType.set(key, []);
    byType.get(key)!.push(doc);
  }

  const orderedKeys = [
    ...TYPE_ORDER.filter((key) => byType.has(key)),
    ...[...byType.keys()].filter((key) => !TYPE_ORDER.includes(key)),
  ];

  return {
    unclassified,
    groups: orderedKeys.map((key) => ({ key, label: TYPE_LABELS[key] ?? key, documents: byType.get(key)! })),
  };
}

export function ClientDocumentsCard({
  clientId,
  organizationId,
}: {
  clientId: string;
  organizationId: string;
}) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const pollAttemptsRef = useRef(0);

  const documentsQuery = useClientDocuments(clientId, processingIds.size > 0 ? POLL_INTERVAL_MS : false);
  const triggerMutation = useTriggerClassification(clientId);

  // Drops a document from processingIds once it shows a real classification
  // (the polled query is the source of truth here, not the mutation's own
  // response — classification happens asynchronously after the insert).
  // Also bails out after MAX_POLL_ATTEMPTS so a dead-lettered job doesn't
  // poll forever; the row just falls back to its normal "Not classified"
  // state, and the Classify button becomes available again.
  useEffect(() => {
    if (processingIds.size === 0 || !documentsQuery.data) return;

    const stillMissing = new Set(processingIds);
    for (const doc of documentsQuery.data) {
      if (stillMissing.has(doc.id) && doc.ai_classification) {
        stillMissing.delete(doc.id);
      }
    }

    pollAttemptsRef.current += 1;
    const timedOut = pollAttemptsRef.current >= MAX_POLL_ATTEMPTS;
    if (stillMissing.size !== processingIds.size || timedOut) {
      pollAttemptsRef.current = 0;
      setProcessingIds(timedOut ? new Set() : stillMissing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentsQuery.data]);

  const documents = documentsQuery.data ?? [];
  const classifiableIds = documents.filter((doc) => !doc.ai_classification && !processingIds.has(doc.id)).map((doc) => doc.id);
  const { unclassified, groups } = groupByType(documents);

  function handleClassify(documentId: string) {
    setProcessingIds((prev) => new Set(prev).add(documentId));
    triggerMutation.mutate([{ organizationId, documentId }]);
  }

  function handleClassifyAll() {
    if (classifiableIds.length === 0) return;
    setProcessingIds((prev) => {
      const next = new Set(prev);
      classifiableIds.forEach((id) => next.add(id));
      return next;
    });
    triggerMutation.mutate(classifiableIds.map((documentId) => ({ organizationId, documentId })));
  }

  function renderRow(doc: ClientDocument, showAction: boolean) {
    const isProcessing = processingIds.has(doc.id);
    const confidenceLabel = getConfidenceLabel(doc.ai_confidence);

    return (
      <TableRow key={doc.id}>
        <TableCell>{doc.original_filename}</TableCell>
        <TableCell>{doc.period_label ?? '—'}</TableCell>
        <TableCell>{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
        <TableCell>
          {doc.ai_classification && confidenceLabel ? (
            <Badge variant={CONFIDENCE_BADGE_VARIANT[confidenceLabel]}>{confidenceLabel} confidence</Badge>
          ) : isProcessing ? (
            <Badge variant="accent">Processing…</Badge>
          ) : (
            <Badge variant="neutral">Not classified</Badge>
          )}
        </TableCell>
        {showAction && (
          <TableCell>
            {!doc.ai_classification && !isProcessing && (
              <Button variant="ghost" size="sm" onClick={() => handleClassify(doc.id)}>
                Classify
              </Button>
            )}
          </TableCell>
        )}
      </TableRow>
    );
  }

  function renderGroupTable(rows: ClientDocument[], showAction: boolean) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Filename</TableHead>
            <TableHead>Request</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Confidence</TableHead>
            {showAction && <TableHead>&nbsp;</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>{rows.map((doc) => renderRow(doc, showAction))}</TableBody>
      </Table>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Documents</CardTitle>
        <Button
          variant="outline"
          size="sm"
          disabled={classifiableIds.length === 0 || triggerMutation.isPending}
          onClick={handleClassifyAll}
        >
          Classify all
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {documentsQuery.isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, rowIndex) => (
              <Skeleton key={rowIndex} className="h-8 w-full" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-400">No documents yet.</p>
        ) : (
          <>
            {unclassified.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Unclassified ({unclassified.length})
                </h4>
                {renderGroupTable(unclassified, true)}
              </div>
            )}
            {groups.map((group) => (
              <div key={group.key}>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {group.label} ({group.documents.length})
                </h4>
                {renderGroupTable(group.documents, false)}
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
