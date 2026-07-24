"use client";

import { motion } from "framer-motion";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Card } from "@/src/components/ui/Card";

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

const measuringTips = [
  { term: "Chest", tip: "Measure around the fullest part of your chest, keeping the tape parallel to the floor." },
  { term: "Waist", tip: "Measure around your natural waistline, keeping the tape snug but not tight." },
  { term: "Hip", tip: "Measure around the fullest part of your hips, about 8 inches below your waist." },
  { term: "Inseam", tip: "Measure from the top of your inner thigh to the bottom of your ankle." },
];

export default function SizeGuidePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-canvas"
    >
      <header className="bg-surface border-b border-line">
        <div className="container py-10 md:py-14">
          <Breadcrumbs items={[{ label: "Size Guide" }]} />
          <p className="label-caps text-accent-text mb-2">Fit &amp; sizing</p>
          <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold mb-3">
            Size Guide
          </h1>
          <p className="text-muted text-base leading-relaxed max-w-[65ch]">
            Find your perfect fit with our detailed size charts. Measurements are in
            inches unless noted.
          </p>
        </div>
      </header>

      <div className="container py-12">
        <div className="max-w-4xl mx-auto space-y-10">
          {sizeTables.map((table, i) => (
            <motion.section
              key={table.category}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <h2 className="text-xl font-bold mb-4">{table.category}</h2>
              <div className="overflow-x-auto border border-line rounded-lg">
                <table className="w-full text-sm border-collapse">
                  <caption className="sr-only">
                    {table.category} size chart
                  </caption>
                  <thead>
                    <tr className="bg-surface-2">
                      {table.headers.map((header) => (
                        <th
                          key={header}
                          scope="col"
                          className="text-left px-4 py-3 label-caps text-muted whitespace-nowrap border-b border-line"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row) => (
                      <tr key={row[0]} className="bg-surface even:bg-surface-2">
                        {row.map((val, k) =>
                          k === 0 ? (
                            <th
                              key={k}
                              scope="row"
                              className="text-left px-4 py-3 font-semibold text-fg whitespace-nowrap border-b border-line"
                            >
                              {val || "-"}
                            </th>
                          ) : (
                            <td
                              key={k}
                              className="px-4 py-3 tabular text-muted whitespace-nowrap border-b border-line"
                            >
                              {val || "-"}
                            </td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.section>
          ))}

          <Card padded>
            <h2 className="text-xl font-bold mb-4">How to Measure</h2>
            <dl className="space-y-3 max-w-[68ch]">
              {measuringTips.map(({ term, tip }) => (
                <div key={term} className="text-[15px] leading-[1.7]">
                  <dt className="inline font-semibold text-fg">{term}: </dt>
                  <dd className="inline text-muted">{tip}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
