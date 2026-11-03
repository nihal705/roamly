import { notFound } from "next/navigation";
import Link from "next/link";
import { BookingCard } from "../../../components/BookingCard";
import { FavouriteButton } from "../../../components/FavouriteButton";
import { ImageGallery } from "../../../components/ImageGallery";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getHome(id) {
  try {
    const res = await fetch(`${api}/homes/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()).home;
  } catch {
    return null;
  }
}

const FALLBACK =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

export default async function HomeDetailPage({ params }) {
  const { id } = await params;
  const home = await getHome(id);
  if (!home) notFound();

  const images = home.images?.length ? home.images : [FALLBACK];

  return (
    <section className="section detail">
      <div className="title-row">
        <h1>{home.title}</h1>
        <FavouriteButton homeId={home._id} />
      </div>

      <p className="muted">
        ★ {home.rating} · {home.reviewCount} reviews ·{" "}
        {home.location.city}
        {home.location.state ? `, ${home.location.state}` : ""}
      </p>

      <ImageGallery images={images} title={home.title} />

      <div className="detail-columns">
        <article>
          <h2>
            {home.category} hosted by {home.host?.name || "a host"}
          </h2>
          <p>
            {home.maxGuests} guests · {home.bedrooms} bedrooms · {home.beds} beds ·{" "}
            {home.bathrooms} bathrooms
          </p>
          <hr />
          <p>{home.description}</p>
          <hr />
          <h2>What this place offers</h2>
          <div className="amenities">
            {(home.amenities || []).map((a) => (
              <span key={a}>✦ {a}</span>
            ))}
          </div>
        </article>

        <BookingCard home={home} />
      </div>
    </section>
  );
}