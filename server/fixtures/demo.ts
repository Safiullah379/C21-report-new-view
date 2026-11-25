// Entirely synthetic. No real organizations, orders, customers or credentials.
import type { Fact, Product, Inventory } from "../../shared/types/analytics";
import { isoDate, day } from "../../shared/analytics/calendar";
export const products: Product[] = [
  {
    id: "demo:parent",
    title: "Everyday carry collection",
    sku: "CARRY-PARENT",
    asin: "DEMO-PARENT",
    parentId: null,
    brand: "Studio Goods",
    variation: "All variations",
    marketplaces: ["US", "CA", "UK"],
    icon: "◒",
    color: "#dfe9d2",
  },
  {
    id: "demo:olive",
    title: "Everyday tote · Olive",
    sku: "TOTE-OLIVE",
    asin: "DEMO-OLIVE",
    parentId: "demo:parent",
    brand: "Studio Goods",
    variation: "Olive / 24L",
    marketplaces: ["US", "CA", "UK"],
    price: 4800,
    cost: 1350,
    icon: "◒",
    color: "#dfe9d2",
  },
  {
    id: "demo:ink",
    title: "Everyday tote · Ink",
    sku: "TOTE-INK",
    asin: "DEMO-INK",
    parentId: "demo:parent",
    brand: "Studio Goods",
    variation: "Ink / 24L",
    marketplaces: ["US", "CA", "UK"],
    price: 4800,
    cost: 1350,
    icon: "◒",
    color: "#dde4ef",
  },
  {
    id: "demo:pouch",
    title: "Travel organizer",
    sku: "POUCH-SAND",
    asin: "DEMO-POUCH",
    parentId: null,
    brand: "Studio Goods",
    variation: "Sand / Small",
    marketplaces: ["US"],
    price: 2400,
    cost: 620,
    icon: "▱",
    color: "#f0e5d6",
  },
  {
    id: "demo:bottle",
    title: "Trail insulated bottle",
    sku: "BOTTLE-32",
    asin: "DEMO-BOTTLE",
    parentId: null,
    brand: "Northline",
    variation: "Slate / 32oz",
    marketplaces: ["US", "CA", "UK"],
    price: 3600,
    cost: 980,
    icon: "▥",
    color: "#dce9ec",
  },
  {
    id: "demo:pack",
    title: "Weekender backpack",
    sku: "PACK-MOSS",
    asin: "DEMO-PACK",
    parentId: null,
    brand: "Northline",
    variation: "Moss / 30L",
    marketplaces: ["US", "CA", "UK"],
    price: 8900,
    cost: 2850,
    icon: "▣",
    color: "#dce5d8",
  },
  {
    id: "demo:lamp",
    title: "Arc desk light",
    sku: "LAMP-CREAM",
    asin: "DEMO-LAMP",
    parentId: null,
    brand: "Forma Home",
    variation: "Cream / LED",
    marketplaces: ["US", "UK"],
    price: 6500,
    cost: 1950,
    icon: "◔",
    color: "#f4e5c9",
  },
  {
    id: "demo:tray",
    title: "Oak desk tray",
    sku: "TRAY-OAK",
    asin: "DEMO-TRAY",
    parentId: null,
    brand: "Forma Home",
    variation: "Oak / Medium",
    marketplaces: ["US", "CA"],
    price: 3200,
    cost: 850,
    icon: "▰",
    color: "#ebd9c5",
  },
  {
    id: "demo:linen",
    title: "Linen cushion cover",
    sku: "LINEN-CLAY",
    asin: "DEMO-LINEN",
    parentId: null,
    brand: "Forma Home",
    variation: "Clay / 18 inch",
    marketplaces: ["US", "UK"],
    price: 2800,
    cost: 700,
    icon: "◇",
    color: "#ecdcd5",
  },
  {
    id: "demo:notebook",
    title: "Daily notes journal",
    sku: "NOTES-SAGE",
    asin: "DEMO-NOTES",
    parentId: null,
    brand: "Studio Goods",
    variation: "Sage / A5",
    marketplaces: ["US", "CA", "UK"],
    price: 1900,
    cost: 420,
    icon: "▤",
    color: "#e1eadf",
  },
  {
    id: "demo:mat",
    title: "Everyday desk mat",
    sku: "MAT-GRAPHITE",
    asin: "DEMO-MAT",
    parentId: null,
    brand: "Studio Goods",
    variation: "Graphite / Large",
    marketplaces: ["US", "CA"],
    price: 4200,
    cost: 1100,
    icon: "▰",
    color: "#dfe1e6",
  },
];
let cachedEnd = "",
  cached: Fact[] = [];
