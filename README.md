# Health Companion

Health Companion is a personal health and wellness application that brings nutrition and macro logging, workouts, hydration, weight trends, sleep, and recovery tracking into one dashboard, with optional AI-powered coaching.

## Features
- Food logging, food-photo analysis, barcode lookup, calorie and macro tracking.
- Weight trends, nutrition goals and adaptive calorie targets.
- Workout logs, hydration tracking, sleep and wearable integrations.
- Account authentication and per-user PostgreSQL storage through Supabase.
- Optional contextual AI coach.

The code also includes additional dashboard modules and an optional MCP integration. Integrations require their own configuration; no live API keys or populated database are included.

## Technology
Next.js 14, React 18, TypeScript, vanilla CSS, Supabase, pnpm.

## Local setup
Use Node.js 20+ and the pinned pnpm version in package.json.

```bash
git clone https://github.com/HERW1N-22/Health-Companion.git
cd Health-Companion
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
```

Create a dedicated Supabase development project, then configure these values in .env.local:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-only)
- NEXT_PUBLIC_APP_URL=http://localhost:3000

Apply the database migrations using the Supabase CLI from this directory:
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
pnpm dev
```

Open http://localhost:3000. Never paste API secrets into source files, commits or chat.

## Optional integrations
| Variable | Enables |
| --- | --- |
| ANTHROPIC_API_KEY | AI chat and food-photo analysis |
| USDA_API_KEY | Nutrition database search |
| CONNECTOR_ENCRYPTION_KEY | Encryption of stored connector credentials; generate a strong random key before using connectors |
| CRON_SECRET | Authenticated scheduled tasks |
| Wearable OAuth credentials | Provider-specific wearable sync |

Barcode lookups use Open Food Facts without an API key. Verify the CLAUDE_MODEL value against the models available to your account. Other variables are explained in .env.example.

## Validation and current limitations
```bash
pnpm test -- --runInBand
pnpm lint
pnpm build
```

Runtime setup, dependency vulnerability scanning and full user-journey testing remain pending. Review SECURITY-REVIEW.md before using real health information. The existing signup flow needs email-confirmation testing. This is a wellness application, not a medical diagnosis service.

## License
MIT. Required third-party copyright and permission notices are retained in LICENSE.
