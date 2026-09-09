import { useMutation } from '@tanstack/react-query';
import { deleteAccount } from '../api/authApi';

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => deleteAccount(),
  });
}
