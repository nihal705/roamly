import Link from "next/link";

const FALLBACK =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80";

export function HomeGrid({ homes }) {
  if (!homes?.length)
    return (
      <p className="empty">
        No homes found yet. Hosts' listings appear here once admin approves them.
      </p>
    );
  return (
    <div className="home-grid">
      {homes.map((home) => (
        <Link href={`/homes/${home._id}`} className="home-card" key={home._id}>
          <div className="image-wrap">
            <img src={home.images?.[0] || FALLBACK} alt={home.title} />
            <span>♡</span>
          </div>
          <div className="card-top">
            <b>
              {home.location?.city}
              {home.location?.state ? `, ${home.location.state}` : ""}
            </b>
            <em>★ {home.rating}</em>
          </div>
          <p>
            {home.category} · {home.bedrooms} bedroom
            {home.bedrooms > 1 ? "s" : ""}
          </p>
          <strong>
            ₹{home.pricePerNight.toLocaleString()} <small>night</small>
          </strong>
        </Link>
      ))}
    </div>
  );
}