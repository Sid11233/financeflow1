// Owner-only, whole-organization deletion — "delete my account" for a
// firm's owner destroys the organization and everything under it (every
// client, request, document, message, and every other member's own
// access), not just the caller's own membership. Every tenant table
// cascades off organizations.id (see the migrations), so deleting that one
// row is what actually wipes the database; the only things a DB cascade
// can't reach are the uploaded files themselves in Storage, which this
// cleans up explicitly, and the caller's own auth.users row, which has to
// be the very last step (see the comment above deleteUser below for why).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, jsonError, jsonResponse } from '../_shared/cors.ts';
import { withObservability } from '../_shared/sentry.ts';

const BUCKET = 'client-documents';

Deno.serve(withObservability('delete-account', async (req, { log, correlationId: requestId }) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonError('Method not allowed.', 405, requestId);

  const authHeader = req.headers.get('Authorization') ?? '';
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError('Authentication required.', 401, requestId);

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) return jsonError('Could not find your profile.', 404, requestId);
  if (profile.role !== 'owner') {
    return jsonError('Only the organization owner can delete this account.', 403, requestId);
  }

  const organizationId = profile.organization_id;
  const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // Storage paths must be read before the organization row (and the
  // documents rows that cascade with it) are gone.
  const { data: documents, error: documentsError } = await supabaseAdmin
    .from('documents')
    .select('storage_path')
    .eq('organization_id', organizationId);

  if (documentsError) {
    log.error('documents_lookup_failed', { message: documentsError.message });
    return jsonError('Could not delete your account. Please try again.', 500, requestId);
  }

  // The DB side is all-or-nothing and reversible-by-abort up to this
  // point — if this fails, nothing has been destroyed yet.
  const { error: orgDeleteError } = await supabaseAdmin.from('organizations').delete().eq('id', organizationId);

  if (orgDeleteError) {
    log.error('organization_delete_failed', { message: orgDeleteError.message });
    return jsonError('Could not delete your account. Please try again.', 500, requestId);
  }

  // Best-effort from here — the org and every DB row under it are already
  // gone, so a failure below is a cleanup gap, not something to roll back.
  let storageRemovedCount = 0;
  let storageFailedCount = 0;
  for (const doc of documents ?? []) {
    const { error: removeError } = await supabaseAdmin.storage.from(BUCKET).remove([doc.storage_path]);
    if (removeError) {
      storageFailedCount += 1;
      log.error('storage_remove_failed', { message: removeError.message });
      continue;
    }
    storageRemovedCount += 1;
  }
  log.info('storage_cleanup_complete', { storageRemovedCount, storageFailedCount });

  // Last step, deliberately: the organizations row (and therefore its
  // owner_id -> auth.users "on delete restrict" reference) is already gone,
  // so this can no longer be blocked by that constraint regardless of
  // whether this caller was ever that row's historical owner_id.
  const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (deleteUserError) {
    log.error('delete_user_failed', { message: deleteUserError.message });
    return jsonError(
      'Your data was deleted, but we could not remove your login. Contact support.',
      500,
      requestId,
    );
  }

  log.info('account_deleted', { organizationId });
  return jsonResponse({ deleted: true }, 200, { 'X-Request-Id': requestId });
}));
