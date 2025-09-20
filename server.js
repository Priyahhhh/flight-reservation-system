// server.js — Minimal Flight Booking Backend
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/flightdb";

// Flight Schema
const flightSchema = new mongoose.Schema({
  airline: String,
  from: String,
  to: String,
  depart: String,
  arrive: String,
  price: Number,
  seats: Number,
});

const bookingSchema = new mongoose.Schema({
  flightId: { type: mongoose.Schema.Types.ObjectId, ref: "Flight" },
  name: String,
  email: String,
  seatsBooked: Number,
  createdAt: { type: Date, default: Date.now },
});

const Flight = mongoose.model("Flight", flightSchema);
const Booking = mongoose.model("Booking", bookingSchema);

// Seed helper
async function seedFlights() {
  const count = await Flight.countDocuments();
  if (count === 0) {
    await Flight.create([
      { airline: "Aurora Air", from: "Bengaluru", to: "Chennai", depart: new Date(Date.now() + 86400000).toISOString(), arrive: new Date(Date.now() + 90000000).toISOString(), price: 3200, seats: 12 },
      { airline: "BlueSkies", from: "Bengaluru", to: "Mumbai", depart: new Date(Date.now() + 172800000).toISOString(), arrive: new Date(Date.now() + 176400000).toISOString(), price: 4200, seats: 8 },
      { airline: "JetNova", from: "Chennai", to: "Delhi", depart: new Date(Date.now() + 259200000).toISOString(), arrive: new Date(Date.now() + 264000000).toISOString(), price: 5200, seats: 24 },
      { airline: "AirVista", from: "Ahmedabad", to: "Mumbai", depart: new Date(Date.now() + 360000000).toISOString(), arrive: new Date(Date.now() + 366000000).toISOString(), price: 2800, seats: 15 },
    ]);
    console.log("✅ Seeded sample flights");
  }
}

// Routes

// Get flights
app.get("/api/flights", async (req, res) => {
  const { from, to } = req.query;
  const query = {};
  if (from) query.from = { $regex: `^${from}$`, $options: "i" };
  if (to) query.to = { $regex: `^${to}$`, $options: "i" };

  try {
    const flights = await Flight.find(query).lean();
    res.json(flights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Book flight
app.post("/api/bookings", async (req, res) => {
  try {
    const { flightId, name, email, seatsBooked } = req.body;
    const flight = await Flight.findById(flightId);
    if (!flight) return res.status(404).json({ error: "Flight not found" });
    if (flight.seats < seatsBooked) return res.status(400).json({ error: "Not enough seats" });

    flight.seats -= seatsBooked;
    await flight.save();

    const booking = await Booking.create({ flightId, name, email, seatsBooked });
    await booking.populate("flightId");
    res.json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all bookings
app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().populate("flightId").lean();
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("✈️ SkySwift API is running. Use /api/flights or /api/bookings");
});

// Connect DB + start server
mongoose
  .connect(MONGO_URI, { autoIndex: true })
  .then(async () => {
    console.log("✅ MongoDB connected");
    await seedFlights();
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error("❌ Mongo connection error", err));
