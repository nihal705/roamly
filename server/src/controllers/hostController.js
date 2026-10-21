import Booking from "../models/Booking.js";
import Home from "../models/Home.js";
import { AppError, asyncHandler } from "../utils/appError.js";
import { razorpay } from "../config/razorpay.js";

export const hostBookings = asyncHandler(async (req, res) => {
  const homes = await Home.find({ host: req.user._id }).distinct("_id");
  const bookings = await Booking.find({ home: { $in: homes } })
    .populate("guest", "name email")
    .populate("home", "title location images")
    .sort("-createdAt");
  res.json({ bookings });
});

export const hostConfirmBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("home");
  if (!booking) throw new AppError("Booking not found", 404);
  if (!booking.home || booking.home.host.toString() !== req.user._id.toString())
    throw new AppError("You do not own this home", 403);
  if (booking.status !== "AWAITING_ADMIN")
    throw new AppError("Booking is not awaiting approval", 400);

  booking.status = "CONFIRMED";
  booking.adminConfirmedBy = req.user._id;
  booking.adminConfirmedAt = new Date();
  await booking.save();

  res.json({ booking });
});

export const hostRejectBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("home");
  if (!booking) throw new AppError("Booking not found", 404);
  if (!booking.home || booking.home.host.toString() !== req.user._id.toString())
    throw new AppError("You do not own this home", 403);
  if (booking.status !== "AWAITING_ADMIN")
    throw new AppError("Booking is not awaiting approval", 400);

  booking.status = "REJECTED";
  booking.cancelledBy = "host";
  booking.refundAmount = booking.price.total;
  if (
    booking.razorpayPaymentId &&
    booking.razorpayPaymentId !== "demo_payment" &&
    razorpay
  ) {
    const refund = await razorpay.payments.refund(booking.razorpayPaymentId, {
      amount: booking.price.total * 100,
      notes: { bookingId: booking.bookingId, reason: "host_rejection" },
    });
    booking.razorpayRefundId = refund.id;
  }
  await booking.save();
  res.json({ booking });
});