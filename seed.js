const mongoose = require("mongoose");
require("dotenv").config();

// ============================================================
// MODELS (inline for seed script)
// ============================================================
const userSchema = new mongoose.Schema({
  firstName: String, lastName: String, email: { type: String, unique: true },
  phone: String, photo: String, password: String, role: String,
}, { timestamps: true });

const locationSchema = new mongoose.Schema({
  title: String, image: String, available: Number, status: Number,
}, { timestamps: true });

const propertySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  offerType: String, propertyType: String, pgType: String,
  price: String, rooms: String, bathrooms: String, parking: String,
  address: String, locality: String, nearbyRoad: String,
  singlePrice: Number, doublePrice: Number, triplePrice: Number,
  meals: String, title: String, description: String, slug: String,
  features: mongoose.Schema.Types.Mixed,
  images: [String], video: String,
  status: { type: Number, default: 1 },
  bookmark: { type: Boolean, default: false },
}, { timestamps: true });

const User     = mongoose.model("User",     userSchema);
const Location = mongoose.model("Location", locationSchema);
const Property = mongoose.model("Property", propertySchema);

// ============================================================
// HELPER — safe JSON parse for features
// ============================================================
const parseFeatures = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    let parsed = raw;
    // Keep parsing until we get an array (handles multiple JSON.stringify layers)
    for (let i = 0; i < 10; i++) {
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
      else break;
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// ============================================================
// SEED FUNCTION
// ============================================================
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Location.deleteMany({});
    await Property.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // ============================================================
    // INSERT USERS
    // ============================================================
    const users = await User.insertMany([
      {
        firstName: "Amir", lastName: "Saifi",
        email: "amirsaifisdfsd7671@gmail.com", phone: "7023574769",
        photo: null,
        password: "$2b$10$sHiOsaaBwlN9l7N.z3bNTeozEVye/F/03BzWzlKLChMktvNxYtR3q",
        role: "Tenant", createdAt: new Date("2026-03-10T10:07:48Z")
      },
      {
        firstName: "Amir", lastName: "Saifi",
        email: "amirsaifi7671@gmail.com", phone: "7023574769",
        photo: null,
        password: "$2b$10$x/jF6rOdmPA4pk3InRxas.tPFFssr1II4nEiIYr5wClN8hmE1jmNq",
        role: "Owner", createdAt: new Date("2026-03-11T07:32:18Z")
      },
      {
        firstName: "Amir", lastName: "Saifi",
        email: "amirsaifi767s1@gmail.com", phone: "7023574769",
        photo: null,
        password: "$2b$10$x/jF6rOdmPA4pk3InRxas.tPFFssr1II4nEiIYr5wClN8hmE1jmNq",
        role: "Owner", createdAt: new Date("2026-03-11T10:44:32Z")
      },
      {
        firstName: "", lastName: "", email: "unknown_21@placeholder.com",
        phone: null, photo: "1773476636451-nikitaagrawal.jpeg",
        password: "$2b$10$dadNtkW2uBicIZBWchWy8e9y9gG97tKQ//cOjs/TpASgynvHT9KQi",
        role: "Owner", createdAt: new Date("2026-03-14T08:23:24Z")
      },
      {
        firstName: "Nikita", lastName: "Agarwal",
        email: "nikitagtech115@gmail.com", phone: "7062620368",
        photo: null,
        password: "$2b$10$Kyr2NHK458E5LJV0HJS68.eKJLfIJiAkYSK/UvpTMIJfRuw.4fHrS",
        role: "Owner", createdAt: new Date("2026-03-14T09:42:25Z")
      },
    ]);
    console.log(`👤 Inserted ${users.length} users`);

    // Map old MySQL id → new MongoDB _id
    // Order: id 17,18,20,21,23
    const userMap = {
      17: users[0]._id,
      18: users[1]._id,
      20: users[2]._id,
      21: users[3]._id,
      23: users[4]._id,
    };

    // ============================================================
    // INSERT LOCATIONS
    // ============================================================
    const locations = await Location.insertMany([
      { title: "Sodala",           image: "sodala.webp",                        available: 2, status: 1, createdAt: new Date("2026-03-11T09:14:16Z") },
      { title: "Malviya Nagar",    image: "malviya-nagar.webp",                  available: 2, status: 1, createdAt: new Date("2026-03-11T09:14:16Z") },
      { title: "Vaishali Nagar",   image: "vaishali-nagar.webp",                 available: 0, status: 1, createdAt: new Date("2026-03-11T09:14:16Z") },
      { title: "Gopalpura",        image: "gopalpura.webp",                      available: 2, status: 1, createdAt: new Date("2026-03-11T09:14:16Z") },
      { title: "Mansarovar",       image: "1773225193918-mansarovar.webp",       available: 1, status: 1, createdAt: new Date("2026-03-11T09:14:16Z") },
      { title: "Vidhyadhar Nagar", image: "1773225181477-vidhyadhar-nagar.webp", available: 3, status: 1, createdAt: new Date("2026-03-11T09:14:16Z") },
    ]);
    console.log(`📍 Inserted ${locations.length} locations`);

    // ============================================================
    // INSERT PROPERTIES
    // ============================================================
    const properties = await Property.insertMany([
      {
        user_id: userMap[18], offerType: "Rent", propertyType: "pg", pgType: "boys",
        price: "", rooms: "2", bathrooms: "1", parking: "Bike Parking",
        address: "Vidhyadhar Nagar, Jaipur", locality: "Vidhyadhar Nagar", nearbyRoad: "Sikar Road",
        singlePrice: 3000, doublePrice: 0, triplePrice: 0, meals: "Yes",
        title: "PG | Hostel for Boys", description: "<p>full furnished</p>",
        features: ["Bed","Balcony","TV","Internet","Fan","Wardrobe"],
        images: ["1773289660698-BZ5A0363-scaled-e1693486664868.jpg"],
        video: null, status: 1, slug: "pg-hostel-for-boys", bookmark: false,
        createdAt: new Date("2026-03-12T04:27:40Z")
      },
      {
        user_id: userMap[18], offerType: "Rent", propertyType: "house", pgType: null,
        price: "5000", rooms: "1", bathrooms: "2", parking: "Bike Parking",
        address: "Mansarover, Jaipur", locality: "Mansarovar", nearbyRoad: "Sikar Road",
        singlePrice: 0, doublePrice: 0, triplePrice: 0, meals: "",
        title: "1 room", description: "<p>PG for Girl</p>",
        features: ["Bed","Balcony","TV","Air Conditioning"],
        images: ["1773289905737-1_1-Photo-6 (1).jpg"],
        video: null, status: 1, slug: "house-for-residentional", bookmark: false,
        createdAt: new Date("2026-03-12T04:31:45Z")
      },
      {
        user_id: userMap[18], offerType: "Sale", propertyType: "flat", pgType: null,
        price: "5000", rooms: "3", bathrooms: "2", parking: "Car Parking",
        address: "Vidhyadhar Nagar, Jaipur", locality: "Vidhyadhar Nagar", nearbyRoad: "Sikar Road",
        singlePrice: 0, doublePrice: 0, triplePrice: 0, meals: "",
        title: "1 BHK Flats", description: "<p>1 BHK Flats</p>",
        features: ["Bed","Balcony","TV","Wardrobe"],
        images: ["1773290797261-newbannerimage.png"],
        video: null, status: 1, slug: "1-bhk-flats", bookmark: false,
        createdAt: new Date("2026-03-12T04:46:37Z")
      },
      {
        user_id: userMap[18], offerType: "Rent", propertyType: "pg", pgType: "girls",
        price: "", rooms: "3", bathrooms: "2", parking: "Car Parking",
        address: "SODALA Nagar, Jaipur", locality: "Sodala", nearbyRoad: "Sikar Road",
        singlePrice: 0, doublePrice: 4500, triplePrice: 0, meals: "Yes",
        title: "PG hOSTEL FOR GIRL", description: "<p>PG hOSTEL FOR GIRL</p>",
        features: ["Balcony","Bed","Internet","Fan","Wardrobe"],
        images: ["1773300586783-vaishali-nagar.webp"],
        video: null, status: 1, slug: "pg-hostel-for-girl", bookmark: true,
        createdAt: new Date("2026-03-12T06:29:14Z")
      },
      {
        user_id: userMap[18], offerType: "Rent", propertyType: "flat", pgType: null,
        price: "40000", rooms: "2", bathrooms: "2", parking: "Bike Parking",
        address: "Malviya Nagar, Jaipur", locality: "Malviya Nagar", nearbyRoad: "Gandhi Path",
        singlePrice: 0, doublePrice: 0, triplePrice: 0, meals: "",
        title: "Flat for residential", description: "<p>Flat for residential</p>",
        features: ["Balcony","Bed","Internet","Fan","Wardrobe"],
        images: ["1773462412251-23.jpg"],
        video: null, status: 1, slug: "flat-for-residential", bookmark: false,
        createdAt: new Date("2026-03-14T04:26:52Z")
      },
      {
        user_id: userMap[21], offerType: "Rent", propertyType: "House", pgType: "",
        price: "10000", rooms: "2", bathrooms: "2", parking: "Bike Parking",
        address: "prtap nagar vaitika mansaraovar", locality: "Gopalpura", nearbyRoad: "mahver road",
        singlePrice: 0, doublePrice: 0, triplePrice: 0, meals: "",
        title: "2 Room set in gopalpura on mahaveer road",
        description: "<p>Fully furnished and amazing the</p>",
        features: ["Air Conditioning","TV","Wardrobe","Fridge"],
        images: [
          "1773477089718-IMG-20220408-WA0030-520x397.jpg",
          "1773477089719-IMG-20220408-WA0031-520x397.jpg",
          "1773477089719-IMG-20220408-WA0034-1-520x397.jpg"
        ],
        video: null, status: 1, slug: "2-room-set-in-gopalpura-on-mahaveer-road", bookmark: false,
        createdAt: new Date("2026-03-14T08:31:29Z")
      },
      {
        user_id: userMap[23], offerType: "Rent", propertyType: "House", pgType: "",
        price: "8000", rooms: "2", bathrooms: "2", parking: "Car Parking",
        address: "fgsdf", locality: "Mansarovar", nearbyRoad: "Jhotwara Road",
        singlePrice: 0, doublePrice: 0, triplePrice: 0, meals: "",
        title: "2 BHK flat in Sodala on mansarovar", description: "<p>helioiu</p>",
        features: ["Almirah","TV","Bed"],
        images: [
          "1773642527211-3d-rendering-house-model.jpg",
          "1773643213908-analog-landscape-city-with-buildings.jpg"
        ],
        video: "1773642293063-6026355_People_Person_3840x2160.mp4",
        status: 1, slug: "2-bhk-flat-in-sodala-on-mansarovar", bookmark: false,
        createdAt: new Date("2026-03-16T06:14:55Z")
      },
      {
        user_id: userMap[18], offerType: "Rent", propertyType: "House", pgType: "",
        price: "5000", rooms: "1", bathrooms: "1", parking: "Bike Parking",
        address: "Malviya Nagar, Jaipur", locality: "Malviya Nagar", nearbyRoad: "Sikar Road",
        singlePrice: 0, doublePrice: 0, triplePrice: 0, meals: "",
        title: "1 Bhk test", description: "<p>1 Bhk test</p>",
        features: ["Air Conditioning","Almirah","Bed","Fan","Wardrobe"],
        images: [
          "1773644208836-1 (11).jpg", "1773644253476-1 (10).jpg",
          "1773644253535-1 (3).jpg",  "1773644253558-1 (2).jpg",
          "1773644253579-1 (1).jpg"
        ],
        video: "1773644208811-854336-hd_1920_1080_24fps.mp4",
        status: 0, slug: "1-bhk-test", bookmark: false,
        createdAt: new Date("2026-03-16T06:56:48Z")
      },
    ]);
    console.log(`🏠 Inserted ${properties.length} properties`);

    console.log("\n✅ Seed complete!");
    console.log("📊 Summary:");
    console.log(`   Users:      ${users.length}`);
    console.log(`   Locations:  ${locations.length}`);
    console.log(`   Properties: ${properties.length}`);

    process.exit(0);

  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seed();