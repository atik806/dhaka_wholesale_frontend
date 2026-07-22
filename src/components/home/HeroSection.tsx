"use client";

import { motion } from "framer-motion";
import { Truck, ShieldCheck, RefreshCw } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#132A3A] border-b-2 border-[#E7DCC4] py-12 md:py-20 lg:py-24 text-white">
      {/* Background ledger grid lines pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #E7DCC4 1px, transparent 1px), linear-gradient(to bottom, #E7DCC4 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline + Highlighted Word + 2 Rotated CTA Buttons */}
          <div className="lg:col-span-7 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-[#0D1F2C] border border-[#F5A300] text-[#F5A300] font-mono text-xs px-3.5 py-1.5 font-bold -rotate-1 rounded-[3px] shadow-sm uppercase tracking-wider mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[#F5A300] animate-pulse" />
              SHOP DHAKADROP #2026
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-white mb-6"
            >
              Direct Market Stock.
              <br />
              Authentic{" "}
              <span className="text-[#F5A300] bg-[#0D1F2C] px-3 py-0.5 border border-[#F5A300]/50 inline-block -rotate-1 shadow-md">
STORE
              </span>{" "}
              Rates.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-[#E7DCC4] max-w-xl mb-8 leading-relaxed font-sans"
            >
              Bangladesh&apos;s trusted online store. Shop quality products with cash on delivery nationwide and fast shipping.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              {/* Secondary CTA Button: Brick Red, 2deg rotation */}
              <Link
                href="/shop?sort=discount"
                className="inline-flex items-center gap-2 bg-[#BE3D1F] hover:bg-[#9E3017] text-white font-extrabold text-sm px-6 py-3.5 rounded-[3px] shadow-lg border border-red-950 transition-all hover:scale-[1.02] active:scale-95 rotate-2 hover:rotate-0"
              >
                SHOP NOW
              </Link>
            </motion.div>

            {/* Quick stats row */}
            <div className="mt-10 pt-6 border-t border-[#E7DCC4]/20 grid grid-cols-3 gap-4 font-mono text-xs">
              <div>
                <span className="block text-[#F5A300] font-bold text-lg">5,000+</span>
                <span className="text-[#E7DCC4]/80 text-[11px]">ACTIVE CUSTOMERS</span>
              </div>
              <div>
                <span className="block text-[#F5A300] font-bold text-lg">100%</span>
                <span className="text-[#E7DCC4]/80 text-[11px]">COD VERIFIED</span>
              </div>
              <div>
                <span className="block text-[#F5A300] font-bold text-lg">24-48H</span>
                <span className="text-[#E7DCC4]/80 text-[11px]">EXPRESS DELIVERY</span>
              </div>
            </div>
          </div>

          {/* Right Column: Stack of Rotated "Hanging Price Tags" on string with stitched hole detail */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            {/* Horizontal String Line anchor at top */}
            <div className="w-full h-1 bg-[#E7DCC4]/40 border-b border-[#E7DCC4] mb-8 relative flex justify-around">
              <div className="w-2 h-2 rounded-full bg-[#F5A300] absolute -top-0.5 left-1/4" />
              <div className="w-2 h-2 rounded-full bg-[#F5A300] absolute -top-0.5 left-1/2" />
              <div className="w-2 h-2 rounded-full bg-[#F5A300] absolute -top-0.5 left-3/4" />
            </div>

            <div className="space-y-6 relative">
              {/* Tag 1: Rotated -5deg */}
              <motion.div
                initial={{ opacity: 0, y: 20, rotate: -8 }}
                animate={{ opacity: 1, y: 0, rotate: -5 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative bg-[#FBF6EC] text-[#1C1A17] p-5 rounded-[3px] border-2 border-[#E7DCC4] shadow-xl hover:rotate-0 transition-transform duration-300"
              >
                {/* String coming down from top line */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 border-l-2 border-dashed border-[#E7DCC4]" />
                {/* Stitched Hole detail */}
                <div className="w-5 h-5 rounded-full bg-[#0D1F2C] border-2 border-[#E7DCC4] mx-auto mb-3 shadow-inner flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F5A300]" />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[3px] bg-[#132A3A] text-[#F5A300] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#BE3D1F]">TRUST TAG #01</span>
                      <h3 className="font-serif font-bold text-base text-[#132A3A]">Guaranteed Cash On Delivery</h3>
                      <p className="text-xs text-[#1C1A17]/70 font-sans">Inspect goods at your door before payment.</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#1F6F50] bg-[#1F6F50]/10 px-2 py-1 border border-[#1F6F50]/30 rounded-[2px] shrink-0">
                    VERIFIED
                  </span>
                </div>
              </motion.div>

              {/* Tag 2: Rotated 4deg */}
              <motion.div
                initial={{ opacity: 0, y: 20, rotate: 6 }}
                animate={{ opacity: 1, y: 0, rotate: 4 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="relative bg-[#FBF6EC] text-[#1C1A17] p-5 rounded-[3px] border-2 border-[#E7DCC4] shadow-xl hover:rotate-0 transition-transform duration-300 ml-4 sm:ml-8"
              >
                {/* Stitched Hole detail */}
                <div className="w-5 h-5 rounded-full bg-[#0D1F2C] border-2 border-[#E7DCC4] mx-auto mb-3 shadow-inner flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#BE3D1F]" />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[3px] bg-[#BE3D1F] text-white flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1F6F50]">TRUST TAG #02</span>
                      <h3 className="font-serif font-bold text-base text-[#132A3A]">24-48 Hour Shipping</h3>
                      <p className="text-xs text-[#1C1A17]/70 font-sans">Fast dispatch across all 64 districts.</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#132A3A] bg-[#F5A300] px-2 py-1 border border-[#D88900] rounded-[2px] shrink-0">
                    EXPRESS
                  </span>
                </div>
              </motion.div>

              {/* Tag 3: Rotated -3deg */}
              <motion.div
                initial={{ opacity: 0, y: 20, rotate: -4 }}
                animate={{ opacity: 1, y: 0, rotate: -3 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="relative bg-[#FBF6EC] text-[#1C1A17] p-5 rounded-[3px] border-2 border-[#E7DCC4] shadow-xl hover:rotate-0 transition-transform duration-300"
              >
                {/* Stitched Hole detail */}
                <div className="w-5 h-5 rounded-full bg-[#0D1F2C] border-2 border-[#E7DCC4] mx-auto mb-3 shadow-inner flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F5A300]" />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[3px] bg-[#1F6F50] text-white flex items-center justify-center shrink-0">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#132A3A]">TRUST TAG #03</span>
                      <h3 className="font-serif font-bold text-base text-[#132A3A]">7-Day Easy Return Guarantee</h3>
                      <p className="text-xs text-[#1C1A17]/70 font-sans">Direct exchange for defective items.</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#BE3D1F] bg-[#BE3D1F]/10 px-2 py-1 border border-[#BE3D1F]/30 rounded-[2px] shrink-0">
                    GUARANTEED
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