export function makeFacts(end: string): Fact[] {
  if (cachedEnd === end) return cached;
  const rows: Fact[] = [];
  for (let i = 0; i < 1830; i++) {
    const date = isoDate(new Date(Date.parse(end) - i * day)),
      stamp = Math.floor(Date.parse(date) / day);
    for (const [p, product] of products.filter((p) => p.price).entries()) {
      for (const [m, market] of product.marketplaces.entries()) {
        for (const channel of market === "US"
          ? ["amazon", "shopify"]
          : ["amazon"]) {
          const local = market === "CA" ? 1.31 : market === "UK" ? 0.79 : 1;
          const season =
            1 + 0.16 * Math.sin(stamp / 58) + 0.1 * Math.cos(stamp / 7);
          const trend = Math.max(0.4, 1 - i / 4000),
            channelScale = channel === "shopify" ? 0.48 : 1;
          const units = Math.max(
            1,
            Math.round(
              ((12 + ((((stamp * 7 + p * 11 + m * 3) % 23) + 23) % 23)) *
                season *
                trend *
                channelScale) /
                (1 + m * 0.65),
            ),
          );
          const price = Math.round(product.price! * local),
            sales = units * price,
            orders = Math.max(1, Math.round(units * 0.83));
          const adSales =
            channel === "amazon"
              ? Math.round(sales * (0.37 + (p % 3) * 0.045))
              : Math.round(sales * 0.18);
          const adSpend = Math.round(
            adSales * (0.19 + ((((stamp + p) % 11) + 11) % 11) / 200),
          );
          const returnedUnits =
            (((stamp + p) % 9) + 9) % 9 === 0
              ? Math.max(1, Math.round(units * 0.06))
              : 0;
          const clicks = Math.max(1, Math.round(adSpend / (42 * local))),
            adOrders = Math.min(orders, Math.round(clicks * 0.16));
          rows.push({
            date,
            productId: product.id,
            marketplace: market,
            channel,
            currency: market === "US" ? "USD" : market === "CA" ? "CAD" : "GBP",
            units,
            orders,
            sales,
            adSpend,
            adSales,
            refunds: returnedUnits * price,
            returnedUnits,
            cogs: units * Math.round(product.cost! * local),
            fees: Math.round(sales * (channel === "amazon" ? 0.15 : 0.029)),
            fulfillment: units * Math.round(390 * local),
            storage: units * Math.round(19 * local),
            promotions: Math.round(sales * (0.015 + (p % 3) * 0.005)),
            sessions: Math.round(orders / (0.09 + (p % 4) * 0.014)),
            pageViews: Math.round(orders / 0.06),
            impressions: clicks * (38 + p * 3),
            clicks,
            adOrders,
          });
        }
      }
    }
  }
  cachedEnd = end;
  cached = rows;
  return rows;
}
export function makeInventory(end: string): Inventory[] {
  const facts = makeFacts(end).filter(
    (f) => f.date >= isoDate(new Date(Date.parse(end) - 29 * day)),
  );
  return products
    .filter((p) => p.price)
    .flatMap((p, i) =>
      p.marketplaces.map((marketplace) => {
        const matching = facts.filter(
            (f) => f.productId === p.id && f.marketplace === marketplace,
          ),
          dailyUnits =
            matching.reduce((sum, f) => sum + (f.units || 0), 0) / 30;
        const cover = [42, 9, 0, 64, 17, 125, 38, 55, 75, 26][i]!,
          available = Math.round(dailyUnits * cover),
          reserved = Math.round(dailyUnits * 2),
          inbound = i % 3 === 0 ? Math.round(dailyUnits * 20) : 0;
        const cost = Math.round(
          p.cost! *
            (marketplace === "CA" ? 1.31 : marketplace === "UK" ? 0.79 : 1),
        );
        return {
          productId: p.id,
          marketplace,
          currency:
            marketplace === "CA" ? "CAD" : marketplace === "UK" ? "GBP" : "USD",
          available,
          inbound,
          reserved,
          dailyUnits,
          daysRemaining: dailyUnits ? available / dailyUnits : 0,
          value: available * cost,
          reorder: Math.max(
            0,
            Math.ceil(dailyUnits * 45 - available - inbound),
          ),
          status:
            available === 0
              ? "Out of stock"
              : cover < 21
                ? "Low stock"
                : cover > 90
                  ? "Overstock"
                  : "Healthy",
        };
      }),
    );
}
