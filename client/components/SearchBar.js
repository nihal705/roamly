"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const FIELDS = [
  ["location", "Where", "Search destinations"],
  ["checkIn", "Check in", ""],
  ["checkOut", "Check out", ""],
  ["guests", "Guests", "Add guests"],
];

export function SearchBar({ initial = {} }) {
  const router = useRouter();
  const [form, setForm] = useState({
    location: initial.location || "",
    checkIn: initial.checkIn || "",
    checkOut: initial.checkOut || "",
    guests: initial.guests || "",
  });

  function submit(e) {
    e.preventDefault();
    const q = new URLSearchParams(Object.entries(form).filter(([, v]) => v));
    router.push(`/search?${q}`);
  }

  return (
    <form onSubmit={submit} className="searchbar" suppressHydrationWarning>
      {FIELDS.map(([key, label, placeholder]) => (
        <label key={key}>
          <span>{label}</span>
          <input
            type={
              key.includes("check")
                ? "date"
                : key === "guests"
                  ? "number"
                  : "text"
            }
            min={key === "guests" ? "1" : undefined}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            placeholder={placeholder}
            autoComplete="off"
            suppressHydrationWarning
          />
        </label>
      ))}
      <button type="submit" aria-label="Search" suppressHydrationWarning>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="20" y1="20" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </form>
  );
}