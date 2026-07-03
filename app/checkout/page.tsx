"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Sparkles, Truck, CreditCard, ClipboardList } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/src/store/useCartStore";
import { formatPrice } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { EmptyState } from "@/src/components/ui/EmptyState";

const steps = [
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "review", label: "Review", icon: ClipboardList },
];

export default function CheckoutPage() {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { items, clearCart } = useCartStore();
  const [shipping, setShipping] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", zipCode: "",
  });
  const [payment, setPayment] = useState({
    cardNumber: "", expiry: "", cvc: "", cardholderName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validatePayment = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!payment.cardNumber.trim()) errs.cardNumber = "Required";
    else if (!/^[\d\s]{13,19}$/.test(payment.cardNumber.trim())) errs.cardNumber = "Invalid card number";
    if (!payment.expiry.trim()) errs.expiry = "Required";
    else if (!/^\d{2}\/\d{2}$/.test(payment.expiry.trim())) errs.expiry = "Use MM/YY";
    if (!payment.cvc.trim()) errs.cvc = "Required";
    else if (!/^\d{3,4}$/.test(payment.cvc.trim())) errs.cvc = "Invalid CVC";
    if (!payment.cardholderName.trim()) errs.cardholderName = "Required";
    return errs;
  }, [payment]);

  const handleNext = useCallback(() => {
    const errs = step === 0 ? validateShipping() : validatePayment();
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep((s) => s + 1);
  }, [step, validateShipping, validatePayment]);

  const handlePlaceOrder = useCallback(() => {
    clearCart();
    setCompleted(true);
  }, [clearCart]);

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
          {step === 1 && (
            <PaymentForm
              values={payment}
              onChange={setPayment}
              errors={errors}
            />
          )}
          {step === 2 && <ReviewOrder />}
        </motion.div>
      </AnimatePresence>

      <div className="max-w-lg mx-auto flex items-center justify-between mt-8">
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
          <Button onClick={handlePlaceOrder}>
            Place Order <Sparkles className="w-4 h-4" />
          </Button>
        )}
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

function PaymentForm({
  values, onChange, errors,
}: {
  values: typeof paymentInitial;
  onChange: (v: typeof paymentInitial) => void;
  errors: Record<string, string>;
}) {
  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...values, [field]: e.target.value });
  const formatCard = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
    onChange({ ...values, cardNumber: formatted });
  };
  const formatExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 2) raw = raw.slice(0, 2) + "/" + raw.slice(2);
    onChange({ ...values, expiry: raw });
  };
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-bold">Payment Details</h2>
      <Input label="Card Number" placeholder="4242 4242 4242 4242" value={values.cardNumber} onChange={formatCard} error={errors.cardNumber} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Expiry Date" placeholder="MM/YY" value={values.expiry} onChange={formatExpiry} error={errors.expiry} />
        <Input label="CVC" placeholder="123" value={values.cvc} onChange={set("cvc")} error={errors.cvc} />
      </div>
      <Input label="Cardholder Name" placeholder="John Doe" value={values.cardholderName} onChange={set("cardholderName")} error={errors.cardholderName} />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        This is a demo — no real payment will be processed.
      </p>
    </div>
  );
}

const paymentInitial = { cardNumber: "", expiry: "", cvc: "", cardholderName: "" };

function ReviewOrder() {
  const { items, totalPrice } = useCartStore();
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-bold">Review Your Order</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3"
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-800 shrink-0">
                          <Image
                            src={item.product.images[0]}
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
              {formatPrice(item.product.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 space-y-1 text-sm">
        <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
          <span>Subtotal</span>
          <span>{formatPrice(totalPrice())}</span>
        </div>
        <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
          <span>Shipping</span>
          <span>{totalPrice() >= 50 ? "Free" : "$5.00"}</span>
        </div>
        <div className="flex justify-between font-semibold text-base pt-1 border-t border-zinc-200 dark:border-zinc-700">
          <span>Total</span>
          <span>
            {formatPrice(
              totalPrice() + (totalPrice() >= 50 ? 0 : 5) + totalPrice() * 0.08
            )}
          </span>
        </div>
      </div>
    </div>
  );
}


