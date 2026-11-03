"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [hasCartItem, setHasCartItem] = useState(false);

  useEffect(() => {
    function checkCart() {
      const raw =
        localStorage.getItem("roamly-cart") ||
        localStorage.getItem("Roamly-cart") ||
        localStorage.getItem("airbnb-cart");
      setHasCartItem(Boolean(raw));
    }
    checkCart();
    window.addEventListener("storage", checkCart);
    return () => window.removeEventListener("storage", checkCart);
  }, [pathname]);

  const navItems = [
    {
      label: "Explore",
      href: "/",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      ),
    },
    {
      label: "Saved",
      href: "/favourites",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
    {
      label: "Cart",
      href: "/cart",
      badge: hasCartItem,
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      label: "Trips",
      href: "/bookings",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
    {
      label: user ? (user.role === "admin" ? "Admin" : user.role === "host" ? "Host" : "Profile") : "Log in",
      href: user ? (user.role === "admin" ? "/admin" : user.role === "host" ? "/host" : "/bookings") : "/login",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`mobile-nav-item ${isActive ? "active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <div className="mobile-nav-icon-wrap">
              {item.icon}
              {item.badge && <span className="mobile-nav-dot" aria-label="Item in cart" />}
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
