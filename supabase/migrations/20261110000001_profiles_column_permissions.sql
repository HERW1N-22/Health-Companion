-- Ownership RLS does not prevent self-upgrades of tier or billing fields.
-- Only onboarding may be updated directly by an authenticated client.
-- Billing writes continue through the existing server-only service role.
begin;
revoke update on table public.profiles from public, anon, authenticated;
revoke update (id, onboarded, tier, created_at, stripe_customer_id, subscription_status, current_period_end)
  on public.profiles from public, anon, authenticated;
grant update (onboarded) on public.profiles to authenticated;
commit;
