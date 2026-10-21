import Booking from "../models/Booking.js";
import Home from "../models/Home.js";
import { razorpay } from "../config/razorpay.js";
import { AppError, asyncHandler } from "../utils/appError.js";

export const dashboard = asyncHandler(async (req, res) => {
  const [pending, confirmed, homes, pendingHomes] = await Promise.all([
    Booking.countDocuments({ status: "AWAITING_ADMIN" }),
    Booking.countDocuments({ status: "CONFIRMED" }),
    Home.countDocuments({ status: "active" }),
    Home.countDocuments({ status: "pending_approval" }),
  ]);
  res.json({ pending, confirmed, homes, pendingHomes });
});

export const listBookings = asyncHandler(async (req, res) =>
  res.json({
    bookings: await Booking.find(req.query.status ? { status: req.query.status } : {})
      .populate("guest", "name email")
      .populate("home", "title location")
      .sort("-createdAt"),
  }),
);

export const confirmBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking || booking.status !== "AWAITING_ADMIN")
    throw new AppError("Booking is not awaiting approval", 400);
  booking.status = "CONFIRMED";
  booking.adminConfirmedBy = req.user._id;
  booking.adminConfirmedAt = new Date();
  await booking.save();
  res.json({ booking });
});

export const rejectBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking || booking.status !== "AWAITING_ADMIN")
    throw new AppError("Booking is not awaiting approval", 400);
  booking.status = "REJECTED";
  booking.cancelledBy = "admin";
  booking.refundAmount = booking.price.total;
  if (
    booking.razorpayPaymentId &&
    booking.razorpayPaymentId !== "demo_payment" &&
    razorpay
  ) {
    const refund = await razorpay.payments.refund(booking.razorpayPaymentId, {
      amount: booking.price.total * 100,
      notes: { bookingId: booking.bookingId, reason: "admin_rejection" },
    });
    booking.razorpayRefundId = refund.id;
  }
  await booking.save();
  res.json({ booking });
});

export const listHomes = asyncHandler(async (req, res) => {
  const status = req.query.status || "pending_approval";
  res.json({
    homes: await Home.find({ status })
      .populate("host", "name email")
      .sort("-createdAt"),
  });
});

export const approveHome = asyncHandler(async (req, res) => {
  const home = await Home.findByIdAndUpdate(
    req.params.id,
    { status: "active" },
    { new: true },
  );
  if (!home) throw new AppError("Home not found", 404);
  res.json({ home });
});

export const rejectHome = asyncHandler(async (req, res) => {
  const home = await Home.findByIdAndUpdate(
    req.params.id,
    { status: "rejected" },
    { new: true },
  );
  if (!home) throw new AppError("Home not found", 404);
  res.json({ home });
});