"use client";
import { useMemo } from "react";
import { headerLine } from "@/lib/copy/generator";

export function FlavorText({ seed }: { seed?: string }) {
  const text = useMemo(() => headerLine(seed), [seed]);
  return (
    <p className="font-pixel text-[10px] leading-relaxed text-parchment-700">
      &gt; {text}
    </p>
  );
}
