import { Router } from "express";
import {
  cancelBooking,
  cancelQuote,
  createOrder,
  getBooking,
  myBookings,
  verifyPayment,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/mine", myBookings);
router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.get("/:id", getBooking);
router.get("/:id/cancel-quote", cancelQuote);
router.post("/:id/cancel", cancelBooking);

export default router;