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

export function SiteLogo({
  variant = "header",
  href = "/",
  priority = false,
  className = "",
  showWordmark = true,
}: SiteLogoProps) {
  const isFooter = variant === "footer";

  const mark = (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full bg-[#132A3A] border-2 border-[#F5A300] shadow-md -rotate-6 transition-transform duration-300 group-hover:rotate-0 ${
        variant === "footer"
          ? "w-14 h-14"
          : variant === "auth"
          ? "w-16 h-16"
          : "w-10 h-10 md:w-11 md:h-11"
      } ${className}`}
    >
      <span className="relative w-full h-full rounded-full bg-[#0D1F2C] border border-[#E7DCC4]/30 overflow-hidden">
        <Image
          src="/logo.png"
          alt={SITE_NAME}
          fill
          priority={priority}
          className="object-cover"
        />
      </span>
      {/* Decorative stamp dot */}
      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#BE3D1F] border border-[#F5A300]" />
    </span>
  );

  // Header: hide wordmark below sm so icons/search never clip on narrow phones
  const wordmarkHidden = variant === "header" ? "hidden sm:block" : "";

  const content = showWordmark ? (
    <span className="inline-flex items-center gap-2 sm:gap-2.5 group">
      {mark}
      <span className={`leading-none tracking-tight ${wordmarkHidden}`}>
        <span className="block font-serif font-extrabold text-sm md:text-base lg:text-lg text-white tracking-tight">
          DHAKA
        </span>
        <span className="block font-mono text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] text-[#F5A300] mt-0.5">
          WHOLESALE
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
      className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A300] focus-visible:ring-offset-2 rounded-[3px]"
      aria-label={SITE_NAME}
    >
      {content}
    </Link>
  );
}
