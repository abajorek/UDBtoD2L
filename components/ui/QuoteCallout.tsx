"use client";
import { useState } from "react";

interface Props {
  text: string;
  /** Short button label (default: "📢 From Jeremy"). */
  label?: string;
}

/** A small inline disclosure that reveals a Clarkson-style quote. */
export function QuoteCallout({ text, label = "📢 What's Jeremy say?" }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="text-xs">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="font-pixel text-[10px] uppercase text-parchment-700 hover:text-parchment-900 underline decoration-dotted underline-offset-2"
        aria-expanded={open}
      >
        {label}
      </button>
      {open && (
        <blockquote className="mt-1.5 pl-2 border-l-2 border-parchment-700 italic text-sm text-parchment-800 leading-snug">
          {text}
        </blockquote>
      )}
    </div>
  );
}
