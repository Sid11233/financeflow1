-- trigger_classify_document() (0025_classification_pipeline.sql) reads
-- vault.decrypted_secrets to call classify-document via net.http_post.
-- Every insert into classification_jobs before now came from
-- portal-confirm-upload, which runs as service_role — the only role with
-- vault schema access — so this function's default SECURITY INVOKER never
-- mattered in practice. The new client-documents "Classify" action inserts
-- as the caller's own authenticated role instead (permitted by
-- classification_jobs' own "org isolation" RLS policy), and that role has
-- no vault access at all: the trigger fails with "permission denied for
-- schema vault", which rolls back the entire insert, confirmed directly by
-- testing this exact insert as an authenticated user.
--
-- SECURITY DEFINER runs the trigger with its owner's privileges (the
-- migration role, which does have vault access) regardless of who
-- performed the insert — the same reasoning already applied to
-- auth_org_id()/auth_is_owner() elsewhere. Safe here because the function
-- takes no caller-controlled input beyond new.id (already fixed by the
-- row being inserted) and never returns the vault secrets themselves to
-- the caller.
create or replace function public.trigger_classify_document()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
  perform net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
      || '/functions/v1/classify-document',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('jobId', new.id)
  );
  return new;
end;
$$;
