-- Studio relaunch, phase 1 (MILKTREE-STUDIO.md §6.10).
-- The start form now routes by product instead of qualifying by budget.
-- Run this against the Milktree project before deploying phase 1; the lead
-- API tolerates the old shape (it retries without the new columns) so a
-- missed migration degrades to a warning, not lost leads.

alter table public.website_leads
  add column if not exists product text,          -- sprint | build | subscription | not-sure
  add column if not exists sector text,           -- hospitality | property-finance | trades | retail | automotive | health | other
  add column if not exists timing text;           -- this-month | next-month | looking

-- Old columns are kept for history. New rows leave them null.
alter table public.website_leads
  alter column budget drop not null,
  alter column marketing_function drop not null;

comment on column public.website_leads.product is 'Which door on /start the lead chose (lib/funnel.ts NEED_OPTIONS).';
comment on column public.website_leads.sector is 'Self-reported sector (lib/funnel.ts SECTOR_OPTIONS).';
comment on column public.website_leads.timing is 'When they want to start (lib/funnel.ts TIMING_OPTIONS).';
comment on column public.website_leads.route is 'Server-evaluated route: sprint | build | subscription | nurture (was qualified | unqualified).';
