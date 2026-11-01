"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function HostDashboardPage() {
  const [homes, setHomes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${api}/homes/host/mine`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setHomes(d.homes))
      .catch(() => setError("Log in as a host to see your dashboard."));
  }, []);

  return (
    <section className="section">
      <div className="title-row">
        <h1>Host dashboard</h1>
        <Link className="checkout" href="/host/homes/new">+ List a new home</Link>
      </div>
      {error && <p className="notice">{error}</p>}
      <div className="stats">
        <article><b>{homes.length}</b><span>Total listings</span></article>
        <article><b>{homes.filter((h) => h.status === "active").length}</b><span>Live</span></article>
        <article><b>{homes.filter((h) => h.status === "pending_approval").length}</b><span>Pending review</span></article>
      </div>
      <div className="section-heading">
        <h2>Your homes</h2>
        <Link href="/host/homes">Manage all →</Link>
      </div>
    </section>
  );
}