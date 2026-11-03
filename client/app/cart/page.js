"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const FALLBACK =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

function resolveImageUrl(url) {
  if (!url) return FALLBACK;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  )
    return url;
  const base =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
      : "");
  return base
    ? `${base.replace(/\/+$/, "")}${url.startsWith("/") ? "" : "/"}${url}`
    : url;
}

export default function CartPage() {
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function clearCart() {
    localStorage.removeItem("roamly-cart");
    localStorage.removeItem("Roamly-cart");
    localStorage.removeItem("airbnb-cart");
    setItem(null);
  }

  useEffect(() => {
    const raw =
      localStorage.getItem("roamly-cart") ||
      localStorage.getItem("Roamly-cart") ||
      localStorage.getItem("airbnb-cart");

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setItem(parsed);

        // If quote is missing or stale, fetch it automatically
        if (
          (!parsed.quote || !parsed.quote.total) &&
          parsed.homeId &&
          parsed.checkIn &&
          parsed.checkOut
        ) {
          const qs = new URLSearchParams({
            checkIn: parsed.checkIn,
            checkOut: parsed.checkOut,
          });
          fetch(`${api}/homes/${parsed.homeId}/quote?${qs}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
              if (d?.quote) {
                setItem((prev) => (prev ? { ...prev, quote: d.quote } : null));
              }
            })
            .catch(() => {});
        }
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  async function checkout() {
    if (!item) return;
    setLoading(true);
    setMessage("Creating secure order…");

    try {
      const r = await fetch(`${api}/bookings/create-order`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeId: item.homeId,
          checkIn: item.checkIn,
          checkOut: item.checkOut,
          guests: item.guests,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setLoading(false);
        setMessage(data.message || "Please log in before checking out.");
        return;
      }

      const finish = async (response) => {
        setMessage("Verifying payment…");
        const vr = await fetch(`${api}/bookings/verify`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: data.booking.bookingId,
            ...response,
          }),
        });
        setLoading(false);
        if (!vr.ok) {
          setMessage("Payment verification failed.");
          return;
        }
        clearCart();
        router.push(`/bookings/${data.booking._id}`);
      };

      if (data.demo) {
        setMessage(
          "Demo mode: Razorpay keys not configured. Confirming booking…",
        );
        return finish({ demo: true });
      }

      const openRazorpay = () => {
        new window.Razorpay({
          key: data.keyId,
          amount: data.order.amount,
          currency: "INR",
          name: "Roamly",
          description: item.title,
          order_id: data.order.id,
          handler: finish,
          modal: {
            ondismiss: () => {
              setLoading(false);
              setMessage("Payment was not completed.");
            },
          },
          theme: {
            color: "#ff385c",
            hide_topbar: true,
          },
          prefill: {
            contact: "9999999999",
            email: "demo@example.com",
          },
          hidden: {
            contact: true,
            email: true,
          },
        }).open();
      };

      if (window.Razorpay) {
        openRazorpay();
      } else {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = openRazorpay;
        document.body.appendChild(script);
      }
    } catch {
      setLoading(false);
      setMessage("Unable to complete checkout. Please try again.");
    }
  }

  if (!item)
    return (
      <section className="section">
        <h1>Your cart</h1>
        <p className="empty">
          Your cart is empty. Pick dates from any home page to add a stay.
        </p>
        <Link href="/" className="checkout" style={{ display: "inline-block", marginTop: "16px" }}>
          Explore homes
        </Link>
      </section>
    );

  const q = item.quote;
  return (
    <section className="section">
      <h1>Confirm and pay</h1>
      <article className="booking">
        <img
          src={resolveImageUrl(item.image)}
          alt={item.title}
          onError={(e) => {
            e.currentTarget.src = FALLBACK;
          }}
        />
        <div>
          <p className="eyebrow">READY TO BOOK</p>
          <h2>{item.title}</h2>
          <p>
            {item.checkIn} – {item.checkOut} · {item.guests} guest
            {item.guests > 1 ? "s" : ""}
          </p>
          <button
            type="button"
            onClick={clearCart}
            style={{
              marginTop: "8px",
              background: "none",
              border: "none",
              color: "#64748b",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "13px",
              padding: 0,
            }}
          >
            Remove from cart
          </button>
        </div>
        {q && <b>₹{q.total.toLocaleString()}</b>}
      </article>

      {q && (
        <div className="cart-breakdown">
          <div>
            <span>Subtotal</span>
            <span>₹{q.subtotal.toLocaleString()}</span>
          </div>
          {q.discount > 0 && (
            <div className="discount">
              <span>Discount</span>
              <span>-₹{q.discount.toLocaleString()}</span>
            </div>
          )}
          <div>
            <span>Cleaning fee</span>
            <span>₹{q.cleaningFee.toLocaleString()}</span>
          </div>
          <div>
            <span>Service fee</span>
            <span>₹{q.serviceFee.toLocaleString()}</span>
          </div>
          <div>
            <span>Taxes</span>
            <span>₹{q.taxes.toLocaleString()}</span>
          </div>
          <hr />
          <div className="total">
            <span>Total (INR)</span>
            <span>₹{q.total.toLocaleString()}</span>
          </div>
        </div>
      )}

      <button className="checkout" onClick={checkout} disabled={loading}>
        {loading ? "Processing…" : "Proceed to secure payment"}
      </button>
      {message && <p className="notice">{message}</p>}
    </section>
  );
}
