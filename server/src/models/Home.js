import mongoose from "mongoose";

const homeSchema = new mongoose.Schema(
  {
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 2000 },
    location: {
      city: { type: String, required: true },
      state: String,
      country: { type: String, default: "India" },
    },
    category: { type: String, default: "Design" },
    pricePerNight: { type: Number, required: true, min: 1 },
    cleaningFee: { type: Number, default: 500, min: 0 },
    maxGuests: { type: Number, default: 2, min: 1 },
    bedrooms: { type: Number, default: 1, min: 1 },
    beds: { type: Number, default: 1, min: 1 },
    bathrooms: { type: Number, default: 1, min: 1 },
    amenities: [String],
    images: [String],
    imagePublicIds: [String],   // ← NEW: parallel to images[], used for Cloudinary deletion
    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "pending_approval", "rejected", "deleted"],
      default: "pending_approval",
    },
    listingStatus: {
      type: String,
      enum: ["active", "paused", "booked"],
      default: "active",
    },
  },
  { timestamps: true },
);

homeSchema.index({ "location.city": 1, category: 1, status: 1 });
homeSchema.index({ status: 1, listingStatus: 1 });

export default mongoose.model("Home", homeSchema);