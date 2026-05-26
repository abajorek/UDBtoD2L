"use client";
import { useMemo } from "react";

const SNIPPETS: string[] = [
  "Now! Would you like to see the world's largest ball of twine?",
  "I went on the internet... and I found this!",
  "Some say... it's just down this exit.",
  "How hard can it be? Quite, as it turns out.",
  "Anyway. Moving on to a thing that is, frankly, magnificent.",
  "And in the next two miles, you shall see the most exciting prairie dog ever made.",
  "Hammond! Stop the car. There is a giant Czech egg.",
  "It is, in many ways, the perfect roadside attraction.",
  "On paper this sounds dreadful. In practice — it is wonderful.",
  "Your dog requires exercise. The next park, I think, will do nicely.",
  "Power... LATERAL!",
];

export function FlavorText({ seed }: { seed?: string }) {
  const text = useMemo(() => {
    if (!seed) return SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)];
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    return SNIPPETS[Math.abs(h) % SNIPPETS.length];
  }, [seed]);
  return (
    <p className="font-pixel text-[10px] leading-relaxed text-parchment-700">
      &gt; {text}
    </p>
  );
}
