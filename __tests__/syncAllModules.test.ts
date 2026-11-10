import { mirrorTargets, keysToHydrate, ownerAction, keysToPurge, OWNER_KEY, MODULE_MIRRORS } from '@/lib/sync/syncAllModules'

// Sync-on-load pushes every non-empty local module blob to Supabase. The
// safety-critical part is mirrorTargets' SELECTION: it must never pick an empty
// or garbage blob (which a whole-row upsert would use to clobber real server
// data). These pin the no-clobber gate.

/** Build a localStorage reader from a {key: value} map. */
const reader = (store: Record<string, string>) => (k: string) => store[k] ?? null

describe('mirrorTargets — no-clobber selection', () => {
  test('empty store → nothing to mirror', () => {
    expect(mirrorTargets(reader({}))).toEqual([])
  })

  test('picks modules that actually hold data', () => {
    const keys = mirrorTargets(
      reader({
        healthcompanion_brand_v1: JSON.stringify({ brands: [{ id: 'b1', name: 'Acme' }] }),
        healthcompanion_goals_v1: JSON.stringify({ goals: [{ id: 'g1' }] }),
        healthcompanion_peak_v1: JSON.stringify({ substances: [{ id: 's1', key: 'coffee' }], taps: [], events: [], tasks: [] }),
        healthcompanion_supplements_v1: JSON.stringify({ items: [{ id: 'i1' }] }),
        healthcompanion_water_v1: JSON.stringify({ logs: { '2026-06-19': 3 }, setupComplete: true }),
      }),
    ).map((t) => t.key)
    expect(keys.sort()).toEqual(
      ['healthcompanion_brand_v1', 'healthcompanion_goals_v1', 'healthcompanion_peak_v1', 'healthcompanion_supplements_v1', 'healthcompanion_water_v1'].sort(),
    )
  })

  test('SKIPS empty blobs — never clobbers server data with a fresh/cleared store', () => {
    const keys = mirrorTargets(
      reader({
        healthcompanion_brand_v1: JSON.stringify({ brands: [] }),
        healthcompanion_goals_v1: JSON.stringify({ goals: [] }),
        healthcompanion_peak_v1: JSON.stringify({ substances: [], taps: [], events: [], tasks: [], profile: { weightKg: 75, tolerance: 5 } }),
        healthcompanion_supplements_v1: JSON.stringify({ items: [] }),
        healthcompanion_water_v1: JSON.stringify({ logs: {}, setupComplete: false }),
      }),
    )
    expect(keys).toEqual([])
  })

  test('water with stray logs but setup NOT complete is skipped (never clobber custom prefs with defaults)', () => {
    const keys = mirrorTargets(
      reader({ healthcompanion_water_v1: JSON.stringify({ logs: { '2026-06-19': 1 }, setupComplete: false, caffeineMgPerDay: 200 }) }),
    )
    expect(keys).toEqual([])
  })

  test('goals with only a streak history (dayLogs) but no open goals still syncs', () => {
    const keys = mirrorTargets(
      reader({ healthcompanion_goals_v1: JSON.stringify({ goals: [], dayLogs: [{ date: '2026-06-18', successful: true }], tomorrow: [] }) }),
    ).map((t) => t.key)
    expect(keys).toEqual(['healthcompanion_goals_v1'])
  })

  test('skips garbage / non-object / missing-field blobs', () => {
    const keys = mirrorTargets(
      reader({
        healthcompanion_brand_v1: 'not json{',
        healthcompanion_goals_v1: JSON.stringify([1, 2, 3]), // array, not an object
        healthcompanion_peak_v1: JSON.stringify(null),
        healthcompanion_supplements_v1: JSON.stringify({}), // no items field
        healthcompanion_water_v1: JSON.stringify('a string'),
      }),
    )
    expect(keys).toEqual([])
  })

  test('a partially-populated store mirrors only the populated modules', () => {
    const keys = mirrorTargets(
      reader({
        healthcompanion_brand_v1: JSON.stringify({ brands: [{ id: 'b1' }] }),
        healthcompanion_goals_v1: JSON.stringify({ goals: [] }), // empty → skipped
      }),
    ).map((t) => t.key)
    expect(keys).toEqual(['healthcompanion_brand_v1'])
  })
})

