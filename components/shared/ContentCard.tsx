import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ContentCardProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLElement>;

export function ContentCard({ children, className, ...props }: ContentCardProps) {
  return (
    <section
      className={cn(
        "rounded-[4px] border border-stone-200 bg-white/72 p-6 shadow-sm shadow-stone-200/50",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}
