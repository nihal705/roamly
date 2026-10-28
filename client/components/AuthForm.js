"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function AuthForm({ mode }) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const signup = mode === "signup";

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch(`${api}/auth/${signup ? "signup" : "login"}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(json.message || "Unable to continue");

    setUser(json.user);

    router.push("/");
    router.refresh();
  }

  return (
    <section className="auth">
      <form onSubmit={submit} className="form">
        <h1>{signup ? "Create an account" : "Welcome back"}</h1>
        <p>
          {signup
            ? "Join Roamly to start planning your next trip."
            : "Log in to manage your stays and listings."}
        </p>
        {signup && (
          <>
            <label>
              Name
              <input name="name" required />
            </label>
            <label>
              Account type
              <select name="role">
                <option value="guest">Guest</option>
                <option value="host">Host</option>
              </select>
            </label>
          </>
        )}
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Password
          <input name="password" type="password" minLength="8" required />
        </label>
        {error && <p className="notice">{error}</p>}
        <button disabled={loading}>
          {loading ? "Please wait…" : signup ? "Create account" : "Log in"}
        </button>
        <p>
          {signup ? "Already a member?" : "New to Roamly?"}{" "}
          <Link href={signup ? "/login" : "/signup"}>
            {signup ? "Log in" : "Create an account"}
          </Link>
        </p>
      </form>
    </section>
  );
}
