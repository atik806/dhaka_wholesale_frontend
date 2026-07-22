"use client";

import { motion } from "framer-motion";
import { Ruler, BookOpen } from "lucide-react";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";

const sizeTables = [
  {
    category: "Clothing",
    headers: ["Size", "Chest", "Waist", "Hip"],
    rows: [
      ["XS", "31-33", "26-28", "33-35"],
      ["S", "34-36", "29-31", "36-38"],
      ["M", "37-39", "32-34", "39-41"],
      ["L", "40-42", "35-37", "42-44"],
      ["XL", "43-45", "38-40", "45-47"],
      ["XXL", "46-48", "41-43", "48-50"],
    ],
  },
  {
    category: "Shoes",
    headers: ["Size", "UK", "EU", "Foot Length"],
    rows: [
      ["US 6", "5.5", "39", "9.4\""],
      ["US 7", "6.5", "40", "9.8\""],
      ["US 8", "7.5", "41", "10.2\""],
      ["US 9", "8.5", "42", "10.6\""],
      ["US 10", "9.5", "43", "11\""],
      ["US 11", "10.5", "44", "11.4\""],
    ],
  },
  {
    category: "Accessories (One Size)",
    headers: ["Size", "Fit", "Adjustable"],
    rows: [
      ["Standard", "Fits most", "Yes"],
      ["Extended", "Larger fit", "Yes"],
    ],
  },
];

export default function SizeGuidePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#FBF6EC] dark:bg-[#0D1F2C]"
    >
      {/* Page Hero Header */}
      <div className="bg-[#132A3A] text-white border-b-2 border-[#E7DCC4] dark:border-[#2a3d4d] py-12 md:py-16">
        <div className="container">
          <Breadcrumbs items={[{ label: "Size Guide" }]} />
          <div className="max-w-2xl mt-4">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F5A300] bg-[#0D1F2C] px-3 py-1 border border-[#F5A300]/40 rounded-[2px] mb-3">
              <Ruler className="w-3.5 h-3.5" /> SIZE GUIDE
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-extrabold mb-3">
              Size Guide
            </h1>
            <p className="text-[#E7DCC4]/90 text-sm sm:text-base font-sans">
              Find your perfect fit with our detailed size charts. Measurements are in inches unless noted.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-10">
            {sizeTables.map((table, i) => (
              <motion.div
                key={table.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
              >
                <h2 className="font-serif font-bold text-lg text-[#132A3A] dark:text-[#E7DCC4] mb-4">{table.category}</h2>
                <div className="overflow-x-auto rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#132A3A]">
                        {table.headers.map((header) => (
                          <th
                            key={header}
                            className="text-left px-4 py-3 font-mono text-[11px] font-bold text-[#F5A300] uppercase tracking-wider whitespace-nowrap"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, j) => (
                        <tr
                          key={j}
                          className={`border-t border-[#E7DCC4] dark:border-[#2a3d4d] ${j % 2 === 0 ? "bg-white dark:bg-[#132A3A]" : "bg-[#FBF6EC] dark:bg-[#0D1F2C]"}`}
                        >
                          {row.map((val, k) => (
                            <td
                              key={k}
                              className="px-4 py-3 whitespace-nowrap text-[#132A3A] dark:text-[#E7DCC4] font-mono text-xs"
                            >
                              {val || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 bg-white dark:bg-[#132A3A] rounded-[3px] border-2 border-[#E7DCC4] dark:border-[#2a3d4d] p-6 sm:p-8 shadow-sm">
            <h2 className="font-serif font-bold text-lg text-[#132A3A] dark:text-[#E7DCC4] mb-3">How to Measure</h2>
            <ul className="space-y-2 text-sm text-[#1C1A17]/70 dark:text-[#a0b4c4] font-sans">
              <li><strong className="text-[#132A3A] dark:text-[#E7DCC4]">Chest:</strong> Measure around the fullest part of your chest, keeping the tape parallel to the floor.</li>
              <li><strong className="text-[#132A3A] dark:text-[#E7DCC4]">Waist:</strong> Measure around your natural waistline, keeping the tape snug but not tight.</li>
              <li><strong className="text-[#132A3A] dark:text-[#E7DCC4]">Hip:</strong> Measure around the fullest part of your hips, about 8 inches below your waist.</li>
              <li><strong className="text-[#132A3A] dark:text-[#E7DCC4]">Inseam:</strong> Measure from the top of your inner thigh to the bottom of your ankle.</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
