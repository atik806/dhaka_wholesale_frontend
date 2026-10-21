/** Pricing snapshot stored on an order by the backend's place_order(). */
export interface OrderPricingSnapshot {
  subtotal: number | string;
  original_subtotal?: number | string | null;
  combo_discount?: number | string | null;
  coupon_discount?: number | string | null;
  discount_total?: number | string | null;
  coupon_code?: string | null;
}

export interface OrderPriceLine {
  label: string;
  amount: number;
}

const toNumber = (value: number | string | null | undefined) => Number(value ?? 0) || 0;

/**
 * Lines shown above "Subtotal" explaining why an order cost less than its
 * items: the pre-discount items total, then each discount as a negative
 * amount. Orders placed before the snapshot existed return no lines.
 */
export function orderDiscountLines(order: OrderPricingSnapshot): OrderPriceLine[] {
  const discountTotal = toNumber(order.discount_total);
  if (order.original_subtotal == null || discountTotal <= 0) return [];

  const lines: OrderPriceLine[] = [{ label: "Items", amount: toNumber(order.original_subtotal) }];
  const combo = toNumber(order.combo_discount);
  const coupon = toNumber(order.coupon_discount);
  if (combo > 0) lines.push({ label: "Combo discount", amount: -combo });
  if (coupon > 0) {
    lines.push({
      label: order.coupon_code ? `Coupon (${order.coupon_code})` : "Coupon",
      amount: -coupon,
    });
  }
  return lines;
}

/**
 * One idempotency key per checkout attempt. Retrying the same request (same
 * fingerprint) reuses the key so the server returns the original order
 * instead of placing a duplicate; any change to the request gets a new key.
 */
export function createCheckoutKeyStore(generate: () => string = () => crypto.randomUUID()) {
  let current: { fingerprint: string; key: string } | null = null;
  return {
    keyFor(fingerprint: string) {
      if (current?.fingerprint !== fingerprint) current = { fingerprint, key: generate() };
      return current.key;
    },
    reset() {
      current = null;
    },
  };
}
