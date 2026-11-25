import { z } from "zod";
export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "no-store");
  const parsed = z
    .object({ q: z.string().max(100).default("") })
    .safeParse(getQuery(event));
  if (!parsed.success)
    throw createError({ statusCode: 400, statusMessage: "Invalid search" });
  const config = useRuntimeConfig(event);
  if (String(config.demoMode) !== "true")
    return { mode: "unavailable", products: [] };
  const { products } = await import("../fixtures/demo");
  const query = parsed.data.q.trim().toLowerCase();
  return {
    mode: "demo",
    products: products
      .filter((p) =>
        [
          p.title,
          p.sku,
          p.asin,
          p.brand,
          p.variation,
          products.find((parent) => parent.id === p.parentId)?.asin || "",
          products.find((parent) => parent.id === p.parentId)?.sku || "",
        ].some((v) => v.toLowerCase().includes(query)),
      )
      .slice(0, 20),
  };
});
