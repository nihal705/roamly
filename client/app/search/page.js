import { HomeGrid } from "../../components/HomeGrid";
import { SearchBar } from "../../components/SearchBar";
const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export default async function Search({ searchParams }) {
  const params = await searchParams;
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  let homes = [];
  try {
    homes =
      (await (await fetch(`${api}/homes?${qs}`, { cache: "no-store" })).json())
        .homes || [];
  } catch {}
  return (
    <section className="section">
      <SearchBar initial={params} />
      <div className="section-heading search-heading">
        <div>
          <h1>Stays to explore</h1>
          <p>{homes.length} places match your search</p>
        </div>
      </div>
      <HomeGrid homes={homes} />
    </section>
  );
}
