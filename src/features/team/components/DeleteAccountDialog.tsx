import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button, Dialog, DialogFooter, DialogHeader, DialogTitle, Field, Input } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDeleteAccount } from '@/features/auth/hooks/useDeleteAccount';

export function DeleteAccountDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, signOut } = useAuth();
  const deleteAccountMutation = useDeleteAccount();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const isBusy = isVerifying || deleteAccountMutation.isPending;

  function handleClose() {
    setPassword('');
    setError(null);
    onClose();
  }

  async function handleConfirm() {
    if (!user?.email) return;
    setError(null);
    setIsVerifying(true);

    // Re-verifies the password through Supabase Auth itself — this app's
    // own backend never sees the plaintext password.
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password });
    setIsVerifying(false);
    if (signInError) {
      setError('Incorrect password.');
      return;
    }

    try {
      await deleteAccountMutation.mutateAsync();
      // The profile row is already gone server-side — AuthGuard has no
      // path back from that except its 10s "contact support" timeout, so
      // the session has to be torn down immediately rather than waiting
      // for that to kick in on its own.
      await signOut();
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Could not delete your account.');
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Delete your account</DialogTitle>
      </DialogHeader>

      <p className="text-sm text-neutral-600">
        This permanently deletes your organization — every client, request, and uploaded document — and removes
        access for every team member. This cannot be undone.
      </p>

      <div className="mt-4">
        <Field label="Enter your password to confirm" htmlFor="delete-account-password">
          <Input
            id="delete-account-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isBusy}
          />
        </Field>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={handleClose} disabled={isBusy}>
          Cancel
        </Button>
        <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isBusy || !password}>
          {isBusy ? 'Deleting…' : 'Delete my account and all data'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
