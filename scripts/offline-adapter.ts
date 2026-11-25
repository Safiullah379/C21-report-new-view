import {
  yearComparisonSchema,
  compareYears,
} from "../shared/analytics/year-comparison";
/** Browser-only adapter for the explicitly requested standalone dummy-data export. */
import { makeFacts, makeInventory, products } from "../server/fixtures/demo";
import { analyze } from "../server/services/analytics";
import { filtersSchema } from "../shared/types/analytics";
import { expandProducts } from "../shared/analytics/products";

const respond = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

// File URLs cannot reach Nitro. Run the identical fixture service locally instead.
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const raw =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  if (init?.signal?.aborted) throw new DOMException("Aborted", "AbortError");
  if (raw.includes("/api/year-comparison")) {
    try {
      const text =
        typeof init?.body === "string"
          ? init.body
          : input instanceof Request
            ? await input.clone().text()
            : "{}";
      const parsed = yearComparisonSchema.safeParse(JSON.parse(text));
      if (!parsed.success)
        return respond({ statusMessage: "Invalid year comparison" }, 400);
      const today = new Date().toISOString().slice(0, 10);
      return respond(
        compareYears(makeFacts(today), products, parsed.data, today),
      );
    } catch {
      return respond({ statusMessage: "Invalid year comparison" }, 400);
    }
  }
  if (raw.includes("/api/analytics")) {
    let body: unknown;
    try {
      const text =
        typeof init?.body === "string"
          ? init.body
          : input instanceof Request
            ? await input.clone().text()
            : "{}";
      body = JSON.parse(text);
    } catch {
      return respond({ statusMessage: "Invalid analytics filters" }, 400);
    }
    const parsed = filtersSchema.safeParse(body);
    if (!parsed.success)
      return respond(
        {
          statusMessage: "Invalid analytics filters",
          data: parsed.error.flatten(),
        },
        400,
      );
    const f = parsed.data,
      today = new Date().toISOString().slice(0, 10),
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
    return respond(result);
  }
  if (raw.includes("/api/products")) {
    const query = decodeURIComponent(
      (raw.match(/[?&]q=([^&]*)/)?.[1] || "").replaceAll("+", " "),
    )
      .trim()
      .toLowerCase();
    if (query.length > 100)
      return respond({ statusMessage: "Invalid search" }, 400);
    return respond({
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
          ].some((value) => value.toLowerCase().includes(query)),
        )
        .slice(0, 20),
    });
  }
  // Nuxt's optional app-manifest polling is local in this export too.
  if (raw.includes("/builds/"))
    return respond({
      id: "standalone-demo",
      timestamp: Date.now(),
      prerendered: [],
      matcher: { static: {}, wildcard: {}, dynamic: {} },
    });
  return respond(
    { statusMessage: "No external services are used in this offline demo." },
    404,
  );
};
