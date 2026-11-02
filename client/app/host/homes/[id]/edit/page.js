"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function HostEditHomePage({ params }) {
  const router = useRouter();
  const [id, setId] = useState(null);
  const [home, setHome] = useState(null);
  const [removed, setRemoved] = useState([]); // URLs marked for deletion
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`${api}/homes/${id}`)
      .then((r) => r.json())
      .then((d) => setHome(d.home))
      .catch(() => setMessage("Unable to load home."));
  }, [id]);

  function toggleRemove(url) {
    setRemoved((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
    );
  }

  function onPickFiles(e) {
    const picked = Array.from(e.target.files || []);
    setNewFiles((prev) => [...prev, ...picked]);
    setNewPreviews((prev) => [...prev, ...picked.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  }

  function removeNew(idx) {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    const fd = new FormData(e.currentTarget);
    fd.delete("images");

    fd.set(
      "location",
      JSON.stringify({ city: fd.get("city"), state: fd.get("state") || "" }),
    );
    fd.set(
      "amenities",
      JSON.stringify(
        String(fd.get("amenities") || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      ),
    );
    fd.set("removedImages", JSON.stringify(removed));
    fd.delete("city");
    fd.delete("state");

    newFiles.forEach((f) => fd.append("images", f));

    const r = await fetch(`${api}/homes/${id}`, {
      method: "PATCH",
      credentials: "include",
      body: fd,
    });
    setBusy(false);

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      return setMessage(err.message || "Unable to save");
    }
    router.push("/host/homes");
    router.refresh();
  }

  if (!home)
    return (
      <section className="section">
        <p className="empty">Loading…</p>
      </section>
    );

  return (
    <section className="section form-page">
      <h1>Edit listing</h1>
      <form onSubmit={submit} className="form grid-form">
        <label>Title<input name="title" defaultValue={home.title} required /></label>
        <label>City<input name="city" defaultValue={home.location?.city} required /></label>
        <label>State<input name="state" defaultValue={home.location?.state || ""} /></label>
        <label>Category<input name="category" defaultValue={home.category} /></label>
        <label>Price per night (₹)<input name="pricePerNight" type="number" defaultValue={home.pricePerNight} required /></label>
        <label>Cleaning fee (₹)<input name="cleaningFee" type="number" defaultValue={home.cleaningFee} /></label>
        <label>Max guests<input name="maxGuests" type="number" defaultValue={home.maxGuests} required /></label>
        <label>Bedrooms<input name="bedrooms" type="number" defaultValue={home.bedrooms} required /></label>
        <label>Beds<input name="beds" type="number" defaultValue={home.beds} required /></label>
        <label>Bathrooms<input name="bathrooms" type="number" defaultValue={home.bathrooms} required /></label>
        <label>Amenities<input name="amenities" defaultValue={(home.amenities || []).join(", ")} /></label>

        <div className="full-width">
          <p className="field-label">Current photos</p>
          <div className="preview-grid">
            {(home.images || []).map((url) => {
              const isRemoved = removed.includes(url);
              return (
                <div className={`preview-tile ${isRemoved ? "removed" : ""}`} key={url}>
                  <img src={url} alt="" />
                  <button
                    type="button"
                    onClick={() => toggleRemove(url)}
                    title={isRemoved ? "Undo remove" : "Remove"}
                    aria-label={isRemoved ? "Undo" : "Remove"}
                  >
                    {isRemoved ? "↺" : "×"}
                  </button>
                </div>
              );
            })}
            {(home.images || []).length === 0 && (
              <p className="muted">No photos yet.</p>
            )}
          </div>
          {removed.length > 0 && (
            <p className="muted">
              {removed.length} photo{removed.length > 1 ? "s" : ""} will be deleted when you save.
            </p>
          )}
        </div>

        <label className="full-width">
          Add new photos
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={onPickFiles}
          />
        </label>

        {newPreviews.length > 0 && (
          <div className="preview-grid full-width">
            {newPreviews.map((src, i) => (
              <div className="preview-tile" key={i}>
                <img src={src} alt="" />
                <button type="button" onClick={() => removeNew(i)} aria-label="Remove">×</button>
              </div>
            ))}
          </div>
        )}

        <label className="full-width">
          Description
          <textarea name="description" defaultValue={home.description} required />
        </label>

        <button disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
        {message && <p className="notice full-width">{message}</p>}
      </form>
    </section>
  );
}