-- classify-document switched providers again, from the Gemini API (0043)
-- to OpenRouter's free-tier model pool — Gemini generation access was
-- denied at the Google Cloud project level ("Your project has been denied
-- access"), confirmed by directly testing a real generateContent call, not
-- just the account/key. As with 0043, no organization has ever had a
-- classification_settings row (nothing inserts one — every org currently
-- falls through to classify-document's own DEFAULT_SETTINGS fallback), so
-- this column default was never actually reached; fixing it anyway so a
-- future settings row doesn't silently default to a model name the app
-- can no longer call.
alter table public.classification_settings
  alter column model_name set default 'nex-agi/nex-n2.5-pro:free';

update public.classification_settings
  set model_name = 'nex-agi/nex-n2.5-pro:free'
  where model_name = 'gemini-flash-latest';
