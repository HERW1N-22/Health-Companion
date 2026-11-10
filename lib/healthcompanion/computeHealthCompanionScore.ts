/**
 * computeHealthCompanionScore — the server entrypoint for the HealthCompanion Score. Creates
 * the RLS-scoped server Supabase client and runs the registered contributors
 * through the safety-netted orchestration in lib/healthcompanion/score.ts. Lives in its
 * own file (not score.ts) so the server-only `next/headers` dependency pulled in
 * by createClient never leaks into the Jest-imported pure engine module.
 */
import { createClient } from '@/lib/supabase/server'
import { getLocalDateKey } from '@/lib/dates'
import { trainContributor } from '@/lib/healthcompanion/contributors/train'
import { fuelContributor } from '@/lib/healthcompanion/contributors/fuel'
import { tileStreamsContributor } from '@/lib/healthcompanion/contributors/tileStreams'
import { runContributors, type Contributor, type ScoreContext, type HealthCompanionScore } from '@/lib/healthcompanion/score'

/** The registry. Add a module by appending its contributor — nothing else
 *  changes. 'tiles' is ONE slot for ALL user-built tile streams (report
 *  contract), so tiles together weigh as much as Train, as much as Fuel. */
const CONTRIBUTORS: Contributor[] = [trainContributor, fuelContributor, tileStreamsContributor]

export async function computeHealthCompanionScore(userId: string): Promise<HealthCompanionScore> {
  const ctx: ScoreContext = { supabase: createClient(), userId }
  return runContributors(ctx, CONTRIBUTORS, getLocalDateKey())
}
