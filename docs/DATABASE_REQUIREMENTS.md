# Required source material

Provide a schema export and anonymized representative rows through secure files, or configure read-only development access securely in environment settings. Never send passwords in chat or commit a production dump.

Needed for the next phase:

- Database engine/version, tables, keys, foreign keys, indexes, approximate row counts, grain and date coverage.
- Tenant → organization/client/account relationships and authentication/role model.
- Product scoped identifiers, SKU/ASIN aliases, parent-child relationships, cross-market and account mappings.
- Marketplace/channel dimensions, native and settlement currencies, reporting timezone and calendar definitions.
- Sales/returns/refunds, order-item grain and dedup keys, tax/shipping/discount treatment.
- Advertising attribution windows, spend and ad sales source fields.
- Cost/fee/refund allocation components, approved profit/ROI formulas, historical FX source/rate-date/rounding policy.
- Known dashboard totals and period exports for reconciliation, freshness timestamps, refresh/import behavior.
- Original Overview source, routes and screenshots, permitted reference-app access.

Audit before ORM selection, schema design, indexing or migration. Start read-only against a separate development copy. No production database has been touched.
