-- Per-client documents read model, same idiom as request_overview
-- (0019_request_overview_view.sql) and client_overview: documents has no
-- direct client_id (it's reached via requests), so the client documents
-- table needs this join done once here rather than as a one-off
-- nested-embed query from the frontend.
--
-- security_invoker = true is load-bearing, not stylistic — see the
-- extended comment on request_overview for why: without it, this view
-- would run with the migration role's privileges and bypass the
-- documents/requests "org isolation" RLS policies entirely.
create or replace view public.document_overview
with (security_invoker = true)
as
select
  d.id,
  d.organization_id,
  d.request_id,
  r.client_id,
  r.period_label,
  d.required_document_id,
  d.original_filename,
  d.mime_type,
  d.size_bytes,
  d.uploaded_at,
  d.ai_classification,
  d.ai_confidence,
  d.review_status,
  d.review_reason
from public.documents d
join public.requests r on r.id = d.request_id
where d.deleted_at is null;

revoke all on public.document_overview from anon;
grant select on public.document_overview to authenticated;

comment on view public.document_overview is
  'Per-client documents read model: adds client_id/period_label (documents has no direct client_id, only via requests). security_invoker = true — see the comment above request_overview''s definition for why that is not optional.';
