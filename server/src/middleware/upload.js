import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR_PATH = path.join(__dirname, "..", "..", "uploads");

// Ensure the uploads dir exists at boot
if (!fs.existsSync(UPLOAD_DIR_PATH)) {
  fs.mkdirSync(UPLOAD_DIR_PATH, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR_PATH),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
    file.mimetype,
  );
  if (!ok) return cb(new Error("Only JPEG, PNG and WebP images are allowed"));
  cb(null, true);
};

export const uploadHomeImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
}).array("images", 10);