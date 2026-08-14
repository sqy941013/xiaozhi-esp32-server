import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <input
      className={cn(
        "size-4 cursor-pointer rounded border-input accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      type="checkbox"
      {...props}
    />
  );
}

export { Checkbox };
