# LeadClaw retirement evidence baton — 2026-10-08

Status: IN PROGRESS. This is an engineering audit record, not a legal compliance certificate.

## Owner decision
Retire the non-revenue experimental LeadClaw service through controlled shutdown, evidence preservation and proportional data disposal. User recalls having sent marketing emails to businesses, with no recalled complaints or opt-outs. Do not equate recollection with an exhaustive audit.

## Verified containment
- Vercel `leadclaw-uk` paused; production not serving traffic (screenshot and connector live=false). Apex, www and vercel.app aliases previously associated.
- GitHub `Lead Scraper` disabled (inactivity), `Outreach Runner` explicitly disabled (user screenshot).
- Supabase project `leadclaw` ID `cfqcwbuxovoqhautkmho`, region eu-west-1, INACTIVE. Table inventory timed out; contents UNKNOWN. Organization plan free. No edge functions or branches reported.
- Resend domain `leadclaw.uk` status failed; sending setting enabled. Two API keys still exist; one enabled webhook targets `https://leadclawai.vercel.app/api/webhooks/resend` (older endpoint not identified in connected Vercel team's LeadClaw project search). Resend list-emails, contacts, broadcasts and webhook events returned none; recent metrics returned zero, but historic sends NOT disproved.
- Gmail evidence: March 2026 demo-lead notifications and onboarding test emails; six Gmail Sent results matching LeadClaw search, not an authoritative marketing send count. A March Resend 'Your export is ready' message was a DOMAINS export, not customer data. July Upstash notice names `leadclaw-rate-limit`; April Upstash archival notice also exists. Do not copy lead/contact PII into this repository.
- Source safety issue: `src/lib/email.ts` returns false when suppression lookup fails; outreach caller can treat that as unsuppressed. Fail-open, unresolved but workflows disabled.
- Official Companies House record for company number used in outreach identity shows dissolved in March 2022. Verify actual legal operator and historic representations before any new use.

## Open gates
1. Inspect dormant Supabase data safely (metadata and counts first), consider restore only after authorisation and safeguards; do not delete before retention/subject-request assessment.
2. Confirm all other schedulers and old webhook destination are disabled; identify any other connected providers.
3. Review historical outreach and opt-outs without mass copying personal records.
4. Review domain registrar, Stripe, PostHog, Sentry, Upstash, Twilio and other subscriptions, keys and webhook dependencies. Revoke unused credentials only after evidence/retention plan.
5. Preserve a limited contact/rights-request channel during wind-down.
6. Make repository private/archive after security review, without deleting evidence.
7. Final closure report with explicit proof per system, costs, retention decisions and remaining unknowns.

## NES DNA
Distinguish VERIFIED / USER-REPORTED / UNKNOWN / BLOCKED. A paused frontend does not disable external automations. A database connection timeout does not mean empty. An empty email API listing does not prove no historical delivery. Fail-closed suppression is a prerequisite to any future outreach. No credentials or third-party contact data in public engineering notes.
