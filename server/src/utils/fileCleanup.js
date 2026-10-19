import fs from "fs";
import path from "path";
import { UPLOAD_DIR_PATH } from "../middleware/upload.js";

// Deletes a file if it lives in our uploads folder. Safe to call with
// external URLs (Unsplash etc.) — those are silently ignored.
export function unlinkIfUploaded(url) {
  if (!url || typeof url !== "string") return;
  if (!url.startsWith("/uploads/")) return;

  const filename = path.basename(url.replace("/uploads/", ""));
  const full = path.join(UPLOAD_DIR_PATH, filename);

  fs.unlink(full, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Failed to delete upload:", full, err.message);
    }
  });
}