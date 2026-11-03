import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

/**
 * Uploads an in-memory file buffer to Cloudinary.
 * Returns { url, publicId }.
 */
export function uploadBufferToCloudinary(buffer, folder = "roamly/homes") {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}