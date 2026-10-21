import { Router } from "express";
import {
  approveHome,
  confirmBooking,
  dashboard,
  listBookings,
  listHomes,
  rejectBooking,
  rejectHome,
} from "../controllers/adminController.js";
import { allow, protect } from "../middleware/auth.js";

const router = Router();

router.use(protect, allow("admin"));
router.get("/dashboard", dashboard);
router.get("/bookings", listBookings);
router.patch("/bookings/:id/confirm", confirmBooking);
router.patch("/bookings/:id/reject", rejectBooking);
router.get("/homes", listHomes);
router.patch("/homes/:id/approve", approveHome);
router.patch("/homes/:id/reject", rejectHome);

export default router;