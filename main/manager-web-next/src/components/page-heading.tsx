import type { ReactNode } from "react";

interface PageHeadingProps {
  actions?: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
}

export function PageHeading({
  actions,
  description,
  eyebrow,
  title,
}: PageHeadingProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-3xl space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
