import type { ReactNode } from "react";

const variantStyles: Record<string, string> = {
  primary: "bg-primary/15 text-primary",
  accent: "bg-accent/15 text-accent",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  muted: "bg-muted/15 text-muted",
};

export interface BadgeProps {
  variant?: "primary" | "accent" | "success" | "warning" | "danger" | "muted";
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = "muted", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
