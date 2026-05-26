import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("bg-parchment-50 border-2 border-parchment-800 p-3 shadow-woodcut", className)}
      {...rest}
    />
  );
}
