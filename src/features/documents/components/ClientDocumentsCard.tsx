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

const CONFIDENCE_BADGE_VARIANT = { High: 'success', Medium: 'warning', Low: 'danger' } as const;
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 20; // ~1 minute — long enough for the near-instant trigger path, short enough not to poll forever if a job dead-letters.

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

  const classifiableIds = (documentsQuery.data ?? [])
    .filter((doc) => !doc.ai_classification && !processingIds.has(doc.id))
    .map((doc) => doc.id);

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
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Request</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Classification</TableHead>
              <TableHead>&nbsp;</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentsQuery.isPending ? (
              Array.from({ length: 3 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: 5 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : documentsQuery.data?.length ? (
              documentsQuery.data.map((doc) => {
                const isProcessing = processingIds.has(doc.id);
                const confidenceLabel = getConfidenceLabel(doc.ai_confidence);

                return (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.original_filename}</TableCell>
                    <TableCell>{doc.period_label ?? '—'}</TableCell>
                    <TableCell>{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {doc.ai_classification ? (
                        <div className="flex items-center gap-2">
                          <span>{doc.ai_classification.document_type_label}</span>
                          {confidenceLabel && (
                            <Badge variant={CONFIDENCE_BADGE_VARIANT[confidenceLabel]}>
                              {confidenceLabel} confidence
                            </Badge>
                          )}
                        </div>
                      ) : isProcessing ? (
                        <Badge variant="accent">Processing…</Badge>
                      ) : (
                        <Badge variant="neutral">Not classified</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!doc.ai_classification && !isProcessing && (
                        <Button variant="ghost" size="sm" onClick={() => handleClassify(doc.id)}>
                          Classify
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-neutral-400">
                  No documents yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
