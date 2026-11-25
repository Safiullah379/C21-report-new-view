# Performance evidence — 2026-11-25

## Complete demo workspace

Production bundle; serial warm loopback HTTP POST /api/analytics; default 30-day native USD filters; generated fixture data, no database, no concurrent load. The script discards the first warmup and measures the next 20 responses.

| Measurement | Observed |
|---|---:|
| Median response | 80.10 ms |
| p95 response | 97.07 ms |
| JSON response bytes | 312,823 |
| Build duration | 15.3 s |
| Client assets total | 1.46 MB |
| Client assets gzip total | 436.53 kB |

Browser request-count assertions verify that module navigation and chart layout/type/order changes reuse the loaded analytical data without new analytics API calls. This does not measure a millisecond interaction target.

The chart chunk exceeds the build's 500 kB warning threshold. Raw rows are retained for local drill-down/table/export, so payloads grow with date range and catalog size. The demo bounds ranges at 1096 days and browser cache at five query results. Source generation is cached per rolling date. No large-dataset indexing, database query plan, concurrent tenant performance, p99, LCP, INP or browser-memory objective has been established.

## Earlier foundation baseline

The smaller Foundation 01 fixture had a measured 5.04 ms median, 7.91 ms p95 and 41,781-byte response. The expanded demo now returns many more products and financial/traffic fields and five years of available fixture history. These workloads differ; the earlier numbers are not an equivalent benchmark or a claimed regression target.

For a repeat sample, start the built demo with NUXT_DEMO_MODE=true and run pnpm benchmark. Real integrations need representative accounts, indexed data, access controls, load and rendering profiles before making production speed claims.
