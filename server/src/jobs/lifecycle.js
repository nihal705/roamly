import cron from "node-cron";
import Booking from "../models/Booking.js";

export function startBookingLifecycle() {
  cron.schedule("5 0 * * *", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // CONFIRMED → ACTIVE
    await Booking.updateMany(
      { status: "CONFIRMED", checkIn: { $lte: today } },
      { status: "ACTIVE" },
    );

    // ACTIVE → COMPLETED
    await Booking.updateMany(
      { status: "ACTIVE", checkOut: { $lt: today } },
      { status: "COMPLETED" },
    );

    // Expire stale PENDING_PAYMENT
    await Booking.updateMany(
      {
        status: "PENDING_PAYMENT",
        createdAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) },
      },
      { status: "EXPIRED" },
    );
  });
}