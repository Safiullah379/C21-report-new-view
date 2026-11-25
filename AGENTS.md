# Zonhack engineering rules

Use the existing checkout. Cloud tasks are isolated; do not create worktrees unless asked.
Read README.md, docs/PROJECT_STATUS.md and docs/PRODUCT_REQUIREMENTS.md first.

- Nuxt 4 / Vue 3 script setup / strict TypeScript / Nuxt UI / Tailwind / Nitro / pnpm.
- Preserve the original Overview once supplied. It has NOT been recovered or recreated. The user authorized a new dummy-data Overview and complete demo on 2026-11-25; do not claim legacy parity.
- No production business schema before auditing the supplied database. No production writes or destructive migrations without explicit approval.
- Never present synthetic fixtures as real reporting. NUXT_DEMO_MODE defaults false. Fixtures stay in server/fixtures and use explicit demo identities.
- Shared analytics/calendars/metric definitions serve every view. Do not average ratios or mix currencies. Money uses integer minor units; missing values are null, never implied zero.
- IDs must be scoped to account and tenant once actual identity contracts are known. Product strings alone do not establish identity.
- All real data access must be authenticated and authorized server-side before connecting a source. Do not treat the demo gate as authentication.
- Never store secrets, real tenant records or tokens in client preferences, fixtures, logs or committed files.
- Layout and chart changes must reuse the loaded dataset. Validate filter inputs; abort obsolete searches and analytics requests.
- The complete local demo is authorized. Keep production integrations separate and maintain parity evidence and blockers honestly.
- Before completion run pnpm lint, pnpm typecheck, pnpm test, pnpm build and relevant Playwright checks. Update docs/PROJECT_STATUS.md with actual results.
