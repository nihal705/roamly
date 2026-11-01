"use client";
import { useEffect, useState } from "react";
import { CancelBookingModal } from "../../../components/CancelBookingModal";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function BookingDetailPage({ params }) {
  const [id, setId] = useState(null);
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState("");
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`${api}/bookings/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setBooking(d.booking))
      .catch(() => setMessage("Unable to load booking."));
  }, [id]);

  if (!booking)
    return (
      <section className="section">
        <p className="empty">Loading…</p>
      </section>
    );

  const canCancel = ["PENDING_PAYMENT", "AWAITING_ADMIN", "CONFIRMED"].includes(
    booking.status,
  );

  return (
    <section className="section">
      <p className="eyebrow">BOOKING {booking.bookingId}</p>
      <h1>{booking.home?.title || "Stay"}</h1>
      <p className="muted">
        {new Date(booking.checkIn).toLocaleDateString()} –{" "}
        {new Date(booking.checkOut).toLocaleDateString()} · {booking.guests} guests
      </p>

      <div className="stats">
        <article><b>{booking.status.replaceAll("_", " ")}</b><span>Status</span></article>
        <article><b>₹{booking.price?.total?.toLocaleString()}</b><span>Paid</span></article>
        <article><b>{booking.nights}</b><span>Nights</span></article>
      </div>

      <div className="cart-breakdown">
        <div><span>Subtotal</span><span>₹{booking.price?.subtotal?.toLocaleString()}</span></div>
        {booking.price?.discount > 0 && (
          <div className="discount">
            <span>Discount</span>
            <span>-₹{booking.price.discount.toLocaleString()}</span>
          </div>
        )}
        <div><span>Cleaning</span><span>₹{booking.price?.cleaningFee?.toLocaleString()}</span></div>
        <div><span>Service</span><span>₹{booking.price?.serviceFee?.toLocaleString()}</span></div>
        <div><span>Taxes</span><span>₹{booking.price?.taxes?.toLocaleString()}</span></div>
        <hr />
        <div className="total"><span>Total</span><span>₹{booking.price?.total?.toLocaleString()}</span></div>
      </div>

      {canCancel && (
        <button className="checkout" onClick={() => setShowCancel(true)}>
          Cancel booking
        </button>
      )}

      {message && <p className="notice">{message}</p>}

      {showCancel && (
        <CancelBookingModal
          bookingId={id}
          onClose={() => setShowCancel(false)}
          onCancelled={(updated) => {
            setBooking(updated);
            setShowCancel(false);
            setMessage(
              `Booking cancelled. Refund: ₹${updated.refundAmount?.toLocaleString()}`,
            );
          }}
        />
      )}
    </section>
  );
}