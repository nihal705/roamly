"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function Header() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function logout() {
    await fetch(`${api}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [mobileMenuOpen]);

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Roamly home">
        <Image src="/Roamly.png" alt="" width={54} height={54} priority />
        <span className="brand-name">Roamly</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="desktop-nav">
        <Link href="/search">Explore</Link>
        {user?.role === "host" && <Link href="/host">Host dashboard</Link>}
        {user?.role === "admin" && <Link href="/admin">Admin</Link>}
        {user ? (
          <>
            <Link href="/favourites">Saved</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/bookings">Trips</Link>
            <div className="profile-menu">
              <button
                className="profile"
                onClick={() => setOpen(!open)}
                aria-label="User profile menu"
              >
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

      {/* Mobile Top Navbar Actions (Hamburger & Profile) */}
      <div className="mobile-header-actions">
        {user ? (
          <Link href="/bookings" className="mobile-profile-badge">
            {user.name?.slice(0, 1).toUpperCase()}
          </Link>
        ) : (
          <Link href="/login" className="mobile-login-pill">
            Log in
          </Link>
        )}

        <button
          type="button"
          className="mobile-hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Slide-out Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="mobile-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-drawer-top">
              <span className="mobile-drawer-title">Menu</span>
              <button
                type="button"
                className="mobile-drawer-close"
                onClick={() => setMobileMenuOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="mobile-drawer-body">
              <Link
                href="/search"
                className="mobile-drawer-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="drawer-icon">🧭</span> Explore Stays
              </Link>
              <Link
                href="/favourites"
                className="mobile-drawer-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="drawer-icon">♡</span> Saved Favourites
              </Link>
              <Link
                href="/cart"
                className="mobile-drawer-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="drawer-icon">🛒</span> Cart
              </Link>
              <Link
                href="/bookings"
                className="mobile-drawer-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="drawer-icon">🎒</span> My Trips
              </Link>

              {(user?.role === "host" || user?.role === "admin") && (
                <>
                  <div className="mobile-drawer-divider" />
                  <div className="mobile-drawer-section-title">Host Tools</div>
                  <Link
                    href="/host"
                    className="mobile-drawer-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="drawer-icon">🏠</span> Host Dashboard
                  </Link>
                  <Link
                    href="/host/homes"
                    className="mobile-drawer-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="drawer-icon">📋</span> My Listings
                  </Link>
                  <Link
                    href="/host/bookings"
                    className="mobile-drawer-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="drawer-icon">📥</span> Incoming Bookings
                  </Link>
                </>
              )}

              {user?.role === "admin" && (
                <>
                  <div className="mobile-drawer-divider" />
                  <div className="mobile-drawer-section-title">Administration</div>
                  <Link
                    href="/admin"
                    className="mobile-drawer-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="drawer-icon">⚡</span> Admin Dashboard
                  </Link>
                </>
              )}

              {user?.role === "guest" && (
                <>
                  <div className="mobile-drawer-divider" />
                  <Link
                    href="/become-a-host"
                    className="mobile-drawer-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="drawer-icon">✨</span> Become a Host
                  </Link>
                </>
              )}

              <div className="mobile-drawer-divider" />

              {user ? (
                <div className="mobile-drawer-footer">
                  <p className="profile-name">{user.name}</p>
                  <p className="profile-email">{user.email}</p>
                  <button
                    type="button"
                    className="mobile-logout-btn"
                    onClick={logout}
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="mobile-drawer-auth-buttons">
                  <Link
                    href="/login"
                    className="mobile-auth-login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="mobile-auth-signup"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
