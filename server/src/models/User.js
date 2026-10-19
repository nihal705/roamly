import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["guest", "host", "admin"], default: "guest" },
    favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Home" }],
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
