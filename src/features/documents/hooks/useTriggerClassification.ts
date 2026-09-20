import { useMutation, useQueryClient } from '@tanstack/react-query';
import { triggerClassification } from '../api/documentsApi';

export function useTriggerClassification(clientId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobs: { organizationId: string; documentId: string }[]) => triggerClassification(jobs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-documents', clientId] });
    },
  });
}
