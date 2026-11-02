"use client";
import { useEffect, useState } from "react";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminHomesPage() {
  const [homes, setHomes] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    const r = await fetch(`${api}/admin/homes?status=pending_approval`, {
      credentials: "include",
    });
    if (!r.ok) return setMessage("Admin access required.");
    setHomes((await r.json()).homes);
  }

  useEffect(() => {
    load();
  }, []);

  async function act(id, action) {
    const r = await fetch(`${api}/admin/homes/${id}/${action}`, {
      method: "PATCH",
      credentials: "include",
    });
    if (r.ok) setHomes(homes.filter((h) => h._id !== id));
  }

  return (
    <section className="section">
      <h1>Admin dashboard</h1>

      <nav className="admin-tabs">
        <a href="/admin">Booking approvals</a>
        <a href="/admin/homes" className="active">Home approvals</a>
      </nav>

      {message && <p className="notice">{message}</p>}
      {homes.length === 0 && (
        <p className="empty">No homes waiting for approval.</p>
      )}

      {homes.map((h) => (
        <article className="approval" key={h._id}>
          <div>
            <b>{h.title}</b>
            <p>
              {h.location?.city}
              {h.location?.state ? `, ${h.location.state}` : ""} · ₹
              {h.pricePerNight?.toLocaleString()}/night · host{" "}
              {h.host?.name || "(unknown)"}
            </p>
            <small>{h.description?.slice(0, 160)}…</small>
            {h.images?.[0] && (
              <img
                src={h.images[0]}
                alt=""
                style={{
                  width: 160,
                  height: 110,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginTop: 10,
                }}
              />
            )}
          </div>
          <div>
            <button onClick={() => act(h._id, "approve")}>Approve</button>
            <button className="secondary" onClick={() => act(h._id, "reject")}>
              Reject
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}