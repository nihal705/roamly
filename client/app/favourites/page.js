"use client";
import { useEffect, useState } from "react";
import { HomeGrid } from "../../components/HomeGrid";
const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export default function Favourites() {
  const [homes, setHomes] = useState([]),
    [message, setMessage] = useState("Loading…");
  useEffect(() => {
    fetch(`${api}/users/favourites`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setHomes(d.homes);
        setMessage("");
      })
      .catch(() => setMessage("Log in to view your saved homes."));
  }, []);
  return (
    <section className="section">
      <h1>Favourites</h1>
      {message ? (
        <p className="empty">{message}</p>
      ) : (
        <HomeGrid homes={homes} />
      )}
    </section>
  );
}
