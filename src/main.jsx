import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./styles.css";

function App() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  // Fetch bookings on load
  useEffect(() => {
    axios.get("http://localhost:4000/api/bookings")
      .then(res => setBookings(res.data))
      .catch(err => console.error(err));
  }, []);

  // Search flights
  const searchFlights = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:4000/api/flights", { params: { from, to } });
      setFlights(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Book a flight
  const bookFlight = async (flight) => {
    try {
      const res = await axios.post("http://localhost:4000/api/bookings", {
        flightId: flight._id,
        name: "HEMAPRIYA G",
        email: "hema@example.com",
        seatsBooked: 1,
      });
      setBookings(prev => [...prev, res.data.booking]);
      setSelectedFlight(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app">
      {/* Floating header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: [0, -10, 0], opacity: 1 }}
        transition={{ duration: 3, repeat: Infinity }}
        className="hero"
      >
        <h1>SkySwift ✈️ — Book Flights Quickly</h1>
        <p>Minimal structure. Smooth animations. Real backend.</p>
      </motion.header>

      {/* Search */}
      <motion.section
        className="search"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="inputs">
          <input placeholder="From" value={from} onChange={e => setFrom(e.target.value)} />
          <input placeholder="To" value={to} onChange={e => setTo(e.target.value)} />
          <button onClick={searchFlights} disabled={loading}>{loading ? "Searching..." : "Search"}</button>
        </div>
      </motion.section>

      {/* Flight results */}
      <section className="results">
        {flights.length === 0 && !loading ? (
          <p className="empty">No flights — try different cities</p>
        ) : flights.map(f => (
          <motion.div key={f._id} className="card" whileHover={{ scale: 1.05 }}>
            <div className="meta">{f.from} → {f.to} | ₹{f.price}</div>
            <button onClick={() => setSelectedFlight(f)}>Book</button>
          </motion.div>
        ))}
      </section>

      {/* Bookings */}
      <section className="bookings">
        <h2>Your Bookings</h2>
        {bookings.map(b => (
          <motion.div key={b._id} className="booking" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            ✈️ {b.flightId.from} → {b.flightId.to} | ₹{b.flightId.price} ({b.seatsBooked} seat(s))
          </motion.div>
        ))}
      </section>

      {/* Booking modal */}
      <AnimatePresence>
        {selectedFlight && (
          <motion.div className="modalBackdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
              <h3>Confirm Booking</h3>
              <p>{selectedFlight.from} → {selectedFlight.to} — ₹{selectedFlight.price}</p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => bookFlight(selectedFlight)}>Confirm</button>
                <button onClick={() => setSelectedFlight(null)}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer>Built with ❤️ — minimal files, max polish</footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
