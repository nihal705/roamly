import Home from "../models/Home.js";
import Booking from "../models/Booking.js";
import { AppError, asyncHandler } from "../utils/appError.js";
import { quote } from "../utils/price.js";
import {
  unlinkIfUploaded,
  destroyCloudinaryImage,
} from "../utils/fileCleanup.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryHelper.js";

const unavailableStatuses = ["AWAITING_ADMIN", "CONFIRMED", "ACTIVE"];

function parseJSONField(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function coerceNumbers(data) {
  ["pricePerNight", "cleaningFee", "maxGuests", "bedrooms", "beds", "bathrooms"].forEach((k) => {
    if (data[k] !== undefined && data[k] !== "") data[k] = Number(data[k]);
  });
  return data;
}

/* ------------------------------------------------------------------ */
/* PUBLIC                                                              */
/* ------------------------------------------------------------------ */

export const listHomes = asyncHandler(async (req, res) => {
  const {
    location,
    category,
    guests,
    minPrice,
    maxPrice,
    checkIn,
    checkOut,
    page = 1,
    limit = 24,
  } = req.query;

  const filter = {
    status: "active",
    listingStatus: "active",
  };

  if (location)
    filter.$or = [
      { "location.city": { $regex: location, $options: "i" } },
      { "location.state": { $regex: location, $options: "i" } },
    ];
  if (category) filter.category = category;
  if (guests) filter.maxGuests = { $gte: Number(guests) };
  if (minPrice || maxPrice)
    filter.pricePerNight = {
      ...(minPrice && { $gte: Number(minPrice) }),
      ...(maxPrice && { $lte: Number(maxPrice) }),
    };

  if (checkIn && checkOut) {
    const blocked = await Booking.find({
      status: { $in: unavailableStatuses },
      checkIn: { $lt: new Date(checkOut) },
      checkOut: { $gt: new Date(checkIn) },
    }).distinct("home");
    if (blocked.length) filter._id = { $nin: blocked };
  }

  const [homes, total] = await Promise.all([
    Home.find(filter)
      .populate("host", "name")
      .sort("-createdAt")
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
    Home.countDocuments(filter),
  ]);

  res.json({
    homes,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

export const getHome = asyncHandler(async (req, res) => {
  const home = await Home.findOne({
    _id: req.params.id,
    status: { $ne: "deleted" },
  }).populate("host", "name");
  if (!home) throw new AppError("Home not found", 404);
  res.json({ home });
});

export const getQuote = asyncHandler(async (req, res) => {
  const home = await Home.findById(req.params.id);
  if (!home) throw new AppError("Home not found", 404);
  try {
    res.json({ quote: quote(home, req.query.checkIn, req.query.checkOut) });
  } catch (e) {
    throw new AppError(e.message, 400);
  }
});

export const getBookedDates = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({
    home: req.params.id,
    status: { $in: unavailableStatuses },
    checkOut: { $gte: new Date() },
  })
    .select("checkIn checkOut -_id")
    .sort("checkIn");
  res.json({ ranges: bookings });
});

/* ------------------------------------------------------------------ */
/* HOST                                                                */
/* ------------------------------------------------------------------ */

export const createHome = asyncHandler(async (req, res) => {
  const urlImages = Array.isArray(req.body.images)
    ? req.body.images.filter(Boolean)
    : (req.body.images || "").split("\n").map((s) => s.trim()).filter(Boolean);

  // Upload all new files to Cloudinary in parallel
  const uploaded = await Promise.all(
    (req.files || []).map((f) => uploadBufferToCloudinary(f.buffer)),
  );
  const newUrls = uploaded.map((u) => u.url);
  const newPublicIds = uploaded.map((u) => u.publicId);

  const data = coerceNumbers({
    ...req.body,
    host: req.user._id,
    images: [...urlImages, ...newUrls],
    imagePublicIds: newPublicIds,
    location: parseJSONField(req.body.location, {
      city: req.body.city,
      state: req.body.state,
    }),
    amenities: parseJSONField(req.body.amenities, []),
    status: "pending_approval",
    listingStatus: "active",
  });
  delete data.city;
  delete data.state;

  const home = await Home.create(data);
  res.status(201).json({ home });
});

export const updateHome = asyncHandler(async (req, res) => {
  const home = await Home.findOne({ _id: req.params.id, host: req.user._id });
  if (!home) throw new AppError("Home not found", 404);

  // Handle image removals first
  const removed = parseJSONField(req.body.removedImages, []);
  if (removed.length) {
    const keepUrls = [];
    const keepPublicIds = [];
    for (let i = 0; i < home.images.length; i++) {
      const url = home.images[i];
      const publicId = home.imagePublicIds?.[i];
      if (removed.includes(url)) {
        if (publicId) await destroyCloudinaryImage(publicId);
        else unlinkIfUploaded(url); // legacy local file
      } else {
        keepUrls.push(url);
        keepPublicIds.push(publicId || null);
      }
    }
    home.images = keepUrls;
    home.imagePublicIds = keepPublicIds;
  }

  // Upload new files
  if (req.files && req.files.length) {
    const uploaded = await Promise.all(
      req.files.map((f) => uploadBufferToCloudinary(f.buffer)),
    );
    home.images = [...home.images, ...uploaded.map((u) => u.url)];
    home.imagePublicIds = [
      ...(home.imagePublicIds || []),
      ...uploaded.map((u) => u.publicId),
    ];
  }

  // Scalar fields
  ["title", "description", "category"].forEach((k) => {
    if (req.body[k] !== undefined) home[k] = req.body[k];
  });
  ["pricePerNight", "cleaningFee", "maxGuests", "bedrooms", "beds", "bathrooms"].forEach((k) => {
    if (req.body[k] !== undefined && req.body[k] !== "") home[k] = Number(req.body[k]);
  });
  if (req.body.location !== undefined)
    home.location = parseJSONField(req.body.location, home.location);
  if (req.body.amenities !== undefined)
    home.amenities = parseJSONField(req.body.amenities, home.amenities);

  await home.save();
  res.json({ home });
});

export const deleteHome = asyncHandler(async (req, res) => {
  const query =
    req.user.role === "admin"
      ? { _id: req.params.id }
      : { _id: req.params.id, host: req.user._id };
  const home = await Home.findOne(query);
  if (!home) throw new AppError("Home not found", 404);

  // Delete every image, Cloudinary or legacy local
  for (let i = 0; i < (home.images || []).length; i++) {
    const publicId = home.imagePublicIds?.[i];
    if (publicId) {
      try {
        await destroyCloudinaryImage(publicId);
      } catch (err) {
        console.error("Cloudinary destroy failed:", err);
      }
    } else {
      unlinkIfUploaded(home.images[i]);
    }
  }
  home.status = "deleted";
  home.images = [];
  home.imagePublicIds = [];
  await home.save();
  res.status(204).send();
});

export const hostHomes = asyncHandler(async (req, res) =>
  res.json({
    homes: await Home.find({
      host: req.user._id,
      status: { $ne: "deleted" },
    }).sort("-createdAt"),
  }),
);

export const deleteHomeImage = asyncHandler(async (req, res) => {
  const { url } = req.body;
  if (!url) throw new AppError("Image url is required");

  const home = await Home.findOne({ _id: req.params.id, host: req.user._id });
  if (!home) throw new AppError("Home not found", 404);

  const idx = home.images.indexOf(url);
  if (idx !== -1) {
    const publicId = home.imagePublicIds?.[idx];
    if (publicId) await destroyCloudinaryImage(publicId);
    else unlinkIfUploaded(url);
    home.images.splice(idx, 1);
    if (home.imagePublicIds) home.imagePublicIds.splice(idx, 1);
  }

  await home.save();
  res.json({ home });
});

export const toggleListingStatus = asyncHandler(async (req, res) => {
  const home = await Home.findOne({ _id: req.params.id, host: req.user._id });
  if (!home) throw new AppError("Home not found", 404);
  if (home.listingStatus === "booked")
    throw new AppError("This home has an active booking and cannot be paused", 400);
  home.listingStatus = home.listingStatus === "paused" ? "active" : "paused";
  await home.save();
  res.json({ home });
});

export const availability = asyncHandler(async (req, res) => {
  const conflicts = await Booking.exists({
    home: req.params.id,
    status: { $in: unavailableStatuses },
    checkIn: { $lt: new Date(req.query.checkOut) },
    checkOut: { $gt: new Date(req.query.checkIn) },
  });
  res.json({ available: !conflicts });
});