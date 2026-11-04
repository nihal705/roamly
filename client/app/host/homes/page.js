"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function HostHomesListPage() {
  const [homes, setHomes] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const r = await fetch(`${api}/homes/host/mine`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!r.ok) return setMessage("Log in as a host.");
      const data = await r.json();
      setHomes(data.homes || []);
    } catch {
      setMessage("Failed to load your listings.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    if (!confirm("Delete this listing?")) return;
    try {
      const r = await fetch(`${api}/homes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (r.ok || r.status === 204) {
        setHomes((prev) => prev.filter((h) => h._id !== id));
      } else {
        const data = await r.json().catch(() => ({}));
        alert(data.message || "Failed to delete listing.");
      }
    } catch {
      alert("Network error: failed to delete listing.");
    }
  }

  async function toggle(id) {
    try {
      const r = await fetch(`${api}/homes/${id}/toggle-listing`, {
        method: "PATCH",
        credentials: "include",
      });
      if (r.ok) {
        const data = await r.json();
        setHomes((prev) =>
          prev.map((h) =>
            h._id === id
              ? { ...h, listingStatus: data.home?.listingStatus || (h.listingStatus === "paused" ? "active" : "paused") }
              : h,
          ),
        );
      } else {
        const data = await r.json().catch(() => ({}));
        alert(data.message || "Failed to update listing status.");
      }
    } catch {
      alert("Network error: failed to update listing status.");
    }
  }

  return (
    <section className="section">
      <div className="title-row">
        <h1>Your listings</h1>
        <Link className="checkout" href="/host/homes/new">+ New</Link>
      </div>

      {message && <p className="notice">{message}</p>}

      <div className="booking-list">
        {homes.map((h) => (
          <article className="booking" key={h._id}>
            <img src={h.images?.[0]} alt="" />
            <div>
              <p className="eyebrow">
                {h.status.replaceAll("_", " ")}
                {h.listingStatus === "paused" && " · PAUSED"}
              </p>
              <h2>{h.title}</h2>
              <p>
                {h.location?.city} · ₹{h.pricePerNight?.toLocaleString()}/night
              </p>
            </div>

            <div className="row-actions">
              <button className="secondary-btn" onClick={() => toggle(h._id)}>
                {h.listingStatus === "paused" ? "Resume" : "Pause"}
              </button>
              <Link className="checkout" href={`/host/homes/${h._id}/edit`}>
                Edit
              </Link>
              <button className="secondary-btn" onClick={() => remove(h._id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
