import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/src/lib/constants";

type LogoVariant = "header" | "footer" | "auth" | "mark" | "mobile";

const sizeMap: Record<
  LogoVariant,
  { width: number; height: number; className: string; imageClass: string }
> = {
  header: {
    width: 48,
    height: 48,
    className: "h-10 w-10 md:h-12 md:w-12",
    imageClass: "object-contain",
  },
  mobile: {
    width: 44,
    height: 44,
    className: "h-11 w-11",
    imageClass: "object-contain",
  },
  footer: {
    width: 80,
    height: 80,
    className: "h-20 w-20",
    imageClass: "object-contain",
  },
  auth: {
    width: 96,
    height: 96,
    className: "h-24 w-24",
    imageClass: "object-contain",
  },
  mark: {
    width: 36,
    height: 36,
    className: "h-9 w-9",
    imageClass: "object-contain",
  },
};

interface SiteLogoProps {
  variant?: LogoVariant;
  href?: string | null;
  priority?: boolean;
  className?: string;
  showWordmark?: boolean;
}

export function SiteLogo({
  variant = "header",
  href = "/",
  priority = false,
  className = "",
  showWordmark = false,
}: SiteLogoProps) {
  const size = sizeMap[variant];
  const isFooter = variant === "footer";

  const mark = (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 ${size.className} ${className}`}
    >
      <Image
        src="/logo.png"
        alt={SITE_NAME}
        width={size.width}
        height={size.height}
        priority={priority}
        className={size.imageClass}
        sizes={`${size.width}px`}
      />
    </span>
  );

  const content = showWordmark ? (
    <span className="inline-flex items-center gap-2.5 group">
      {mark}
      <span
        className={`leading-tight tracking-tight ${
          isFooter
            ? "text-white"
            : "text-zinc-900 dark:text-zinc-100"
        }`}
      >
        <span className="block font-bold text-sm md:text-[15px]">
          DHAKA
        </span>
        <span
          className={`block text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.18em] ${
            isFooter ? "text-red-400" : "text-danger"
          }`}
        >
          Wholesale
        </span>
      </span>
    </span>
  ) : (
    mark
  );

  if (href === null) return content;

  return (
    <Link
      href={href}
      className="inline-flex items-center transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 rounded-xl"
      aria-label={SITE_NAME}
    >
      {content}
    </Link>
  );
}
