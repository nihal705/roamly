import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinary.js";

const LEGACY_UPLOAD_DIR = path.join(process.cwd(), "uploads");

/**
 * Deletes a legacy locally-uploaded file.
 * Safe to call with external URLs (Unsplash etc.) — those are ignored.
 */
export function unlinkIfUploaded(url) {
  if (!url || typeof url !== "string") return;
  if (!url.startsWith("/uploads/")) return;

  const filename = path.basename(url);
  const full = path.join(LEGACY_UPLOAD_DIR, filename);

  fs.unlink(full, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Failed to delete local upload:", full, err.message);
    }
  });
}

/**
 * Deletes an image from Cloudinary by its public_id.
 * Skips silently if publicId is falsy.
 */
export async function destroyCloudinaryImage(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary destroy failed:", publicId, err.message);
  }
}