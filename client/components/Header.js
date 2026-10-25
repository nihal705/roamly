"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function Header() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch(`${api}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header>
      <Link className="brand" href="/" aria-label="Roamly home">
        <Image src="/Roamly.png" alt="" width={60} height={60} priority />
        <span className="brand-name">Roamly</span>
      </Link>

      <nav>
        <Link href="/search">Explore</Link>
        {user?.role === "host" && <Link href="/host">Host dashboard</Link>}
        {user?.role === "admin" && <Link href="/admin">Admin</Link>}
        {user ? (
          <>
            <Link href="/favourites">Saved</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/bookings">Trips</Link>
            <div className="profile-menu">
              <button className="profile" onClick={() => setOpen(!open)}>
                {user.name?.slice(0, 1).toUpperCase()}
              </button>
              {open && (
                <div
                  className="profile-dropdown"
                  onMouseLeave={() => setOpen(false)}
                >
                  <p className="profile-name">{user.name}</p>
                  <p className="profile-email">{user.email}</p>
                  <hr />
                  <Link href="/bookings" onClick={() => setOpen(false)}>
                    My trips
                  </Link>
                  <Link href="/favourites" onClick={() => setOpen(false)}>
                    Saved
                  </Link>

                  {(user.role === "host" || user.role === "admin") && (
                    <>
                      <Link href="/host" onClick={() => setOpen(false)}>
                        Host dashboard
                      </Link>
                      <Link href="/host/homes" onClick={() => setOpen(false)}>
                        My listings
                      </Link>
                      <Link
                        href="/host/bookings"
                        onClick={() => setOpen(false)}
                      >
                        Incoming bookings
                      </Link>
                    </>
                  )}

                  {user.role === "admin" && (
                    <Link href="/admin" onClick={() => setOpen(false)}>
                      Admin panel
                    </Link>
                  )}

                  {user.role === "guest" && (
                    <Link href="/become-a-host" onClick={() => setOpen(false)}>
                      Become a host
                    </Link>
                  )}

                  <hr />
                  <button className="link-btn" onClick={logout}>
                    Log out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/signup" className="host-link">
              Become a host
            </Link>
            <Link className="login-link" href="/login">
              Log in
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
