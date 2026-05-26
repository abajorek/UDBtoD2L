"use client";
import { useState } from "react";
import type { Crew } from "@/lib/copy/crew";

interface Props {
  crew: Crew;
  onChange: (crew: Crew) => void;
}

export function CrewEditor({ crew, onChange }: Props) {
  const [passengersText, setPassengersText] = useState(crew.passengers.join(", "));

  return (
    <div className="space-y-2 text-sm">
      <Field
        label="Driver"
        value={crew.driver}
        onChange={(v) => onChange({ ...crew, driver: v })}
      />
      <Field
        label="Passengers (comma-separated)"
        value={passengersText}
        onChange={(v) => {
          setPassengersText(v);
          const list = v
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          onChange({ ...crew, passengers: list.length > 0 ? list : crew.passengers });
        }}
      />
      <Field
        label="Dog"
        value={crew.dog}
        onChange={(v) => onChange({ ...crew, dog: v })}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-pixel text-[9px] uppercase text-parchment-700 block mb-1">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 bg-parchment-50 border-2 border-parchment-800 text-sm focus:outline-none focus:bg-white"
      />
    </label>
  );
}
