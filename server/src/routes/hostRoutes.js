import { Router } from "express";
import {
  hostBookings,
  hostConfirmBooking,
  hostRejectBooking,
} from "../controllers/hostController.js";
import { allow, protect } from "../middleware/auth.js";

const router = Router();
router.use(protect, allow("host", "admin"));

router.get("/bookings", hostBookings);
router.patch("/bookings/:id/confirm", hostConfirmBooking);
router.patch("/bookings/:id/reject", hostRejectBooking);

export default router;