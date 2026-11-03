"use client";
import { useState, useEffect } from "react";

const FALLBACK =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

function resolveImageUrl(url) {
  if (!url) return FALLBACK;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  const base =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
      : "");
  return base
    ? `${base.replace(/\/+$/, "")}${url.startsWith("/") ? "" : "/"}${url}`
    : url;
}

export function ImageGallery({ images = [], title = "Listing photo" }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const cleanImages = (images?.length ? images : [FALLBACK]).map(resolveImageUrl);
  const total = cleanImages.length;
  const displayCount = Math.min(total, 5);
  const displayImages = cleanImages.slice(0, displayCount);

  function openModal(idx) {
    setActiveIndex(idx);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function nextImage(e) {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % total);
  }

  function prevImage(e) {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }

  useEffect(() => {
    if (!modalOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    }
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [modalOpen, total]);

  return (
    <>
      <div className="gallery-container">
        <div
          className={`gallery gallery-${displayCount}`}
          data-count={displayCount}
        >
          {displayImages.map((img, i) => (
            <div
              key={i}
              className={`gallery-item gallery-item-${i + 1}`}
              onClick={() => openModal(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openModal(i);
                }
              }}
              aria-label={`View photo ${i + 1} of ${total}`}
            >
              <img
                src={img}
                alt={`${title} - Photo ${i + 1}`}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK;
                }}
              />
            </div>
          ))}
        </div>

        {total > 1 && (
          <button
            type="button"
            className="gallery-all-btn"
            onClick={() => openModal(0)}
            aria-label={`Show all ${total} photos`}
          >
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="currentColor"
              style={{ display: "inline-block", verticalAlign: "-2px" }}
            >
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 2.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z" />
            </svg>
            <span>Show all {total} photos</span>
          </button>
        )}
      </div>

      {modalOpen && (
        <div
          className="lightbox-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-header">
              <span className="lightbox-counter">
                {activeIndex + 1} / {total}
              </span>
              <button
                type="button"
                className="lightbox-close"
                onClick={closeModal}
                aria-label="Close photo gallery"
              >
                ✕
              </button>
            </div>

            <div className="lightbox-main">
              {total > 1 && (
                <button
                  type="button"
                  className="lightbox-arrow lightbox-prev"
                  onClick={prevImage}
                  aria-label="Previous photo"
                >
                  ‹
                </button>
              )}

              <div className="lightbox-image-wrap">
                <img
                  src={cleanImages[activeIndex]}
                  alt={`${title} - Photo ${activeIndex + 1}`}
                  className="lightbox-img"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK;
                  }}
                />
              </div>

              {total > 1 && (
                <button
                  type="button"
                  className="lightbox-arrow lightbox-next"
                  onClick={nextImage}
                  aria-label="Next photo"
                >
                  ›
                </button>
              )}
            </div>

            {total > 1 && (
              <div className="lightbox-thumbnails">
                {cleanImages.map((thumb, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`lightbox-thumb ${
                      idx === activeIndex ? "active" : ""
                    }`}
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Jump to photo ${idx + 1}`}
                  >
                    <img src={thumb} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
