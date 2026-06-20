"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Sparkles, Truck, CreditCard, ClipboardList } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/src/store/useCartStore";
import { formatPrice } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/Button";
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
          {step === 0 && <ShippingForm />}
          {step === 1 && <PaymentForm />}
          {step === 2 && <ReviewOrder />}
        </motion.div>
      </AnimatePresence>

      <div className="max-w-lg mx-auto flex items-center justify-between mt-8">
        {step > 0 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
        ) : (
          <div />
        )}
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)}>
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={() => {
              clearCart();
              setCompleted(true);
            }}
          >
            Place Order <Sparkles className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function ShippingForm() {
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-bold">Shipping Address</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="First Name" placeholder="John" />
        <Input label="Last Name" placeholder="Doe" />
      </div>
      <Input label="Email" type="email" placeholder="john@example.com" />
      <Input label="Phone" type="tel" placeholder="+1 (555) 000-0000" />
      <Input label="Address" placeholder="123 Main Street" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="City" placeholder="New York" />
        <Input label="ZIP Code" placeholder="10001" />
      </div>
    </div>
  );
}

function PaymentForm() {
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-bold">Payment Details</h2>
      <Input label="Card Number" placeholder="4242 4242 4242 4242" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Expiry Date" placeholder="MM/YY" />
        <Input label="CVC" placeholder="123" />
      </div>
      <Input label="Cardholder Name" placeholder="John Doe" />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        This is a demo — no real payment will be processed.
      </p>
    </div>
  );
}

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

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-white dark:bg-zinc-800"
      />
    </div>
  );
}
