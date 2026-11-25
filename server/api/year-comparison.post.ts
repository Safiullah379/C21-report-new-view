import {
  yearComparisonSchema,
  compareYears,
  type YearComparisonResult,
} from "../../shared/analytics/year-comparison";
export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "no-store");
  const parsed = yearComparisonSchema.safeParse(await readBody(event));
  if (!parsed.success)
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid year comparison",
      data: parsed.error.flatten(),
    });
  const today = new Date().toISOString().slice(0, 10);
  if (String(useRuntimeConfig(event).demoMode) !== "true")
    return {
      mode: "unavailable",
      currency: parsed.data.currency,
      today,
      weekly: [],
      monthly: [],
    } satisfies YearComparisonResult;
  const { makeFacts, products } = await import("../fixtures/demo");
  return compareYears(makeFacts(today), products, parsed.data, today);
});
