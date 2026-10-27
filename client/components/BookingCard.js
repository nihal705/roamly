"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function overlaps(checkIn, checkOut, ranges) {
  if (!checkIn || !checkOut) return false;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return ranges.some((r) => {
    const rStart = new Date(r.checkIn);
    const rEnd = new Date(r.checkOut);
    return start < rEnd && end > rStart;
  });
}

export function BookingCard({ home }) {
  const router = useRouter();
  const [form, setForm] = useState({ checkIn: "", checkOut: "", guests: 1 });
  const [quote, setQuote] = useState(null);
  const [ranges, setRanges] = useState([]);
  const [notice, setNotice] = useState("");
  const [dateConflict, setDateConflict] = useState(false);

  const isPaused = home.listingStatus === "paused";

  useEffect(() => {
    fetch(`${api}/homes/${home._id}/booked-dates`)
      .then((r) => (r.ok ? r.json() : { ranges: [] }))
      .then((d) => setRanges(d.ranges || []))
      .catch(() => setRanges([]));
  }, [home._id]);

  useEffect(() => {
    setNotice("");
    setDateConflict(false);
    setQuote(null);

    if (!form.checkIn || !form.checkOut) return;

    if (new Date(form.checkOut) <= new Date(form.checkIn)) {
      setNotice("Check-out must be after check-in.");
      return;
    }

    if (overlaps(form.checkIn, form.checkOut, ranges)) {
      setDateConflict(true);
      setNotice("Those dates are already booked. Pick a different range.");
      return;
    }

    const qs = new URLSearchParams({
      checkIn: form.checkIn,
      checkOut: form.checkOut,
    });
    fetch(`${api}/homes/${home._id}/quote?${qs}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setQuote(d.quote))
      .catch(() => setQuote(null));
  }, [form.checkIn, form.checkOut, home._id, ranges]);

  function addToCart(e) {
    e.preventDefault();
    if (isPaused) return;
    if (!form.checkIn || !form.checkOut) return setNotice("Choose your dates first.");
    if (dateConflict) return;
    localStorage.setItem(
      "airbnb-cart",
      JSON.stringify({
        homeId: home._id,
        title: home.title,
        image: home.images?.[0],
        ...form,
        guests: Number(form.guests),
        quote,
      }),
    );
    router.push("/cart");
  }

  return (
    <aside className="booking-card">
      <h2>
        ₹{home.pricePerNight.toLocaleString()} <small>night</small>
      </h2>

      {isPaused && (
        <p className="notice">
          This listing is paused by the host and isn’t accepting bookings.
        </p>
      )}

      {ranges.length > 0 && (
        <div className="booked-ranges">
          <p className="field-label">Already booked dates</p>
          <ul>
            {ranges.map((r, i) => (
              <li key={i}>
                {fmtDate(r.checkIn)} – {fmtDate(r.checkOut)}
              </li>
            ))}
          </ul>
          <p className="muted small">
            You can book any other dates around these.
          </p>
        </div>
      )}

      <form onSubmit={addToCart}>
        <div className="dates">
          <label>
            CHECK-IN
            <input
              type="date"
              required
              min={new Date().toISOString().slice(0, 10)}
              value={form.checkIn}
              onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
              disabled={isPaused}
            />
          </label>
          <label>
            CHECK-OUT
            <input
              type="date"
              required
              min={form.checkIn || new Date().toISOString().slice(0, 10)}
              value={form.checkOut}
              onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
              disabled={isPaused}
            />
          </label>
        </div>
        <label className="guest-label">
          GUESTS
          <input
            type="number"
            min="1"
            max={home.maxGuests}
            value={form.guests}
            onChange={(e) => setForm({ ...form, guests: e.target.value })}
            disabled={isPaused}
          />
        </label>

        {quote && !dateConflict && (
          <div className="quote">
            <div>
              <span>
                ₹{home.pricePerNight.toLocaleString()} × {quote.nights} nights
              </span>
              <span>₹{quote.subtotal.toLocaleString()}</span>
            </div>
            {quote.discount > 0 && (
              <div className="discount">
                <span>Discount</span>
                <span>-₹{quote.discount.toLocaleString()}</span>
              </div>
            )}
            <div>
              <span>Cleaning fee</span>
              <span>₹{quote.cleaningFee.toLocaleString()}</span>
            </div>
            <div>
              <span>Service fee</span>
              <span>₹{quote.serviceFee.toLocaleString()}</span>
            </div>
            <div>
              <span>Taxes</span>
              <span>₹{quote.taxes.toLocaleString()}</span>
            </div>
            <hr />
            <div className="total">
              <span>Total</span>
              <span>₹{quote.total.toLocaleString()}</span>
            </div>
          </div>
        )}

        <button disabled={isPaused || dateConflict}>
          {isPaused ? "Unavailable" : dateConflict ? "Dates unavailable" : "Reserve"}
        </button>
      </form>
      <p className="muted center">You won’t be charged yet</p>
      {notice && <p className="notice">{notice}</p>}
    </aside>
  );
}