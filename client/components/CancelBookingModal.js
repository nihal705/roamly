"use client";
import { useEffect, useState } from "react";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function CancelBookingModal({ bookingId, onClose, onCancelled }) {
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${api}/bookings/${bookingId}/cancel-quote`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setQuote)
      .catch(() => setError("Unable to fetch cancellation policy."));
  }, [bookingId]);

  async function confirm() {
    setBusy(true);
    const r = await fetch(`${api}/bookings/${bookingId}/cancel`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Cancelled by guest" }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return setError(d.message || "Unable to cancel");
    onCancelled(d.booking);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Cancel this booking?</h2>
        <p className="muted">
          {quote
            ? quote.reason
            : error
              ? error
              : "Calculating your refund…"}
        </p>

        {quote && (
          <>
            <div className="cancel-summary">
              <div>
                <span>Amount paid</span>
                <span>₹{quote.total.toLocaleString()}</span>
              </div>
              <div className="discount">
                <span>Refund ({quote.percent}%)</span>
                <span>₹{quote.refund.toLocaleString()}</span>
              </div>
              <hr />
              <div className="total">
                <span>You’ll receive</span>
                <span>₹{quote.refund.toLocaleString()}</span>
              </div>
            </div>
            <p className="muted small">
              Check-in is {quote.daysUntilCheckIn} day
              {quote.daysUntilCheckIn !== 1 ? "s" : ""} away.
            </p>
          </>
        )}

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose} disabled={busy}>
            Keep booking
          </button>
          <button
            className="danger-btn"
            onClick={confirm}
            disabled={busy || !quote}
          >
            {busy ? "Cancelling…" : "Yes, cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}