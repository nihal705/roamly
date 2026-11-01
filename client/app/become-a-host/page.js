"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../providers/AuthProvider";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function BecomeAHostPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upgrade() {
    setBusy(true);
    setError("");
    const r = await fetch(`${api}/users/become-a-host`, {
      method: "POST",
      credentials: "include",
    });
    setBusy(false);
    if (!r.ok) return setError("Unable to upgrade. Please log in again.");
    const d = await r.json();
    setUser(d.user);
    router.push("/host");
    router.refresh();
  }

  if (!user)
    return (
      <section className="section">
        <p className="notice">Please log in first.</p>
      </section>
    );

  if (user.role === "host" || user.role === "admin")
    return (
      <section className="section">
        <h1>You're already a host</h1>
        <p className="muted">Head to your host dashboard to manage listings.</p>
        <a className="checkout" href="/host">Go to dashboard</a>
      </section>
    );

  return (
    <section className="section form-page">
      <h1>Become a host</h1>
      <p className="muted">
        Turn your account into a host account to list homes and manage bookings.
        You can always switch back later.
      </p>
      <button className="checkout" onClick={upgrade} disabled={busy}>
        {busy ? "Upgrading…" : "Upgrade to host"}
      </button>
      {error && <p className="notice">{error}</p>}
    </section>
  );
}