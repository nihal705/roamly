import crypto from "crypto";
import Booking from "../models/Booking.js";
import Home from "../models/Home.js";
import { razorpay } from "../config/razorpay.js";
import { AppError, asyncHandler } from "../utils/appError.js";
import { makeBookingId, quote } from "../utils/price.js";
import { computeRefund } from "../utils/cancellation.js";

const heldStatuses = ["PENDING_PAYMENT", "AWAITING_ADMIN", "CONFIRMED", "ACTIVE"];

async function issueRefund(booking, amount, notes = {}) {
  if (!amount || !booking.razorpayPaymentId || booking.razorpayPaymentId === "demo_payment")
    return null;
  if (!razorpay) throw new AppError("Razorpay not configured, refund skipped", 503);
  const refund = await razorpay.payments.refund(booking.razorpayPaymentId, {
    amount: amount * 100,
    notes: { bookingId: booking.bookingId, ...notes },
  });
  booking.razorpayRefundId = refund.id;
  return refund;
}

export const createOrder = asyncHandler(async (req, res) => {
  const { homeId, checkIn, checkOut, guests } = req.body;

  const home = await Home.findOne({
    _id: homeId,
    status: "active",
    listingStatus: "active",
  });
  if (!home) throw new AppError("Home is unavailable", 404);

  if (Number(guests) > home.maxGuests)
    throw new AppError(`This home accepts up to ${home.maxGuests} guests`);

  const conflict = await Booking.exists({
    home: homeId,
    status: { $in: heldStatuses },
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  });
  if (conflict)
    throw new AppError("Those dates were just booked. Please choose other dates.", 409);

  const price = quote(home, checkIn, checkOut);
  const bookingId = makeBookingId();

  const booking = await Booking.create({
    bookingId,
    guest: req.user._id,
    home: homeId,
    checkIn,
    checkOut,
    guests,
    nights: price.nights,
    price,
  });

  if (!razorpay)
    return res.status(201).json({
      booking,
      demo: true,
      message: "Razorpay keys not configured — demo confirmation will be used.",
    });

  const order = await razorpay.orders.create({
    amount: price.total * 100,
    currency: "INR",
    receipt: bookingId,
    notes: { bookingId },
  });
  booking.razorpayOrderId = order.id;
  await booking.save();
  res.status(201).json({ booking, order, keyId: process.env.RAZORPAY_KEY_ID });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    bookingId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    demo,
  } = req.body;

  const booking = await Booking.findOne({ bookingId, guest: req.user._id });
  if (!booking) throw new AppError("Booking not found", 404);

  if (!demo) {
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    if (expected !== razorpay_signature)
      throw new AppError("Payment signature verification failed", 400);
  }

  if (booking.status !== "PENDING_PAYMENT")
    throw new AppError("This booking has already been processed", 409);

  booking.status = "AWAITING_ADMIN";
  booking.razorpayPaymentId = razorpay_payment_id || "demo_payment";
  await booking.save();
  res.json({ booking });
});

export const myBookings = asyncHandler(async (req, res) =>
  res.json({
    bookings: await Booking.find({ guest: req.user._id })
      .populate("home")
      .sort("-createdAt"),
  }),
);

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    guest: req.user._id,
  }).populate("home");
  if (!booking) throw new AppError("Booking not found", 404);
  res.json({ booking });
});

export const cancelQuote = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    guest: req.user._id,
  });
  if (!booking) throw new AppError("Booking not found", 404);
  if (!["PENDING_PAYMENT", "AWAITING_ADMIN", "CONFIRMED"].includes(booking.status))
    throw new AppError("This booking cannot be cancelled", 400);

  const info = computeRefund(booking);
  res.json({
    total: booking.price.total,
    refund: info.refund,
    percent: info.percent,
    daysUntilCheckIn: info.daysUntilCheckIn,
    reason: info.reason,
  });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    guest: req.user._id,
  });
  if (!booking) throw new AppError("Booking not found", 404);
  if (!["PENDING_PAYMENT", "AWAITING_ADMIN", "CONFIRMED"].includes(booking.status))
    throw new AppError("This booking cannot be cancelled");

  const info = computeRefund(booking);

  booking.status = "CANCELLED";
  booking.refundAmount = info.refund;
  booking.cancelReason = req.body.reason || "Cancelled by guest";
  booking.cancelledBy = "guest";
  await issueRefund(booking, info.refund, { reason: "guest_cancellation" });
  await booking.save();

  res.json({ booking, refundAmount: info.refund, reason: info.reason });
});

export const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.get("x-razorpay-signature");
  if (!process.env.RAZORPAY_WEBHOOK_SECRET || !signature)
    throw new AppError("Webhook signature is missing", 400);

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.body)
    .digest("hex");

  try {
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature)))
      throw new AppError("Invalid webhook signature", 400);
  } catch {
    throw new AppError("Invalid webhook signature", 400);
  }

  const event = JSON.parse(req.body.toString("utf8"));
  const payment = event.payload?.payment?.entity;
  if (event.event === "payment.captured" && payment?.order_id) {
    await Booking.findOneAndUpdate(
      { razorpayOrderId: payment.order_id, status: "PENDING_PAYMENT" },
      { status: "AWAITING_ADMIN", razorpayPaymentId: payment.id },
    );
  }
  res.status(200).json({ received: true });
});