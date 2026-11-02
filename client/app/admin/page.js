"use client";
import { useEffect, useState } from "react";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    const opts = { credentials: "include" };
    const [d, b] = await Promise.all([
      fetch(`${api}/admin/dashboard`, opts),
      fetch(`${api}/admin/bookings?status=AWAITING_ADMIN`, opts),
    ]);
    if (!d.ok || !b.ok) {
      setMessage("Admin access is required.");
      return;
    }
    setData(await d.json());
    setBookings((await b.json()).bookings);
  }

  useEffect(() => {
    load().catch(() => setMessage("Admin access is required."));
  }, []);

  async function decide(id, action) {
    const r = await fetch(`${api}/admin/bookings/${id}/${action}`, {
      method: "PATCH",
      credentials: "include",
    });
    if (r.ok) setBookings(bookings.filter((x) => x._id !== id));
  }

  return (
    <section className="section">
      <h1>Admin dashboard</h1>

      <nav className="admin-tabs">
        <a href="/admin" className="active">Booking approvals</a>
        <a href="/admin/homes">Home approvals</a>
      </nav>

      {message && <p className="notice">{message}</p>}

      {data && (
        <div className="stats">
          <article>
            <b>{data.pending}</b>
            <span>Bookings awaiting review</span>
          </article>
          <article>
            <b>{data.pendingHomes ?? 0}</b>
            <span>Homes awaiting review</span>
          </article>
          <article>
            <b>{data.confirmed}</b>
            <span>Confirmed stays</span>
          </article>
          <article>
            <b>{data.homes}</b>
            <span>Published homes</span>
          </article>
        </div>
      )}

      <h2>Booking approval queue</h2>
      {bookings.length === 0 && (
        <p className="empty">No bookings waiting for approval.</p>
      )}
      {bookings.map((b) => (
        <article className="approval" key={b._id}>
          <div>
            <b>{b.bookingId}</b>
            <p>
              {b.guest?.name} · {b.home?.title}
            </p>
            <small>
              {new Date(b.checkIn).toLocaleDateString()} –{" "}
              {new Date(b.checkOut).toLocaleDateString()} · ₹
              {b.price?.total?.toLocaleString()}
            </small>
          </div>
          <div>
            <button onClick={() => decide(b._id, "confirm")}>Confirm</button>
            <button
              className="secondary"
              onClick={() => decide(b._id, "reject")}
            >
              Reject
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}