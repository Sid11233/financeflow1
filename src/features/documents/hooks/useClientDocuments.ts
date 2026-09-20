import { useQuery } from '@tanstack/react-query';
import { listClientDocuments } from '../api/documentsApi';

// refetchInterval is set by the caller (ClientDocumentsCard) while any
// document has a classification in flight — this hook itself stays a
// plain query, not a polling one, so it behaves normally everywhere else
// a component might use it.
export function useClientDocuments(clientId: string | undefined, refetchInterval?: number | false) {
  return useQuery({
    queryKey: ['client-documents', clientId],
    queryFn: () => listClientDocuments(clientId!),
    enabled: Boolean(clientId),
    refetchInterval,
  });
}
