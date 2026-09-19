-- classify-document switched providers from Anthropic to the Gemini API
-- (see supabase/functions/_shared/classifier.ts). No organization has ever
-- had a classification_settings row (nothing inserts one — every org
-- currently falls through to classify-document's own DEFAULT_SETTINGS
-- fallback), so this column default was never actually reached; fixing it
-- anyway so a future settings row — inserted by hand or by a settings UI
-- that doesn't exist yet — doesn't silently default to a model name the
-- app can no longer call.
alter table public.classification_settings
  alter column model_name set default 'gemini-flash-latest';

update public.classification_settings
  set model_name = 'gemini-flash-latest'
  where model_name = 'claude-sonnet-4-6';
