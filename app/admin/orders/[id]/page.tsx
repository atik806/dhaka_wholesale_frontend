"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Check, Download } from "lucide-react";
import { fetchOrder, updateOrderStatus, updatePaymentStatus } from "@/src/lib/admin-api";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { formatPrice, formatDate, safeImage, cn } from "@/src/lib/utils";
import { SITE_NAME } from "@/src/lib/constants";
import type { Order } from "@/src/lib/admin-api";
import { jsPDF } from "jspdf";

const statusSteps = ["pending", "confirmed", "shipped", "delivered"];

const nextStatuses: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const paymentStatuses = ["pending", "paid", "failed", "refunded"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOrder(id);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const currentStepIndex = order ? statusSteps.indexOf(order.status) : -1;

  const handleStatusChange = async (newStatus: string) => {
    if (!order || order.status === newStatus) return;
    if (newStatus === "cancelled") {
      if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
    }
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(order.id, newStatus);
      setOrder(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadReceipt = useCallback(() => {
    if (!order) return;
    const addr = order.shipping_address as Record<string, string> | undefined;
    const customerName = addr?.firstName && addr?.lastName
      ? `${addr.firstName} ${addr.lastName}`
      : order.profiles?.name || "—";
    const customerEmail = addr?.email || order.profiles?.email || "—";

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = 210;
    const margin = 20;
    const y0 = 20;
    let y = y0;

    const bold = (text: string, size = 12) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(size);
      doc.text(text, margin, y);
    };
    const normal = (text: string, size = 10) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(size);
      doc.text(text, margin, y);
    };
    const line = () => {
      y += 2;
      doc.setDrawColor(200);
      doc.line(margin, y, pageW - margin, y);
      y += 4;
    };

    bold(SITE_NAME, 20);
    y += 8;
    bold("RECEIPT", 16);
    y += 8;
    line();

    normal(`Order #${order.id.slice(0, 8).toUpperCase()}`, 11);
    y += 5;
    normal(`Date: ${formatDate(order.created_at)}`, 10);
    y += 6;

    bold("Customer", 11);
    y += 5;
    normal(`Name: ${customerName}`, 10);
    y += 4;
    normal(`Email: ${customerEmail}`, 10);
    y += 4;
    if (addr?.phone) {
      normal(`Phone: ${addr.phone}`, 10);
      y += 4;
    }
    y += 2;

    bold("Shipping Address", 11);
    y += 5;
    if (addr) {
      normal(`${addr.firstName || ""} ${addr.lastName || ""}`, 10);
      y += 4;
      normal(addr.address || "", 10);
      y += 4;
      normal(`${addr.city || ""} ${addr.zipCode || ""}`, 10);
      y += 4;
    }
    y += 2;

    bold("Payment", 11);
    y += 5;
    normal(`Method: ${order.payment_method.toUpperCase()}`, 10);
    y += 4;
    normal(`Status: ${order.payment_status.toUpperCase()}`, 10);
    y += 6;
    line();

    // Items table header
    const col1 = margin;
    const col2 = 100;
    const col3 = 140;
    const col4 = 170;
    const rowH = 6;

    bold("Items", 11);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Product", col1, y);
    doc.text("Price", col2, y);
    doc.text("Qty", col3, y);
    doc.text("Subtotal", col4, y);
    y += 4;
    doc.setDrawColor(200);
    doc.line(margin, y, pageW - margin, y);
    y += 3;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    order.order_items?.forEach((item) => {
      const name = item.product_name.length > 40
        ? item.product_name.slice(0, 38) + ".."
        : item.product_name;
      if (y > 270) {
        doc.addPage();
        y = y0;
      }
      doc.text(name, col1, y, { maxWidth: col2 - col1 - 2 });
      doc.text(formatPrice(item.price), col2, y);
      doc.text(String(item.quantity), col3, y);
      doc.text(formatPrice(item.price * item.quantity), col4, y, { align: "right" });
      y += rowH;
    });

    y += 2;
    line();

    // Totals
    const totalX = col2;
    const labelX = totalX;
    const valueX = col4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Subtotal", labelX, y);
    doc.text(formatPrice(order.subtotal), valueX, y, { align: "right" });
    y += 5;
    doc.text("Shipping", labelX, y);
    doc.text(formatPrice(order.shipping_cost), valueX, y, { align: "right" });
    y += 5;
    doc.text("Tax", labelX, y);
    doc.text(formatPrice(order.tax), valueX, y, { align: "right" });
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Total", labelX, y);
    doc.text(formatPrice(order.total), valueX, y, { align: "right" });

    y += 12;
    line();
    y += 4;
    normal(`Order Status: ${order.status.toUpperCase()}`, 9);
    y += 4;
    normal(`Thank you for shopping with ${SITE_NAME}!`, 9);

    const fileName = `receipt-${order.id.slice(0, 8)}.pdf`;
    doc.save(fileName);
  }, [order]);

  const handlePaymentStatusChange = async (newStatus: string) => {
    if (!order || order.payment_status === newStatus) return;
    setUpdating(true);
    try {
      const updated = await updatePaymentStatus(order.id, newStatus);
      setOrder(updated);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-2xl p-6 text-center">{error || "Order not found"}</div>
    );
  }

  const address = order.shipping_address || {};

  return (
    <div>
      <button
        onClick={() => router.push("/admin/orders")}
        className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadReceipt}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Receipt
          </button>
          <StatusBadge status={order.status} />
          <StatusBadge status={order.payment_status} />
        </div>
      </div>

      {/* Status Progression */}
      {order.status !== "cancelled" ? (
        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 mb-6">
          <h2 className="text-sm font-semibold mb-4">Order Progress</h2>
          <div className="flex items-center">
            {statusSteps.map((step, i) => {
              const isCompleted = currentStepIndex >= i;
              const isCurrent = currentStepIndex === i;
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                      isCompleted ? "bg-primary text-white" : "bg-zinc-100 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500",
                      isCurrent && "ring-2 ring-primary/30"
                    )}>
                      {isCompleted && i < currentStepIndex ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={cn(
                      "text-sm font-medium capitalize",
                      isCompleted ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500"
                    )}>
                      {step}
                    </span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-3",
                      isCompleted ? "bg-primary" : "bg-zinc-200 dark:bg-zinc-700"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-red-200 dark:border-red-900/50 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span className="text-sm font-bold text-red-600 dark:text-red-400">!</span>
            </div>
            <span className="text-sm font-medium text-red-600 dark:text-red-400">This order has been cancelled</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Customer Info */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6">
          <h2 className="text-sm font-semibold mb-4">Customer</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-zinc-500 dark:text-zinc-400">Name:</span>{' '}
              {(() => {
                const a = order.shipping_address as Record<string, string> | undefined;
                if (a?.firstName && a?.lastName) return `${a.firstName} ${a.lastName}`;
                return order.profiles?.name || "—";
              })()}
            </p>
            <p>
              <span className="text-zinc-500 dark:text-zinc-400">Email:</span>{' '}
              {(() => {
                const a = order.shipping_address as Record<string, string> | undefined;
                return a?.email || order.profiles?.email || "—";
              })()}
            </p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6">
          <h2 className="text-sm font-semibold mb-4">Shipping Address</h2>
          <div className="space-y-1 text-sm">
            {Object.keys(address).length > 0 ? (
              Object.entries(address).map(([key, val]) => (
                <p key={key}>
                  <span className="text-zinc-500 dark:text-zinc-400 capitalize">{key.replace(/_/g, " ")}:</span> {val}
                </p>
              ))
            ) : (
              <p className="text-zinc-400">No address details</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6">
          <h2 className="text-sm font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Order Status</label>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating || nextStatuses[order.status]?.length === 0}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
              >
                <option value={order.status} disabled>{order.status}</option>
                {nextStatuses[order.status]?.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Payment Status</label>
              <select
                value={order.payment_status}
                onChange={(e) => handlePaymentStatusChange(e.target.value)}
                disabled={updating}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                {paymentStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {updating && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-sm font-semibold">Order Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                <th className="text-left px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Product</th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Price</th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Qty</th>
                <th className="text-right px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items?.map((item) => (
                <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-700/50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={safeImage(item.product_image ? [item.product_image] : undefined)}
                        alt={item.product_name}
                        className="w-12 h-12 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-700"
                      />
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        {(item.selected_size || item.selected_color) && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {item.selected_size && `Size: ${item.selected_size}`}
                            {item.selected_size && item.selected_color && " | "}
                            {item.selected_color && `Color: ${item.selected_color}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">{formatPrice(item.price)}</td>
                  <td className="px-6 py-3">{item.quantity}</td>
                  <td className="px-6 py-3 text-right font-medium">{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
              {(!order.order_items || order.order_items.length === 0) && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-zinc-500 dark:text-zinc-400">No items</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Totals */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 ml-auto w-full max-w-sm">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Shipping</span>
            <span>{formatPrice(order.shipping_cost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Tax</span>
            <span>{formatPrice(order.tax)}</span>
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 flex justify-between font-bold text-base">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
