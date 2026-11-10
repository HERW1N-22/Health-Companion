# Health Companion setup

Follow README.md. Keep secrets in .env.local, which is gitignored. Do not request secret values in chat or commit them. Use a dedicated development database and apply every migration, including the profile-permission hardening migration. Configure email confirmation correctly before public use. Do not create test users with a shared default password. Do not deploy or enable paid integrations unless requested.
