import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/src/lib/constants";

type LogoVariant = "header" | "footer" | "auth" | "mark" | "mobile";

interface SiteLogoProps {
  variant?: LogoVariant;
  href?: string | null;
  priority?: boolean;
  className?: string;
  showWordmark?: boolean;
}

const markSize: Record<LogoVariant, string> = {
  header: "w-10 h-10 md:w-11 md:h-11 rounded-md",
  mobile: "w-10 h-10 md:w-11 md:h-11 rounded-md",
  footer: "w-12 h-12 rounded-lg",
  auth: "w-16 h-16 rounded-xl",
  mark: "w-10 h-10 md:w-11 md:h-11 rounded-md",
};

export function SiteLogo({
  variant = "header",
  href = "/",
  priority = false,
  className = "",
  showWordmark = true,
}: SiteLogoProps) {
  // Header, mobile drawer header and footer all sit on the navy brand bar.
  const onDark = variant !== "auth";

  const mark = (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden ${
        markSize[variant]
      } ${
        onDark
          ? "bg-brand-deep ring-1 ring-brand-fg/20"
          : "bg-surface-2 ring-1 ring-line-strong shadow-xs"
      } ${className}`}
    >
      <Image
        src="/logo.png"
        alt={SITE_NAME}
        fill
        priority={priority}
        className="object-cover"
      />
    </span>
  );

  // Header: hide wordmark below sm so icons/search never clip on narrow phones
  const wordmarkHidden = variant === "header" ? "hidden sm:block" : "";

  const content = showWordmark ? (
    <span className="inline-flex items-center gap-2 sm:gap-2.5">
      {mark}
      <span className={`leading-none ${wordmarkHidden}`}>
        <span
          className={`block text-sm md:text-base lg:text-lg font-extrabold tracking-tight ${
            onDark ? "text-brand-fg" : "text-fg"
          }`}
        >
          DHAKA
        </span>
        <span className="block label-caps text-accent mt-1">WHOLESALE</span>
      </span>
    </span>
  ) : (
    mark
  );

  if (href === null) return content;

  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      aria-label={SITE_NAME}
    >
      {content}
    </Link>
  );
}
