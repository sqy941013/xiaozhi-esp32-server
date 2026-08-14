import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type AlertVariant = "error" | "info" | "success";

const variants = {
  error: {
    className: "border-destructive/30 bg-destructive/5 text-destructive",
    icon: AlertCircle,
  },
  info: {
    className: "border-primary/25 bg-primary/5 text-foreground",
    icon: Info,
  },
  success: {
    className: "border-emerald-500/30 bg-emerald-500/5 text-emerald-700",
    icon: CheckCircle2,
  },
} as const;

export function Alert({
  children,
  className,
  variant = "info",
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: AlertVariant }) {
  const { className: variantClass, icon: Icon } = variants[variant];
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm leading-5",
        variantClass,
        className,
      )}
      role={variant === "error" ? "alert" : "status"}
      {...props}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
