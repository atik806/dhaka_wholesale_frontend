"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Sparkles, Truck, ClipboardList, DollarSign, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/src/store/useCartStore";
import { useIsLoggedIn, useAuthHydrated, useAuthStore } from "@/src/store/useAuthStore";
import { formatPrice as fp, safeImage } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { API_BASE } from "@/src/lib/constants";

const steps = [
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "payment", label: "Payment", icon: DollarSign },
  { id: "review", label: "Review", icon: ClipboardList },
];

export default function CheckoutPage() {
  const router = useRouter();
  const authHydrated = useAuthHydrated();
  const isLoggedIn = useIsLoggedIn();
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const [shipping, setShipping] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", zipCode: "",
  });
  const [payment, setPayment] = useState({ method: "cod" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (authHydrated && !isLoggedIn) {
      router.replace("/login?redirect=/checkout");
    }
  }, [authHydrated, isLoggedIn, router]);

  useEffect(() => {
    if (user?.shipping_address) {
      const addr = user.shipping_address;
      setShipping({
        firstName: addr.firstName || "",
        lastName: addr.lastName || "",
        email: addr.email || user.email || "",
        phone: addr.phone || "",
        address: addr.address || "",
        city: addr.city || "",
        zipCode: addr.zipCode || "",
      });
    } else if (user) {
      setShipping((prev) => ({ ...prev, email: user.email || "" }));
    }
  }, [user]);

  const validateShipping = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!shipping.firstName.trim()) errs.firstName = "Required";
    if (!shipping.lastName.trim()) errs.lastName = "Required";
    if (!shipping.email.trim()) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) errs.email = "Invalid email";
    if (!shipping.phone.trim()) errs.phone = "Required";
    if (!shipping.address.trim()) errs.address = "Required";
    if (!shipping.city.trim()) errs.city = "Required";
    if (!shipping.zipCode.trim()) errs.zipCode = "Required";
    return errs;
  }, [shipping]);

  const validatePayment = useCallback(() => ({} as Record<string, string>), []);

  const handleNext = useCallback(async () => {
    const errs = step === 0 ? validateShipping() : validatePayment();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      if (step === 0 && session?.access_token) {
        fetch(`${API_BASE}/auth/profile`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ shipping_address: shipping }),
        }).catch(() => {});
      }
      setStep((s) => s + 1);
    }
  }, [step, validateShipping, validatePayment, session, shipping]);

  const handlePlaceOrder = useCallback(async () => {
    setPlacing(true);
    setPlaceError("");
    try {
      const body = {
        shipping_address: shipping,
        payment_method: "cod",
        items: items.map((i) => ({
          product_id: i.product.id,
          product_name: i.product.name,
          product_image: i.product.images?.[0] || null,
          price: i.product.price,
          quantity: i.quantity,
          selected_size: i.selectedSize || null,
          selected_color: i.selectedColor || null,
        })),
      };
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }
      const res = await fetch(`${API_BASE}/orders/checkout`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to place order");
      }
      clearCart();
      setCompleted(true);
    } catch (e) {
      setPlaceError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPlacing(false);
    }
  }, [shipping, items, clearCart, session]);

  if (!authHydrated || !isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0 && !completed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container"
      >
        <Breadcrumbs items={[{ label: "Checkout" }]} />
        <EmptyState
          title="Your cart is empty"
          description="Add some items before checking out."
          actionLabel="Start Shopping"
          actionHref="/shop"
        />
      </motion.div>
    );
  }

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container py-20"
      >
        <Breadcrumbs items={[{ label: "Order Complete" }]} />
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-serif text-3xl font-bold mb-3">
              Order Confirmed!
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
              Thank you for your purchase. You&apos;ll receive a confirmation
              email shortly.
            </p>
            <Link href="/shop">
              <Button>Continue Shopping</Button>
            </Link>
          </motion.div>

          <div className="mt-12 flex justify-center gap-2">
            {[1.5, 2.3, 1.8, 3.0, 2.7, 1.2, 2.5, 3.5, 1.0, 2.1, 2.8, 1.6].map((dur, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, opacity: 0, rotate: 0 }}
                animate={{
                  y: [0, 300],
                  opacity: [1, 0],
                  rotate: 360,
                }}
                transition={{
                  duration: dur,
                  delay: i * 0.15,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                className="fixed w-2 h-2 rounded-full"
                style={{
                  left: `${5 + i * 8}%`,
                  backgroundColor: [
                    "#0f766e",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                    "#ec4899",
                  ][i % 5],
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container py-8"
    >
      <Breadcrumbs items={[{ label: "Checkout" }]} />

      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-10">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isDone = i < step;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : isDone
                    ? "bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                    : "bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-8 h-[2px] ${
                    i < step ? "bg-emerald-400" : "bg-zinc-200 dark:bg-zinc-700"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="max-w-lg mx-auto"
        >
          {step === 0 && (
            <ShippingForm
              values={shipping}
              onChange={setShipping}
              errors={errors}
            />
          )}
          {step === 1 && <PaymentForm />}
          {step === 2 && <ReviewOrder />}
        </motion.div>
      </AnimatePresence>

      <div className="max-w-lg mx-auto mt-8 space-y-3">
        {placeError && (
          <p className="text-sm text-red-500 text-center">{placeError}</p>
        )}
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <Button variant="outline" onClick={() => { setErrors({}); setStep(step - 1); }}>
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          ) : (
            <div />
          )}
          {step < steps.length - 1 ? (
            <Button onClick={() => handleNext()}>
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handlePlaceOrder} disabled={placing}>
              {placing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Placing...</>
              ) : (
                <>Place Order <Sparkles className="w-4 h-4" /></>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ShippingForm({
  values, onChange, errors,
}: {
  values: typeof initialState;
  onChange: (v: typeof initialState) => void;
  errors: Record<string, string>;
}) {
  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...values, [field]: e.target.value });
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-bold">Shipping Address</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="First Name" placeholder="John" value={values.firstName} onChange={set("firstName")} error={errors.firstName} />
        <Input label="Last Name" placeholder="Doe" value={values.lastName} onChange={set("lastName")} error={errors.lastName} />
      </div>
      <Input label="Email" type="email" placeholder="john@example.com" value={values.email} onChange={set("email")} error={errors.email} />
      <Input label="Phone" type="tel" placeholder="+1 (555) 000-0000" value={values.phone} onChange={set("phone")} error={errors.phone} />
      <Input label="Address" placeholder="123 Main Street" value={values.address} onChange={set("address")} error={errors.address} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="City" placeholder="New York" value={values.city} onChange={set("city")} error={errors.city} />
        <Input label="ZIP Code" placeholder="10001" value={values.zipCode} onChange={set("zipCode")} error={errors.zipCode} />
      </div>
    </div>
  );
}

const initialState = { firstName: "", lastName: "", email: "", phone: "", address: "", city: "", zipCode: "" };

function PaymentForm() {
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-bold">Payment Method</h2>
      <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">Cash on Delivery</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Pay when you receive your order</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewOrder() {
  const items = useCartStore((s) => s.items);
  const computedTotal = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + (item.product.price || 0) * item.quantity,
      0
    );
    const shipping = subtotal >= 50 ? 0 : 5;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  }, [items]);
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-bold">Review Your Order</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
            className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3"
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-800 shrink-0 relative">
                            <Image
                              src={safeImage(item.product.images)}
                              alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">
                {item.product.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold">
              {fp(item.product.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 space-y-1 text-sm">
        <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
          <span>Subtotal</span>
          <span>{fp(computedTotal.subtotal)}</span>
        </div>
        <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
          <span>Shipping</span>
          <span>{computedTotal.shipping === 0 ? "Free" : fp(computedTotal.shipping)}</span>
        </div>
        <div className="flex justify-between font-semibold text-base pt-1 border-t border-zinc-200 dark:border-zinc-700">
          <span>Total</span>
          <span>{fp(computedTotal.total)}</span>
        </div>
      </div>
    </div>
  );
}


