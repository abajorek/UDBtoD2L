"use client";
import { useMemo } from "react";

const SNIPPETS: string[] = [
  "Your dog requires exercise. ① Walk at the next park ② Risk dysentery",
  "You have driven 327 miles. The Tahoe has not died of dysentery.",
  "The Odyssey has stopped to ford a corn field. Press F to honor.",
  "You see a giant prairie dog. Investigate? (Y/N)",
  "A traveling minstrel offers to play \"Free Bird\". Decline politely.",
  "You have spotted: World's Largest Ball of Twine. Morale +1.",
  "The Honda has caught dysentery. Just kidding, it's a 2019.",
  "Your kids ask \"are we there yet?\". You are NOT there yet.",
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
