import { cn } from "@/lib/utils";

type DecorativeElementProps = {
  variant?: "stamp" | "compass" | "route" | "postcard";
  className?: string;
};

export function DecorativeElement({
  variant = "stamp",
  className,
}: DecorativeElementProps) {
  if (variant === "route") {
    return (
      <svg
        aria-hidden="true"
        className={cn("pointer-events-none absolute text-stone-500/20", className)}
        fill="none"
        viewBox="0 0 220 90"
      >
        <path
          d="M8 72c34-44 64 9 101-25 34-31 59-44 103-17"
          stroke="currentColor"
          strokeDasharray="8 10"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <circle cx="8" cy="72" r="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="212" cy="30" r="5" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  if (variant === "compass") {
    return (
      <svg
        aria-hidden="true"
        className={cn("pointer-events-none absolute text-stone-600/15", className)}
        fill="none"
        viewBox="0 0 120 120"
      >
        <circle cx="60" cy="60" r="45" stroke="currentColor" strokeWidth="2" />
        <path d="m60 18 10 42-10 42-10-42 10-42Z" stroke="currentColor" />
        <path d="m18 60 42-10 42 10-42 10-42-10Z" stroke="currentColor" />
        <circle cx="60" cy="60" r="5" fill="currentColor" />
      </svg>
    );
  }

  if (variant === "postcard") {
    return (
      <svg
        aria-hidden="true"
        className={cn("pointer-events-none absolute text-stone-500/15", className)}
        fill="none"
        viewBox="0 0 180 120"
      >
        <rect height="92" rx="4" stroke="currentColor" width="142" x="19" y="14" />
        <path d="M35 36h52M35 52h42M112 34h31M112 48h31M112 62h31" stroke="currentColor" />
        <path d="m30 94 39-32 28 21 24-16 29 27" stroke="currentColor" />
      </svg>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute grid h-28 w-28 place-items-center rounded-full border border-dashed border-stone-500/20 text-[10px] uppercase tracking-[0.28em] text-stone-500/25",
        className,
      )}
    >
      <span className="-rotate-12 text-center leading-4">CoVoyage<br />Field Note</span>
    </div>
  );
}
