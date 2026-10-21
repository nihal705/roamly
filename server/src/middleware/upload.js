import multer from "multer";

const storage = multer.memoryStorage();

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