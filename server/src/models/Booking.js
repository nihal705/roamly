import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    guest: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    home: { type: mongoose.Schema.Types.ObjectId, ref: "Home", required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    nights: Number,
    price: {
      subtotal: Number,
      discount: Number,
      cleaningFee: Number,
      serviceFee: Number,
      taxes: Number,
      total: Number,
    },
    status: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "AWAITING_ADMIN",
        "CONFIRMED",
        "ACTIVE",
        "COMPLETED",
        "CANCELLED",
        "REJECTED",
        "EXPIRED",
      ],
      default: "PENDING_PAYMENT",
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpayRefundId: String,
    refundAmount: { type: Number, default: 0 },
    cancelReason: String,
    cancelledBy: { type: String, enum: ["guest", "admin", "system"] },
    adminConfirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminConfirmedAt: Date,
  },
  { timestamps: true },
);

bookingSchema.index({ home: 1, checkIn: 1, checkOut: 1, status: 1 });

export default mongoose.model("Booking", bookingSchema);