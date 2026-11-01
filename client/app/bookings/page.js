"use client";
import { useEffect, useState } from "react";
const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`${api}/bookings/mine`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setBookings(d.bookings))
      .catch(() => setError("Please log in to see your trips."));
  }, []);
  return (
    <section className="section">
      <h1>Your trips</h1>
      {error && <p className="notice">{error}</p>}
      <div className="booking-list">
        {bookings.map((b) => (
          <article className="booking" key={b._id}>
            <img src={b.home.images?.[0]} alt="" />
            <div>
              <p className="eyebrow">{b.status.replaceAll("_", " ")}</p>
              <h2>{b.home.title}</h2>
              <p>
                {new Date(b.checkIn).toLocaleDateString()} –{" "}
                {new Date(b.checkOut).toLocaleDateString()} · {b.guests} guests
              </p>
              <strong>Booking ID: {b.bookingId}</strong>
            </div>
            <b>₹{b.price.total.toLocaleString()}</b>
          </article>
        ))}
      </div>
    </section>
  );
}
