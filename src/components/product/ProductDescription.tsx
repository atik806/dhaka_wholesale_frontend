import { Fragment, type ReactNode } from "react";
import { Check, Info, ShieldCheck } from "lucide-react";
import { cn } from "@/src/lib/utils";

/**
 * Turns the plain-text product description admins type into structured
 * content: section headings, bullet lists, a specifications table and
 * highlighted notes. Admins keep writing plain text in the usual shape:
 *
 *   Features:
 *   Hybrid ANC up to 56dB
 *   Specifications:
 *   Battery Life: Up to 40 hours
 *   7-days replacement warranty
 *
 * Lines may start with "•", "-", "*" or an emoji; `**text**` renders bold.
 */

type Block =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "specs"; rows: [string, string][] }
  | { kind: "note"; text: string; tone: "warranty" | "info" };

const HEADING = /^(key\s+)?(features?|specifications?|specs|package\s+includes?|in\s+the\s+box|what'?s\s+in\s+the\s+box|highlights?|details)\s*:?\s*$/i;
// Sections whose "Label: text" lines are explanations, not spec rows.
const PROSE_SECTION = /features?|highlights?/i;
// Bullet markers, including emoji, at the start of a line.
const BULLET = /^(?:[•\-*–·✓✔►▪]|\p{Extended_Pictographic}️?)\s*/u;
const SPEC = /^([^:]{2,32}?)\s*:\s*(.+)$/;
const WARRANTY = /warranty|replacement/i;
const NOTE = /^(note|price)\s*:/i;
// SEO lines copied from other shops add nothing for the customer.
const NOISE = /price in bangladesh|dropshop\.com\.bd/i;

function clean(line: string): string {
  return line
    .replace(BULLET, "")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .trim();
}

const words = (text: string) => new Set(text.toLowerCase().match(/[a-z0-9]+/g) ?? []);

/** A title line: mostly the product name's words, or a short line right before a heading. */
function isTitleLine(line: string, next: string | undefined, productName: string): boolean {
  if (line.includes(":") || /[.!?]$/.test(line) || line.length > 80) return false;
  const name = words(productName);
  const own = [...words(line)];
  const shared = own.filter((w) => name.has(w)).length;
  return (own.length > 0 && shared / own.length >= 0.6) || Boolean(next && HEADING.test(next));
}

function parse(description: string, productName: string): Block[] {
  const lines = description
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !NOISE.test(l));

  // A first line that restates the product name duplicates the page title.
  if (lines[0] && isTitleLine(lines[0], lines[1], productName)) lines.shift();

  const blocks: Block[] = [];
  let section: string | null = null;
  const push = (block: Block) => {
    const last = blocks[blocks.length - 1];
    if (block.kind === "list" && last?.kind === "list") last.items.push(...block.items);
    else if (block.kind === "specs" && last?.kind === "specs") last.rows.push(...block.rows);
    else blocks.push(block);
  };

  for (const raw of lines) {
    if (HEADING.test(raw)) {
      section = raw.replace(/\s*:\s*$/, "");
      blocks.push({ kind: "heading", text: section });
      continue;
    }
    const line = clean(raw);
    if (!line) continue;

    if (NOTE.test(line)) {
      push({ kind: "note", text: line, tone: "info" });
      continue;
    }

    const spec = SPEC.exec(line);
    const proseSection = Boolean(section && PROSE_SECTION.test(section));
    // In a features section "Label: explanation" is a bullet with a bold label.
    if (spec && proseSection) {
      push({ kind: "list", items: [line] });
      continue;
    }
    // "Label: value" is a spec row, except in a features section or when
    // the value is a sentence (e.g. "Precision Trimming: Equipped with ...").
    if (
      spec &&
      spec[2].length <= 80 &&
      !/[.!?]$/.test(spec[2])
    ) {
      push({ kind: "specs", rows: [[spec[1].trim(), spec[2].trim()]] });
      continue;
    }

    if (WARRANTY.test(line) && line.length < 90) {
      push({ kind: "note", text: line, tone: "warranty" });
      continue;
    }

    const bulleted = BULLET.test(raw);
    const isSentence = line.length > 110 || (/[.!?]["”]?$/.test(line) && line.split(" ").length > 14);
    if (bulleted || (section && !isSentence) || (!isSentence && line.length <= 80)) {
      push({ kind: "list", items: [line] });
      continue;
    }
    push({ kind: "paragraph", text: line });
  }

  // A heading with nothing after it adds noise.
  return blocks.filter((b, i) => b.kind !== "heading" || (blocks[i + 1] && blocks[i + 1].kind !== "heading"));
}

/** False when the description only restates the product name. */
export function hasProductDetails(description: string | undefined, productName: string): boolean {
  return Boolean(description) && parse(description!, productName).length > 0;
}

/** Renders `**bold**` spans; everything else stays plain text. */
function inline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-fg">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** Bolds the lead-in of a list item written as "Label: explanation". */
function listItem(text: string): ReactNode {
  const m = /^([^:]{2,40}):\s+(.+)$/.exec(text);
  if (!m) return inline(text);
  return (
    <>
      <strong className="font-semibold text-fg">{m[1]}:</strong> {inline(m[2])}
    </>
  );
}

export function ProductDescription({ description, productName }: { description: string; productName: string }) {
  const blocks = parse(description, productName);
  if (blocks.length === 0) return null;

  return (
    <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "heading":
            return (
              <h3 key={i} className="label-caps pt-2 text-accent-hover first:pt-0">
                {block.text}
              </h3>
            );
          case "paragraph":
            return (
              <p key={i} className="text-[15px] leading-relaxed text-fg/85">
                {inline(block.text)}
              </p>
            );
          case "list":
            return (
              <ul key={i} className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                {block.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-fg/85">
                    <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-hover">
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span>{listItem(item)}</span>
                  </li>
                ))}
              </ul>
            );
          case "specs":
            return (
              <dl key={i} className="overflow-hidden rounded-lg border border-line">
                {block.rows.map(([label, value], j) => (
                  <div
                    key={j}
                    className={cn(
                      "grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 px-3.5 py-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]",
                      j % 2 === 0 ? "bg-surface-2" : "bg-surface",
                    )}
                  >
                    <dt className="font-semibold text-fg">{label}</dt>
                    <dd className="text-fg/85">{inline(value)}</dd>
                  </div>
                ))}
              </dl>
            );
          case "note": {
            const Icon = block.tone === "warranty" ? ShieldCheck : Info;
            return (
              <p
                key={i}
                className={cn(
                  "flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 font-medium",
                  block.tone === "warranty"
                    ? "border-success/25 bg-success-soft text-success"
                    : "border-accent/30 bg-accent-soft text-fg",
                )}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{inline(block.text)}</span>
              </p>
            );
          }
        }
      })}
    </div>
  );
}