describe('keysToHydrate — server→local pull eligibility (absent-only, no resurrect)', () => {
  test('fresh device (all keys absent) → all blob-backed modules eligible', () => {
    expect(keysToHydrate(() => null).sort()).toEqual(
      ['healthcompanion_brand_v1', 'healthcompanion_goals_v1', 'healthcompanion_peak_v1', 'healthcompanion_supplements_v1'].sort(),
    )
  })

  test('a key that EXISTS (even empty) is never hydrated — pulling would resurrect cleared data', () => {
    const read = (k: string) => (k === 'healthcompanion_goals_v1' ? JSON.stringify({ goals: [] }) : null)
    expect(keysToHydrate(read)).not.toContain('healthcompanion_goals_v1')
    expect(keysToHydrate(read)).toContain('healthcompanion_brand_v1')
  })

  test('water is never hydrated here (relational, not a single blob)', () => {
    expect(keysToHydrate(() => null)).not.toContain('healthcompanion_water_v1')
  })

  test('a fully-populated device hydrates nothing', () => {
    expect(keysToHydrate(() => '{"x":1}')).toEqual([])
  })

  test('registry completeness', () => {
    for (const m of MODULE_MIRRORS) {
      expect(typeof m.key).toBe('string')
      expect(typeof m.hasData).toBe('function')
      expect(typeof m.mirror).toBe('function')
    }
    // one entry per known localStorage-backed module
    expect(MODULE_MIRRORS.map((m) => m.key).sort()).toEqual(
      ['healthcompanion_brand_v1', 'healthcompanion_goals_v1', 'healthcompanion_peak_v1', 'healthcompanion_supplements_v1', 'healthcompanion_water_v1'].sort(),
    )
  })
})

describe('ownerAction — shared-device cross-user bleed guard', () => {
  const KEYS = ['healthcompanion_brand_v1', 'healthcompanion_goals_v1', OWNER_KEY, 'sb-auth-token', 'unrelated']

  test('signed out → never purge, never stamp', () => {
    expect(ownerAction(null, 'userA', KEYS)).toEqual({ purge: [], stampTo: null })
  })

  test('CRITICAL: absent stamp (existing user, pre-feature data) → NEVER purge, just stamp', () => {
    // The catastrophic case to avoid: this must not wipe an existing user's data.
    expect(ownerAction('userB', null, KEYS)).toEqual({ purge: [], stampTo: 'userB' })
  })

  test('same user → no purge, restamp', () => {
    expect(ownerAction('userA', 'userA', KEYS)).toEqual({ purge: [], stampTo: 'userA' })
  })

  test('different prior owner → purge every healthcompanion_* key (except the stamp), then stamp new user', () => {
    const action = ownerAction('userB', 'userA', KEYS)
    expect(action.stampTo).toBe('userB')
    expect(action.purge.sort()).toEqual(['healthcompanion_brand_v1', 'healthcompanion_goals_v1'].sort())
    expect(action.purge).not.toContain(OWNER_KEY) // never wipe the stamp itself
    expect(action.purge).not.toContain('sb-auth-token') // never touch non-healthcompanion keys (e.g. auth)
    expect(action.purge).not.toContain('unrelated')
  })

  test('keysToPurge only targets healthcompanion_* and excludes the owner stamp', () => {
    expect(keysToPurge(['healthcompanion_a', 'healthcompanion_b', OWNER_KEY, 'sb-x', 'other']).sort()).toEqual(['healthcompanion_a', 'healthcompanion_b'])
  })
})
