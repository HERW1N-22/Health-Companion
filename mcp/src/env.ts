// Environment loading + validation for the HealthCompanion MCP.
//
// No dotenv dependency: we parse a local `.env` ourselves (KEY=VALUE lines) so
// the server runs the same whether launched by Claude, a cron, or the CLI.
// All logging goes to stderr — stdout is reserved for the MCP protocol stream.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(here, '..'); // mcp/

/** Parse a minimal .env file. Ignores blank lines and `#` comments. */
function parseEnvFile(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  const text = readFileSync(path, 'utf8');
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    // Strip matching surrounding quotes.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

/** Load `.env` (from package root, then cwd) into process.env without overriding
 *  anything already set in the real environment. */
function loadDotenv(): void {
  for (const candidate of [join(packageRoot, '.env'), join(process.cwd(), '.env')]) {
    if (!existsSync(candidate)) continue;
    try {
      const parsed = parseEnvFile(candidate);
      for (const [k, v] of Object.entries(parsed)) {
        if (process.env[k] === undefined) process.env[k] = v;
      }
    } catch (err) {
      console.error(`[healthcompanion-mcp] failed to read ${candidate}:`, err);
    }
  }
}

loadDotenv();

export type AuthMode = 'user' | 'service';

export interface HealthCompanionEnv {
  supabaseUrl: string;
  anonKey: string;
  authMode: AuthMode;
  // user mode
  userEmail?: string;
  userPassword?: string;
  // service mode
  serviceRoleKey?: string;
  userId?: string;
  // misc
  timezone?: string;
}

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`[healthcompanion-mcp] missing required env var: ${name}`);
    console.error('[healthcompanion-mcp] copy mcp/.env.example to mcp/.env and fill it in.');
    process.exit(1);
  }
  return v;
}

let cached: HealthCompanionEnv | null = null;

export function getEnv(): HealthCompanionEnv {
  if (cached) return cached;

  const supabaseUrl = required('HEALTH_COMPANION_SUPABASE_URL');
  const anonKey = required('HEALTH_COMPANION_SUPABASE_ANON_KEY');

  const serviceRoleKey = process.env.HEALTH_COMPANION_SUPABASE_SERVICE_ROLE_KEY;
  const userId = process.env.HEALTH_COMPANION_USER_ID;
  const userEmail = process.env.HEALTH_COMPANION_USER_EMAIL;
  const userPassword = process.env.HEALTH_COMPANION_USER_PASSWORD;

  // Service mode is opt-in and only when both the key and an explicit user id
  // are present. Otherwise we default to the RLS-respecting user session.
  const wantsService = Boolean(serviceRoleKey && userId);

  let authMode: AuthMode;
  if (wantsService) {
    authMode = 'service';
    console.error(
      '[healthcompanion-mcp] ⚠ running in SERVICE-ROLE mode — this key bypasses RLS. ' +
        'Local/personal use only; never expose this process to a client or shared host.',
    );
  } else {
    authMode = 'user';
    if (!userEmail || !userPassword) {
      console.error(
        '[healthcompanion-mcp] no auth configured. Set HEALTH_COMPANION_USER_EMAIL + HEALTH_COMPANION_USER_PASSWORD ' +
          '(recommended), or HEALTH_COMPANION_SUPABASE_SERVICE_ROLE_KEY + HEALTH_COMPANION_USER_ID (opt-in).',
      );
      process.exit(1);
    }
  }

  cached = {
    supabaseUrl,
    anonKey,
    authMode,
    userEmail,
    userPassword,
    serviceRoleKey,
    userId,
    timezone: process.env.HEALTH_COMPANION_TIMEZONE,
  };
  return cached;
}
