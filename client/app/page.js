import Link from "next/link";
import { HomeGrid } from "../components/HomeGrid";
import { SearchBar } from "../components/SearchBar";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getHomes() {
  try {
    const res = await fetch(`${api}/homes`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.homes || [];
  } catch {
    return [];
  }
}

const CATEGORIES = ["Amazing pools", "Cabins", "Design", "Beachfront", "Mansions", "Trending"];

export default async function LandingPage() {
  const homes = await getHomes();
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">NOT ALONE, BUT TOGETHER</p>
          <h1>Find a stay that feels like yours.</h1>
          <p className="hero-copy">
            Beautiful places, thoughtful hosts, and room for your next story.
          </p>
        </div>
        <SearchBar />
      </section>

      <section className="category-pills">
        {CATEGORIES.map((c) => (
          <Link key={c} href={`/search?category=${encodeURIComponent(c)}`}>
            <span>{c}</span>
          </Link>
        ))}
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Homes guests love</h2>
            <p>Handpicked places across India.</p>
          </div>
          <Link href="/search">Explore all stays →</Link>
        </div>
        <HomeGrid homes={homes} />
      </section>
    </>
  );
}