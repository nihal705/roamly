import { Router } from "express";
import {
  availability,
  createHome,
  deleteHome,
  deleteHomeImage,
  getBookedDates,
  getHome,
  getQuote,
  hostHomes,
  listHomes,
  toggleListingStatus,
  updateHome,
} from "../controllers/homeController.js";
import { allow, protect } from "../middleware/auth.js";
import { uploadHomeImages } from "../middleware/upload.js";

const router = Router();

// Public
router.get("/", listHomes);
router.get("/:id/quote", getQuote);
router.get("/:id/availability", availability);
router.get("/:id/booked-dates", getBookedDates);
router.get("/:id", getHome);

// Host
router.get("/host/mine", protect, allow("host", "admin"), hostHomes);
router.post("/", protect, allow("host", "admin"), uploadHomeImages, createHome);
router.patch("/:id", protect, allow("host", "admin"), uploadHomeImages, updateHome);
router.post("/:id/delete-image", protect, allow("host", "admin"), deleteHomeImage);
router.patch("/:id/toggle-listing", protect, allow("host", "admin"), toggleListingStatus);
router.delete("/:id", protect, allow("host", "admin"), deleteHome);

export default router;