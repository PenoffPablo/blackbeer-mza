import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]",
  primary:
    "bg-[var(--color-primary-bg)] text-[var(--color-primary)]",
  success:
    "bg-[var(--color-success-bg)] text-[var(--color-success)]",
  warning:
    "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
  danger:
    "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
  info:
    "bg-[var(--color-info-bg)] text-[var(--color-info)]",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-full)] text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
