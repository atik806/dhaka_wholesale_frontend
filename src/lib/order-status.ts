/**
 * Mirror of the backend order/payment state machine
 * (Dhaka_wholesale-backend src/modules/orders/order-state.ts). The server is
 * authoritative; this only decides which choices the admin UI offers.
 */
const FLOW = ["pending", "confirmed", "shipped", "delivered"];
const CANCELLABLE = ["pending", "confirmed"];

/** Statuses an admin may move an order to from `status`. */
export function nextOrderStatuses(status: string): string[] {
  const index = FLOW.indexOf(status);
  if (index < 0) return [];
  const forward = FLOW.slice(index + 1);
  return CANCELLABLE.includes(status) ? [...forward, "cancelled"] : forward;
}

const PAYMENT_FLOW: Record<string, string[]> = {
  pending: ["paid", "failed"],
  failed: ["pending", "paid"],
  paid: ["refunded"],
  refunded: [],
};

/** Payment statuses reachable now; cash can only be collected once shipped. */
export function nextPaymentStatuses(paymentStatus: string, orderStatus: string): string[] {
  const collectable = orderStatus === "shipped" || orderStatus === "delivered";
  return (PAYMENT_FLOW[paymentStatus] ?? []).filter((next) => next !== "paid" || collectable);
}
