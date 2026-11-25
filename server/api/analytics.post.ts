import { filtersSchema } from "../../shared/types/analytics";
import { analyze, unavailable } from "../services/analytics";
import { expandProducts } from "../../shared/analytics/products";
export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "no-store");
  const parsed = filtersSchema.safeParse(await readBody(event));
  if (!parsed.success)
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid analytics filters",
      data: parsed.error.flatten(),
    });
  if (String(useRuntimeConfig(event).demoMode) !== "true")
    return unavailable(parsed.data.currency);
  const { makeFacts, makeInventory, products } = await import(
    "../fixtures/demo"
  );
  const today = new Date().toISOString().slice(0, 10),
    f = parsed.data,
    selected = expandProducts(f.products, products);
  const result = analyze(makeFacts(today), products, f);
  result.inventory = makeInventory(today).filter(
    (i) =>
      i.currency === f.currency &&
      (!f.products.length || selected.has(i.productId)) &&
      (!f.brand ||
        products.find((p) => p.id === i.productId)?.brand === f.brand) &&
      (!f.marketplaces.length ||
        f.marketplaces.includes(i.marketplace as "US")),
  );
  result.inventoryAsOf = today;
  return result;
});
