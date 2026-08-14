"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type HistoryBackButtonProps = {
  children: string;
  className: string;
};

export function HistoryBackButton({
  children,
  className,
}: HistoryBackButtonProps) {
  const router = useRouter();

  return (
    <button className={className} onClick={() => router.back()} type="button">
      <ArrowLeft className="h-4 w-4" />
      {children}
    </button>
  );
}
