import { Router } from "express";
import User from "../models/User.js";
import Home from "../models/Home.js";
import { protect } from "../middleware/auth.js";
import { AppError, asyncHandler } from "../utils/appError.js";

const router = Router();

router.use(protect);

router.get(
  "/favourites",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("favourites");
    res.json({ homes: user.favourites });
  }),
);

router.post(
  "/favourites/:homeId",
  asyncHandler(async (req, res) => {
    if (!(await Home.exists({ _id: req.params.homeId })))
      throw new AppError("Home not found", 404);
    const user = await User.findById(req.user._id);
    const id = req.params.homeId;
    user.favourites = user.favourites.some((item) => item.equals(id))
      ? user.favourites.filter((item) => !item.equals(id))
      : [...user.favourites, id];
    await user.save();
    res.json({ favourites: user.favourites });
  }),
);

router.post(
  "/become-a-host",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) throw new AppError("User not found", 404);

    if (user.role === "guest") {
      user.role = "host";
      await user.save();
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }),
);

export default router;