# Reporting calendar — demo policy

All dates use inclusive UTC days. Source rows are filtered before bucketing, so a week crossing a range/year boundary cannot add records outside the chosen range. ISO is the default; legacy calendar parity remains unverified.

Presets include today, yesterday, rolling 7/14/30/60/90/180/365 days, week/month/quarter/year to date, previous completed week/month/quarter/year, all demo reporting history (1096 days) and custom. Rolling and elapsed ranges remain relative in saved views. Granularity defaults to daily, weekly or monthly based on range length and supports manual daily/weekly/monthly/quarterly/yearly choices. Hourly data is not fabricated.

Weekly options:

- ISO: Monday-start weeks, possibly labeled in the prior calendar year.
- Sunday: Sunday-start weeks.
- January: Week 1 starts January 1, resetting at each calendar year. Week 53 can be partial.
- Fiscal: seven-day blocks starting at the first of the selected fiscal-year start month. This is a demo policy, not a 4-4-5 retail calendar. Fiscal quarter grouping uses the selected start month; yearly buckets remain calendar years.

Comparison options are equal-length previous inclusive period; previous week; month/quarter/year shifts; 364-day weekday-aligned shift; custom inclusive dates; none. Month shifts clamp end-of-month dates (February 29 to February 28 in nonleap years). Shifted and custom periods can have different lengths; the Report Center labels this. Selecting an elapsed preset (such as month to date) gives an elapsed current range; previous equal-length period remains comparable by day count.

Current and comparison chart buckets align in chronological order, with the actual comparison dates shown below charts. This is not exact custom fiscal/ISO week-number matching. No timezone conversion, marketplace-local reporting day, arbitrary 4-4-5 calendar or year-side-by-side accounting parity is claimed. Coverage warnings identify requested dates beyond the generated source history.

## Graph-only Overview

The redesigned Overview aligns calendar years by month number or January 1-based week number (Week 1 = January 1–7; Week 53 may be partial). It does not use ordinal previous-period bucket alignment or ISO-week-year grouping. Select a reference year, up to two comparison years, and a range within the reference year from the right-hand collapsible calendar. With Match elapsed dates enabled, selecting the current year caps all selected years at the equivalent available month/day. Partial boundary periods are marked in chart tooltips; future/missing periods stay null, not zero. Both weekly and monthly aggregates are returned together, so the resolution toggle makes no new API request. Each point recomputes ratios from source components through the shared engine.
