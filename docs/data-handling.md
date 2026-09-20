# Data handling

This document explains, in plain language, what FinanceFlow stores, where
it lives, how long it's kept, who can see it, and how to get it deleted.
It's written to be handed to an accounting firm evaluating FinanceFlow as
a vendor, or to answer a client's question about where their documents go.

## What's stored

**About the firm and its team:** firm name, team members' names, email
addresses, and role (owner/member).

**About each client:** name, contact email, phone number, and any notes
the firm adds. FinanceFlow never asks a client to create an account or a
password — a client reaches their upload page through a private link, not
a login.

**Requests and documents:** the checklist of what's been asked for, the
deadline, and every file the client uploads — both the file itself and
metadata about it (original filename, file type, size, upload time, and
the AI's classification of what kind of document it is). If a firm or
client removes a file, the file's *content* is permanently deleted after
90 days (see Retention below); the fact that a file was uploaded and later
removed is kept indefinitely as a lightweight record, the same way a paper
filing system would keep a note that something was pulled from a folder.

**Activity history:** a log of who did what and when — a request created,
a document uploaded, a reminder sent — used to answer "what happened to
this request" without digging through email. This is intentionally
append-only; nothing in the product edits or deletes it.

**Email history:** which template was sent, to whom, when, and whether it
was delivered, bounced, or marked as spam — not a copy of the email's
rendered content, which isn't stored once sent.

**What's deliberately *not* stored:** FinanceFlow never asks for or stores
a client's payment details, tax ID, or bank account numbers as structured
data — if a client uploads a bank statement, its *content* is only ever
what the classification step reads to identify *what kind* of document it
is (see the OpenRouter section below), not extracted and stored as
structured financial data anywhere.

## Where it's stored

Everything — the database and every uploaded file — lives in one Supabase
project per environment (see `docs/deployment.md`), hosted on AWS
infrastructure in the region that project was created in. This
deployment's production project is in **eu-west-1 (Ireland)**; a firm
with specific data-residency requirements (e.g. needing data to stay in
a particular country) should confirm this against their own account's
actual project region before relying on it, since a new deployment can be
provisioned in a different AWS region — the app's behavior doesn't depend
on which one.

The frontend application itself (the code your browser runs) is served by
Vercel's global CDN — Vercel serves static application code and does not
process or store client data; the browser talks directly to Supabase for
everything data-related.

## Retention

| Data | Retention |
|---|---|
| Active client documents (file content) | Kept as long as the request exists — there's no automatic expiry, since a firm typically needs these for its own record-keeping long after the request is "done" |
| A removed document's file content | Permanently deleted 90 days after removal (automated nightly job) |
| A removed document's metadata (filename, upload date) | Kept indefinitely as an audit trail — the row, not the file |
| Activity log | Kept indefinitely — this is the audit trail of record |
| Email send history | Kept indefinitely today; a firm needing a specific retention policy here should raise it with us, since no automatic expiry exists for this table yet |
| Upload-link tokens | Only the token's hash is ever stored, never the plaintext; unused tokens for a finished request are revoked automatically |
| Rate-limit tracking | Rolling 1-hour window, not tied to any person or account |

A full account deletion (see below) removes everything in the first four
rows immediately rather than waiting out these windows.

## Who can access it

**Within a firm:** every team member sees only their own firm's clients,
requests, and documents — enforced by database-level access rules
(Postgres Row Level Security), not just application logic, so there's no
code path that could accidentally show one firm another firm's data.
Within a firm, any team member can see any client the firm has added;
FinanceFlow doesn't currently support restricting a specific client to a
specific team member.

**A client** can only ever reach their own upload page, via the private
link their accountant sent them — they never see any other client's data,
and they never see the firm's internal activity log or team information.

**FinanceFlow's own operators** (the people running this deployment) can
access data only for support and maintenance — debugging a reported
issue, running a database migration, responding to a deletion request.
This is not routine or automatic; see `SECURITY.md` for the operational
controls around it (least-privilege service credentials, no code path
that queries across every tenant at once).

**Nobody else.** FinanceFlow doesn't sell, rent, or otherwise share client
data, and doesn't use it for advertising.

## Encryption

- **In transit:** every connection — browser to app, app to database, app
  to Storage, app to OpenRouter/Resend — is TLS-encrypted. There is no
  unencrypted path anywhere in the system.
- **At rest:** the database and Storage (where uploaded files live) are
  both encrypted at rest using Supabase's underlying AES-256 disk
  encryption.

## Deletion on request

A client or a firm can ask for their data to be deleted by contacting the
firm (for a client's own data) or FinanceFlow support directly (for a
firm's full account). Once confirmed, we permanently delete:

- The client's (or firm's) documents, both file content and metadata
- Their requests, checklists, and activity history
- Their contact information

within **30 days** of a confirmed request. Some residual data may persist
briefly in encrypted backups until those backups themselves age out (see
`docs/deployment.md`'s backup retention) — those aren't separately
queryable or restorable in isolation, so this doesn't create a second
place the data is actually *reachable* after deletion, just a bound on
when the last encrypted copy is physically overwritten.

We may retain the minimum necessary to comply with a legal obligation
(e.g. an active dispute) even after a deletion request — if that applies,
we'll say so specifically rather than silently keeping data back.

## Subprocessors

A subprocessor is a third party that handles data on FinanceFlow's behalf
as part of running the product. There are four:

| Subprocessor | What it does | What it sees |
|---|---|---|
| **Supabase** | Database, file storage, authentication, and the serverless functions that run the app's backend logic | Everything — it's the platform FinanceFlow is built on |
| **OpenRouter (free-tier models)** | Classifies each uploaded document (what type of document it is) by routing the request to whichever underlying AI provider is serving the configured model | The content of each uploaded document, sent solely to produce a classification. **This currently runs on a free-tier model (`classification_settings.model_name`, e.g. `nex-agi/nex-n2.5-pro:free`), not a paid plan** — OpenRouter aggregates many different underlying providers for its free models (at the time of writing, seen routing to Google AI Studio, Nvidia, and other third parties depending on availability), each with its own data-usage policy, and OpenRouter's own docs are explicit that some may train on submitted content unless the account is configured to restrict routing to non-training providers (a setting FinanceFlow's OpenRouter account does not currently have enabled). This is a materially weaker and less predictable guarantee than a paid API plan's terms or a Business Associate/Data Processing Agreement. A firm with clients whose documents shouldn't be used this way should ask FinanceFlow to enable OpenRouter's data-policy restriction setting or move classification to a paid, single-provider plan before relying on this feature for real client data |
| **Resend** | Sends every email the app sends — client-facing requests and reminders, and the firm's own account emails (password reset, invites) | Recipient email addresses and the content of emails sent to them |
| **Vercel** | Hosts and serves the frontend application's static code via CDN | Does not process client data — sees only ordinary web traffic metadata (IP addresses, requested paths) as any CDN would |

We'll update this table and notify firms in advance if a subprocessor is
added, removed, or changed in a way that affects what it can see.
