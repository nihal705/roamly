"use client";
import { useEffect, useState } from "react";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function FavouriteButton({ homeId }) {
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${api}/users/favourites`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setSaved((d.homes || []).some((h) => h._id === homeId));
      })
      .finally(() => setLoaded(true));
  }, [homeId]);

  async function toggle() {
    const r = await fetch(`${api}/users/favourites/${homeId}`, {
      method: "POST",
      credentials: "include",
    });
    if (r.status === 401) {
      setMessage("Log in to save homes");
      return;
    }
    if (!r.ok) return;
    const d = await r.json();
    setSaved((d.favourites || []).some((id) => String(id) === String(homeId)));
    setMessage(saved ? "Removed from favourites" : "Saved to favourites");
    setTimeout(() => setMessage(""), 2000);
  }

  return (
    <>
      <button
        className={`save-button ${saved ? "saved" : ""}`}
        onClick={toggle}
        disabled={!loaded}
      >
        {saved ? "♥ Saved" : "♡ Save"}
      </button>
      {message && <span className="save-message">{message}</span>}
    </>
  );
}