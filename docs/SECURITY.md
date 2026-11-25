# Security and data scope

The application contains only synthetic demo data. There are no real accounts, sessions, tenant authorizations, external integrations, database credentials, billing operations or server mutation endpoints. Without explicit `NUXT_DEMO_MODE=true`, APIs return unavailable analytics and an empty catalog. Opt-in demo APIs intentionally expose fictional fixtures without authentication.

Zod validates dates, bounded ranges, enums, product selections, chart preferences, saved views and restored backups. Invalid backups do not apply. Backups are limited to 1 MB and 30 views. Vue escapes displayed titles/notes. CSV quotes cells and neutralizes spreadsheet formulas in string fields. XLSX emits only numeric or inline-string cells, with XML escaping and control-character removal. Exports carry a synthetic-data notice and label monetary units.

Browser storage and shared URLs contain synthetic IDs, filters and presentation settings. They are neither an authorization grant nor a secure account store. Never add real records, tokens or secrets to fixtures, browser preferences, report notes or shared links. Local view deletion asks inline confirmation; active workspace reset preserves named views.

Before live business data, implement secure sessions (HttpOnly/Secure/SameSite cookies), per-operation server authorization, trusted tenant/account context, scoped repositories and caches, CSRF protection for mutations, rate limits, independent direct-request tenant isolation tests, audit logs, observability, backup/recovery and production hardening. Never infer trusted tenant scope from client-provided filters. No authentication or tenant-isolation validation is claimed for this demo.
