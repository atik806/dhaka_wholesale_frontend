export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

/** Same thresholds as the backend's deriveStockStatus and the DB trigger. */
export function stockStatusFor(quantity: number): StockStatus {
  if (quantity <= 0) return "out-of-stock";
  if (quantity <= 5) return "low-stock";
  return "in-stock";
}

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  "in-stock": "In stock",
  "low-stock": "Low stock",
  "out-of-stock": "Out of stock",
};

/** A whole number of units, 0 or more, or an error message. */
export function parseStockQuantity(value: number | string | ""): number | string {
  if (value === "" || value === null || value === undefined) return "Enter how many units you have";
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 0) return "Use a whole number of units (0 or more)";
  if (quantity > 1_000_000) return "That is more than the allowed maximum";
  return quantity;
}
