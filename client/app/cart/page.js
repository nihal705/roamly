"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function CartPage() {
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("Roamly-cart");
    if (raw) setItem(JSON.parse(raw));
  }, []);

  async function checkout() {
    if (!item) return;
    setMessage("Creating secure order…");
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
      setMessage(data.message || "Please log in before checking out.");
      return;
    }

    const finish = async (response) => {
      const vr = await fetch(`${api}/bookings/verify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: data.booking.bookingId,
          ...response,
        }),
      });
      if (!vr.ok) {
        setMessage("Payment verification failed.");
        return;
      }
      localStorage.removeItem("Roamly-cart");
      router.push(`/bookings/${data.booking._id}`);
    };

    if (data.demo) {
      setMessage(
        "Demo mode: Razorpay keys not configured. Confirming booking…",
      );
      return finish({ demo: true });
    }

    if (window.Razorpay) return openRazorpay();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = openRazorpay;
    document.body.appendChild(script);

    function openRazorpay() {
      new window.Razorpay({
        key: data.keyId,
        amount: data.order.amount,
        currency: "INR",
        name: "Roamly",
        description: item.title,
        order_id: data.order.id,
        handler: finish,
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
    }
  }

  if (!item)
    return (
      <section className="section">
        <h1>Your cart</h1>
        <p className="empty">
          Your cart is empty. Pick dates from a home page to add a stay.
        </p>
      </section>
    );

  const q = item.quote;
  return (
    <section className="section">
      <h1>Confirm and pay</h1>
      <article className="booking">
        <img src={item.image} alt="" />
        <div>
          <p className="eyebrow">READY TO BOOK</p>
          <h2>{item.title}</h2>
          <p>
            {item.checkIn} – {item.checkOut} · {item.guests} guest
            {item.guests > 1 ? "s" : ""}
          </p>
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

      <button className="checkout" onClick={checkout}>
        Proceed to secure payment
      </button>
      {message && <p className="notice">{message}</p>}
    </section>
  );
}
