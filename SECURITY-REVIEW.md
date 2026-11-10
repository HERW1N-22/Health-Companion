# Security review

Scope: static review of the imported source snapshot, followed by branding changes and targeted hardening. This is not a security certification.

## Coverage
- Enumerated 1,557 tracked files; retrieved and pattern-scanned all 1,428 readable text files, including source, configuration, lockfiles, SQL migrations and scripts.
- Reviewed selected authentication, billing, credential encryption, administrative access, development scripts and external-request code.
- No matches for the scanned private-key, GitHub-token and long Anthropic/OpenAI-style credential patterns. This is not proof that no secret exists.
- Binary images, fonts and icons were inventoried but not malware-scanned or visually rebranded. The obsolete mcp-handoff.zip archive and mcp-bundle.sh source-reconstruction script were removed.
- Dependencies were not installed or executed. No live package-advisory audit, build, browser test, penetration test or database integration test was possible in this session.

## Issues addressed in source
1. High: authenticated users had table-wide UPDATE on their own profiles row, including tier and billing columns. Added a migration restricting direct updates to onboarded. The checkout route now writes the server-owned customer ID through the server admin client, scoped to the user identity verified by getUser(). Apply the new migration before considering this fixed in a database.
2. Development scripts contained a shared fixed password and printed credentials. Both creation and reset scripts now require explicit opt-in and private environment credentials with a minimum password length. They refuse NODE_ENV=production. Never point them at a real-user database.
3. Removed obsolete bundled source artifacts to avoid maintaining an unreviewed duplicate of the code.

## Remaining risks and validation
- Connector encryption falls back to a plaintext envelope when CONNECTOR_ENCRYPTION_KEY is missing. A placeholder is now documented. Configure a strong key before connecting accounts; legacy stored values need migration/reconnection.
- Signup email-confirmation behavior needs correction/testing before public deployment. Do not disable email verification for a public app just to bypass setup.
- Development seed route accepts a secret in the query string; leave SEED_KEY unset outside isolated development.
- HTML/SVG rendering and the custom tile bridge need dedicated adversarial testing. Pattern matches alone do not prove an exploitable XSS issue or prove safety.
- RLS policies, OAuth flows, service-role boundaries, upload limits, AI rate limits and billing transitions require runtime tests.
- Run a fresh dependency advisory audit before release. Lockfiles alone do not establish that dependencies are safe.
- Branding changes include internal storage keys, environment names, module/file names and SQL names. This initial version assumes a fresh database and no existing user data; do not apply it over a populated installation without a migration plan.
- Raster images may still contain old embedded branding. No claim is made that binary content contains no old text.

## Follow-up
Configure a dedicated Supabase development project and API keys privately. Apply all migrations, run pnpm test -- --runInBand, pnpm lint, pnpm build and pnpm audit, then test signup, logging, account isolation and billing using disposable accounts.
