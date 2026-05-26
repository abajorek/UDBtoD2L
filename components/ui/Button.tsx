"use client";
import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "chip";
  active?: boolean;
}

export function Button({ className, variant = "primary", active, ...rest }: Props) {
  const base =
    "px-3 py-2 text-xs uppercase tracking-wider transition-colors border-2 border-parchment-800";
  const styles = {
    primary:
      "bg-parchment-700 text-parchment-50 hover:bg-parchment-800 active:translate-x-[1px] active:translate-y-[1px]",
    ghost:
      "bg-parchment-100 text-parchment-800 hover:bg-parchment-200 active:translate-x-[1px] active:translate-y-[1px]",
    chip: clsx(
      "rounded-none",
      active
        ? "bg-parchment-700 text-parchment-50"
        : "bg-parchment-100 text-parchment-800 hover:bg-parchment-200",
    ),
  };
  return (
    <button
      className={clsx(base, styles[variant], "font-pixel shadow-woodcut", className)}
      {...rest}
    />
  );
}
