import type { Product } from "../types/analytics";
export function expandProducts(
  ids: string[],
  products: Product[],
): Set<string> {
  const result = new Set<string>();
  const visit = (id: string, seen = new Set<string>()) => {
    if (seen.has(id)) return;
    seen.add(id);
    const children = products.filter((p) => p.parentId === id);
    if (children.length) children.forEach((p) => visit(p.id, seen));
    else if (products.some((p) => p.id === id)) result.add(id);
  };
  ids.forEach((id) => visit(id));
  return result;
}
