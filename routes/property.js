const express  = require("express");
const router   = express.Router();
const multer   = require("multer");
const Property = require("../models/Property");
const Location = require("../models/Location");
const User     = require("../models/User");

/* ================= MULTER ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

const propertyUpload = upload.fields([
  { name: "images", maxCount: 10 },
  { name: "video",  maxCount: 1  },
]);

/* ================= HELPERS ================= */
// const slugify = (text) =>
//   text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")        // space -> -
    .replace(/[^\w\-]+/g, "")    // remove special chars
    .replace(/\-\-+/g, "-");     // multiple - -> single
};
const parseJSON = (data, fallback = []) => {
  if (!data) return fallback;
  if (Array.isArray(data)) return data;
  if (typeof data === "string") {
    try { return JSON.parse(data); }
    catch { return data.includes(",") ? data.split(",") : [data]; }
  }
  return fallback;
};

const COMPANY_PHONE = "9876543210";

/* ================= GET BY SLUG ================= */
router.get("/slug/:slug", async (req, res) => {
  try {
    const property = await Property.findOne({ slug: req.params.slug })
      .populate("user_id", "firstName lastName phone role");

    if (!property) return res.status(404).json({ message: "Property not found" });

    const owner = property.user_id;
    const result = property.toObject();

    result.owner_name = `${owner.firstName} ${owner.lastName}`;
    result.user_phone = owner.phone;
    result.user_role  = owner.role;
    result.phone      = owner.role === "Broker" ? owner.phone : COMPANY_PHONE;

    return res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ================= MENU ================= */
// router.get("/menu", async (req, res) => {
//   try {
//     const properties = await Property.find({ status: 1 }, "propertyType rooms title pgType");

//     const menu = { Houses: [], Flats: [], "PG/Hostel": [] };

//     menu.Houses.push(    { title: "All Houses",     path: "/property/all-houses" });
//     menu.Flats.push(     { title: "All Flats",      path: "/property/all-flats"  });
//     menu["PG/Hostel"].push({ title: "All PG/Hostel", path: "/property/all-pg"   });

//     const seenHouses = new Set();
//     const seenFlats  = new Set();
//     const seenPg     = new Set();

//     properties.forEach((item) => {
//       if (!item.propertyType) return;
//       const type = item.propertyType.toLowerCase().trim();
//       let slug = "", displayTitle = "";

//       if (type === "house" || type === "houses") {
//         slug         = item.rooms ? `${item.rooms}-room` : slugify(item.title);
//         displayTitle = item.rooms ? `${item.rooms} Room Set` : item.title;
//         if (!seenHouses.has(slug)) {
//           menu.Houses.push({ title: displayTitle, path: `/property/${slug}` });
//           seenHouses.add(slug);
//         }
//       } else if (type === "flat" || type === "flats") {
//         slug         = item.rooms ? `${item.rooms}-bhk` : slugify(item.title);
//         displayTitle = item.rooms ? `${item.rooms} BHK Flats` : item.title;
//         if (!seenFlats.has(slug)) {
//           menu.Flats.push({ title: displayTitle, path: `/property/${slug}` });
//           seenFlats.add(slug);
//         }
//       } else if (type === "pg" || type === "hostel") {
//         if (!item.pgType) return;
//         slug         = item.pgType.toLowerCase().replace(/\s+/g, "-");
//         displayTitle = item.pgType;
//         if (!seenPg.has(slug)) {
//           menu["PG/Hostel"].push({ title: displayTitle, path: `/property/${slug}` });
//           seenPg.add(slug);
//         }
//       }
//     });

//     res.json(menu);
//   } catch (err) {
//     res.status(500).json({ message: "DB error", error: err.message });
//   }
// });
// const slugify = (text) => {
//   return text
//     ?.toString()
//     .toLowerCase()
//     .trim()
//     .replace(/\s+/g, "-")
//     .replace(/[^\w\-]+/g, "");
// };



router.get("/menu", async (req, res) => {
  try {
    const properties = await Property.find(
      { status: 1 },
      "propertyType rooms title pgType"
    );

    console.log("TOTAL PROPERTIES:", properties.length);

    const menu = {
      Houses: [],
      Flats: [],
      "PG/Hostel": [],
    };

    // Default Links
    menu.Houses.push({ title: "All Houses", path: "/property/all-houses" });
    menu.Flats.push({ title: "All Flats", path: "/property/all-flats" });
    menu["PG/Hostel"].push({
      title: "All PG/Hostel",
      path: "/property/all-pg",
    });

    const seen = {
      Houses: new Set(),
      Flats: new Set(),
      PG: new Set(),
    };

    properties.forEach((item) => {
      if (!item.propertyType) return;

      const type = item.propertyType.toLowerCase().trim();

      /* ================= HOUSE ================= */
      if (type === "house" || type === "houses") {
        if (!item.rooms) return;

        const slug = `${item.rooms}-room`;
        const title = `${item.rooms} Room Set`;

        if (!seen.Houses.has(slug)) {
          menu.Houses.push({
            title,
            path: `/property/${slug}`,
          });
          seen.Houses.add(slug);
        }
      }

      /* ================= FLAT ================= */
      else if (type === "flat" || type === "flats") {
        if (!item.rooms) return;

        const slug = `${item.rooms}-bhk`;
        const title = `${item.rooms} BHK Flats`;

        if (!seen.Flats.has(slug)) {
          menu.Flats.push({
            title,
            path: `/property/${slug}`,
          });
          seen.Flats.add(slug);
        }
      }

      /* ================= PG ================= */
      else if (type === "pg" || type === "hostel") {
        if (!item.pgType) return;

        // 🔥 IMPORTANT FIX
        const pgTypeClean = item.pgType.toString().toLowerCase().trim();

        console.log("PG FOUND:", pgTypeClean); // DEBUG

        const slug = slugify(pgTypeClean);
        const title =
          pgTypeClean.charAt(0).toUpperCase() + pgTypeClean.slice(1);

        if (!seen.PG.has(slug)) {
          menu["PG/Hostel"].push({
            title,
            path: `/property/${slug}`,
          });
          seen.PG.add(slug);
        }
      }
    });

    /* ================= SORTING ================= */
    const sortMenu = (arr) => {
      return [
        arr[0],
        ...arr.slice(1).sort((a, b) => a.title.localeCompare(b.title)),
      ];
    };

    menu.Houses = sortMenu(menu.Houses);
    menu.Flats = sortMenu(menu.Flats);
    menu["PG/Hostel"] = sortMenu(menu["PG/Hostel"]);

    console.log("FINAL MENU:", menu);

    res.json(menu);

  } catch (err) {
    console.error("MENU ERROR:", err);
    res.status(500).json({ message: "DB error", error: err.message });
  }
});
/* ================= ALL PROPERTIES (filtered + paginated) ================= */
router.get("/all-properties", async (req, res) => {
  try {
    let { location, type, rooms, baths, pgType, page = 1, limit = 6 } = req.query;

    page  = Number(page);
    limit = Number(limit);

    const filter = { status: 1 };

    if (location) {
      filter.locality = {
        $regex: location.replace(/-/g, " "),
        $options: "i"
      };
    }

    if (type) {
      filter.propertyType = type.toLowerCase().trim();
    }

    if (rooms) {
      filter.rooms = Number(rooms);
    }

    if (baths) {
      filter.bathrooms = Number(baths);
    }

    // ✅ FIXED PG FILTER
    if (pgType) {
      filter.pgType = pgType.toLowerCase().trim();
    }

    console.log("FILTER:", filter); // DEBUG

    const total = await Property.countDocuments(filter);

    const properties = await Property.find(filter)
      .populate("user_id", "firstName lastName phone role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const result = properties.map((p) => {
      const obj = p.toObject();
      const owner = p.user_id;

      obj.owner_name = `${owner.firstName} ${owner.lastName}`;
      obj.user_phone = owner.phone;
      obj.user_role = owner.role;
      obj.phone = owner.role === "Broker" ? owner.phone : COMPANY_PHONE;

      return obj;
    });

    res.json({
      data: result,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {
    res.status(500).json({ message: "DB error", error: err.message });
  }
});

/* ================= ADD PROPERTY ================= */
router.post("/", propertyUpload, async (req, res) => {
  try {
    const {
      user_id, offerType, propertyType, pgType, price, rooms, bathrooms,
      parking, address, locality, title, description, nearbyRoad, features,
      singlePrice, doublePrice, triplePrice, meals,
    } = req.body;

    const images = req.files?.images ? req.files.images.map((f) => f.filename) : [];
    const video  = req.files?.video  ? req.files.video[0].filename : "";

    const property = await Property.create({
      user_id,
      offerType, propertyType, pgType,
      price:       Number(price)       || 0,
      rooms:       Number(rooms)       || 0,
      bathrooms:   Number(bathrooms)   || 0,
      parking, address, locality, nearbyRoad,
      title,
      slug:        slugify(title),
      description,
      features:    parseJSON(features),
      images,
      video,
      singlePrice: parseInt(singlePrice) || null,
      doublePrice: parseInt(doublePrice) || null,
      triplePrice: parseInt(triplePrice) || null,
      meals,
    });

    // Update location available count
    await Location.findOneAndUpdate(
      { title: { $regex: locality, $options: "i" } },
      { $inc: { available: 1 } }
    );

    res.json({ message: "Property submitted successfully", id: property._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

/* ================= GET SINGLE PROPERTY BY ID ================= */
router.get("/property/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});


router.get("/top-properties", async (req, res) => {
  try {
    const { type } = req.query; // single / double / triple

    let filter = {};

    if (type) {
      filter.priceType = type;
    }

    const properties = await Property.find(filter)
      .sort({ price: -1 })
      .limit(3);

    res.json({
      success: true,
      data: properties
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
});

/* ================= UPDATE PROPERTY ================= */
router.put("/:id", propertyUpload, async (req, res) => {
  try {
    const {
      offerType, propertyType, price, rooms, bathrooms, parking,
      address, locality, title, description, nearbyRoad, features,
      singlePrice, doublePrice, triplePrice, meals, existingImages, existingVideo,
    } = req.body;

    const newVideo     = req.files?.video?.length > 0 ? req.files.video[0].filename : existingVideo || "";
    const remaining    = parseJSON(existingImages);
    const newImages    = req.files?.images ? req.files.images.map((f) => f.filename) : [];
    const finalImages  = [...remaining, ...newImages];

    await Property.findByIdAndUpdate(req.params.id, {
      $set: {
        offerType, propertyType,
        price:       Number(price)       || 0,
        rooms:       Number(rooms)       || 0,
        bathrooms:   Number(bathrooms)   || 0,
        parking, address, locality, nearbyRoad,
        title,
        slug:        slugify(title),
        description,
        features:    parseJSON(features),
        images:      finalImages,
        video:       newVideo,
        singlePrice: parseInt(singlePrice) || null,
        doublePrice: parseInt(doublePrice) || null,
        triplePrice: parseInt(triplePrice) || null,
        meals,
      },
    });

    res.json({ success: true, message: "Property updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Update failed", error: err.message });
  }
});

/* ================= GET PROPERTY BY ID (short) ================= */
// router.get("/:id", async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);
//     if (!property) return res.status(404).json({ message: "Property not found" });
//     res.json(property);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId (important)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({
      success: true,
      data: property
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
});
module.exports = router;