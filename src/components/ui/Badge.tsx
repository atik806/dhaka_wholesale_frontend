import { cn } from "@/src/lib/utils";

interface BadgeProps {
  variant?: "sale" | "new" | "out-of-stock" | "low-stock";
  children?: string;
  className?: string;
}

const styles: Record<string, string> = {
  sale: "bg-[#BE3D1F] text-white border border-red-950 -rotate-3",
  new: "bg-[#132A3A] text-[#F5A300] border border-[#F5A300]/40 -rotate-2",
  "out-of-stock": "bg-[#1C1A17] text-[#E7DCC4] border border-zinc-700",
  "low-stock": "bg-[#F5A300] text-[#132A3A] border border-[#D88900] -rotate-1",
};

export function Badge({ variant = "new", children, className }: BadgeProps) {
  if (!children) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-[2px] text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider shadow-sm",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
