import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        © {new Date().getFullYear()} Roamly · Demo project ·{" "}
        <Link href="/terms">Terms & Disclaimer</Link>
      </div>
      <div>English (IN) · ₹ INR</div>
    </footer>
  );
}