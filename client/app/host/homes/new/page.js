"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function NewHomePage() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function onPickFiles(e) {
    const picked = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...picked]);
    setPreviews((prev) => [...prev, ...picked.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  }

  function removeFile(idx) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    const fd = new FormData(e.currentTarget);
    fd.delete("images"); // native file input — we append File objects manually

    // Build structured fields
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
    fd.delete("city");
    fd.delete("state");

    // Append each picked file under the "images" field
    files.forEach((f) => fd.append("images", f));

    const r = await fetch(`${api}/homes`, {
      method: "POST",
      credentials: "include",
      body: fd, // ⚠️ Do NOT set Content-Type — browser sets multipart boundary
    });
    setBusy(false);

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      return setMessage(err.message || "Something went wrong");
    }
    router.push("/host/homes");
  }

  return (
    <section className="section form-page">
      <h1>List your home</h1>
      <p className="muted">New listings are reviewed before being published.</p>

      <form onSubmit={submit} className="form grid-form">
        <label>Title<input name="title" required /></label>
        <label>City<input name="city" required /></label>
        <label>State<input name="state" /></label>
        <label>Category<input name="category" defaultValue="Design" /></label>
        <label>Price per night (₹)<input name="pricePerNight" type="number" required min="1" /></label>
        <label>Cleaning fee (₹)<input name="cleaningFee" type="number" min="0" defaultValue={500} /></label>
        <label>Max guests<input name="maxGuests" type="number" required min="1" defaultValue={2} /></label>
        <label>Bedrooms<input name="bedrooms" type="number" required min="1" defaultValue={1} /></label>
        <label>Beds<input name="beds" type="number" required min="1" defaultValue={1} /></label>
        <label>Bathrooms<input name="bathrooms" type="number" required min="1" defaultValue={1} /></label>
        <label>Amenities (comma separated)<input name="amenities" placeholder="Wifi, Kitchen, Pool" /></label>

        <label className="full-width">
          Photos (up to 10, max 5 MB each)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={onPickFiles}
          />
        </label>

        {previews.length > 0 && (
          <div className="preview-grid full-width">
            {previews.map((src, i) => (
              <div className="preview-tile" key={i}>
                <img src={src} alt="" />
                <button type="button" onClick={() => removeFile(i)} aria-label="Remove">×</button>
              </div>
            ))}
          </div>
        )}

        <label className="full-width">
          Description
          <textarea name="description" required minLength={20} />
        </label>

        <button disabled={busy}>{busy ? "Submitting…" : "Submit listing"}</button>
        {message && <p className="notice full-width">{message}</p>}
      </form>
    </section>
  );
}