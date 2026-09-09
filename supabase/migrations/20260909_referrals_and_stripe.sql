-- Studio relaunch, phase 3 (docs/PRD.md 3.3 and 3.4).

-- Self-serve sprint checkout: one lead per Stripe Checkout Session.
alter table public.website_leads
  add column if not exists stripe_session_id text;

create unique index if not exists website_leads_stripe_session_id_key
  on public.website_leads (stripe_session_id)
  where stripe_session_id is not null;

-- Referral introductions. The introduced business is a lead; the referrer is
-- the person owed a reward when it becomes a Brand Build.
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  referrer_name text not null,
  referrer_email text not null,
  referrer_company text,
  relationship text not null,          -- client | past-client | partner | friend
  lead_name text,
  lead_company text not null,
  lead_contact text not null,          -- email or phone, as typed
  note text,
  status text not null default 'new',  -- new | contacted | build-confirmed | rewarded | closed
  reward text,                          -- sprint | credit, once chosen
  attribution jsonb
);

alter table public.referrals enable row level security;
-- No policies: the service-role key (server only) is the only way in or out,
-- matching website_leads.

comment on table public.referrals is 'Referral introductions from /refer. Reward: free Brand Reset Sprint or £799 subscription credit when the introduced business confirms a Brand Build.';
