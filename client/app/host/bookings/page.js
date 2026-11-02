"use client";
import { useEffect, useState } from "react";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function HostBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    const r = await fetch(`${api}/host/bookings`, { credentials: "include" });
    if (!r.ok) return setMessage("Log in as a host.");
    setBookings((await r.json()).bookings);
  }

  useEffect(() => {
    load();
  }, []);

  async function act(id, action) {
    const r = await fetch(`${api}/host/bookings/${id}/${action}`, {
      method: "PATCH",
      credentials: "include",
    });
    if (r.ok) load();
  }

  const pending = bookings.filter((b) => b.status === "AWAITING_ADMIN");
  const others = bookings.filter((b) => b.status !== "AWAITING_ADMIN");

  return (
    <section className="section">
      <h1>Incoming bookings</h1>
      {message && <p className="notice">{message}</p>}

      <h2>Awaiting your approval ({pending.length})</h2>
      {pending.length === 0 && <p className="empty">Nothing to approve.</p>}
      {pending.map((b) => (
        <article className="approval" key={b._id}>
          <div>
            <b>{b.bookingId}</b>
            <p>
              {b.guest?.name} · {b.home?.title}
            </p>
            <small>
              {new Date(b.checkIn).toLocaleDateString()} –{" "}
              {new Date(b.checkOut).toLocaleDateString()} ·{" "}
              {b.guests} guests · ₹{b.price?.total?.toLocaleString()}
            </small>
          </div>
          <div>
            <button onClick={() => act(b._id, "confirm")}>Approve</button>
            <button className="secondary" onClick={() => act(b._id, "reject")}>
              Reject
            </button>
          </div>
        </article>
      ))}

      <h2 style={{ marginTop: 40 }}>History</h2>
      {others.length === 0 && <p className="empty">No past bookings.</p>}
      {others.map((b) => (
        <article className="approval" key={b._id}>
          <div>
            <b>{b.bookingId}</b>{" "}
            <span className="eyebrow">{b.status.replaceAll("_", " ")}</span>
            <p>
              {b.guest?.name} · {b.home?.title}
            </p>
            <small>
              {new Date(b.checkIn).toLocaleDateString()} –{" "}
              {new Date(b.checkOut).toLocaleDateString()}
            </small>
          </div>
        </article>
      ))}
    </section>
  );
}