/**
 * Returns { refund, percent, daysUntilCheckIn, hoursSinceBooking, reason }.
 * Used by both the cancel-quote (preview) and cancel (actual) endpoints
 * so the amount the user sees is always the amount they get.
 */
export function computeRefund(booking) {
  const now = new Date();
  const checkIn = new Date(booking.checkIn);
  const createdAt = new Date(booking.createdAt);

  const daysUntilCheckIn = Math.ceil((checkIn - now) / 86400000);
  const hoursSinceBooking = (now - createdAt) / 3600000;

  const total = booking.price?.total || 0;

  // Cancel within 24h of booking, check-in at least 2 days away → full refund
  if (hoursSinceBooking <= 24 && daysUntilCheckIn >= 2) {
    return {
      refund: total,
      percent: 100,
      daysUntilCheckIn,
      hoursSinceBooking,
      reason: "Free cancellation (within 24h of booking, check-in > 2 days away)",
    };
  }

  if (daysUntilCheckIn >= 7) {
    return {
      refund: total,
      percent: 100,
      daysUntilCheckIn,
      hoursSinceBooking,
      reason: "Free cancellation (7+ days before check-in)",
    };
  }

  if (daysUntilCheckIn >= 3) {
    return {
      refund: Math.round(total * 0.5),
      percent: 50,
      daysUntilCheckIn,
      hoursSinceBooking,
      reason: "Partial refund (3–6 days before check-in)",
    };
  }

  return {
    refund: 0,
    percent: 0,
    daysUntilCheckIn,
    hoursSinceBooking,
    reason: "No refund (< 3 days before check-in)",
  };
}