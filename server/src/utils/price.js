export function quote(home, checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (isNaN(start) || isNaN(end)) throw new Error("Invalid dates");
  const nights = Math.ceil((end - start) / 86400000);
  if (!Number.isFinite(nights) || nights < 1)
    throw new Error("Check-out must be after check-in");
  const subtotal = nights * home.pricePerNight;
  const discount =
    nights >= 28
      ? Math.round(subtotal * 0.2)
      : nights >= 7
        ? Math.round(subtotal * 0.1)
        : 0;
  const cleaningFee = home.cleaningFee || 0;
  const serviceFee = Math.round((subtotal - discount) * 0.12);
  const taxes = Math.round((subtotal - discount + cleaningFee + serviceFee) * 0.18);
  return {
    nights,
    subtotal,
    discount,
    cleaningFee,
    serviceFee,
    taxes,
    total: subtotal - discount + cleaningFee + serviceFee + taxes,
  };
}

export function makeBookingId() {
  return `AIR-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}