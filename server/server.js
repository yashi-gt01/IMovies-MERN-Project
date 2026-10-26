import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174"
  ]
}));
app.use(express.json());

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: String, language: String, duration: String, rating: String,
  description: String, poster: String
}, { timestamps: true });

const showSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  cinema: String, date: String, time: String, price: Number,
  bookedSeats: { type: [String], default: [] }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" }
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  show: { type: mongoose.Schema.Types.ObjectId, ref: "Show", required: true },
  movieTitle: String, cinema: String, date: String, time: String,
  seats: [String], total: Number, status: { type: String, default: "Confirmed" }
}, { timestamps: true });

const Movie = mongoose.model("Movie", movieSchema);
const Show = mongoose.model("Show", showSchema);
const User = mongoose.model("User", userSchema);
const Booking = mongoose.model("Booking", bookingSchema);

const demoMovies = [
  { title: "The Last Galaxy", genre: "Sci-Fi", language: "English", duration: "2h 08m", rating: "8.4", description: "A daring crew travels beyond the edge of the known universe to discover a mysterious signal.", poster: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600" },
  { title: "Midnight Chase", genre: "Action", language: "Hindi", duration: "2h 02m", rating: "7.9", description: "One night, one city, and a detective racing against time to solve a case.", poster: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600" },
  { title: "Letters to June", genre: "Romance", language: "English", duration: "1h 54m", rating: "8.1", description: "Two strangers discover that a collection of old letters can change their future.", poster: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600" },
  { title: "The Hidden Temple", genre: "Adventure", language: "Hindi", duration: "2h 15m", rating: "8.6", description: "A young archaeologist follows ancient clues into a forgotten kingdom.", poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600" },
  { title: "Laugh Out Loud", genre: "Comedy", language: "Hindi", duration: "1h 48m", rating: "7.5", description: "A chaotic family reunion turns into a series of hilarious misunderstandings.", poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600" },
  { title: "Deep Blue", genre: "Thriller", language: "English", duration: "2h 01m", rating: "8.0", description: "A marine research team uncovers a secret hidden beneath the ocean.", poster: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600" }
];

async function seedDatabase() {
  if (await Movie.countDocuments() === 0) {
    const movies = await Movie.insertMany(demoMovies);
    const today = new Date();
    const date = today.toISOString().slice(0, 10);
    const showDocs = [];
    for (const movie of movies) {
      for (const [time, price] of [["10:30 AM", 180], ["2:15 PM", 220], ["6:45 PM", 260], ["9:30 PM", 240]]) {
        showDocs.push({ movie: movie._id, cinema: "IMovies Central Mall", date, time, price, bookedSeats: [] });
      }
    }
    await Show.insertMany(showDocs);
    console.log("Seeded demo movies and shows.");
  }
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ message: "Please log in first." });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch { return res.status(401).json({ message: "Session expired. Please log in again." }); }
}
function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Admin access required." });
  next();
}

app.get("/api/health", (req, res) => res.json({ status: "ok", app: "IMovies API" }));

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 6)
      return res.status(400).json({ message: "Enter your name, email, and a password of at least 6 characters." });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password: await bcrypt.hash(password, 10) });
    const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ message: "Could not register. Check server/database setup." }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: (req.body.email || "").toLowerCase() });
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password)))
      return res.status(401).json({ message: "Incorrect email or password." });
    const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch { res.status(500).json({ message: "Login failed. Check server/database setup." }); }
});

app.get("/api/movies", async (req, res) => {
  try {
    const filter = {};
    if (req.query.q) filter.title = { $regex: req.query.q, $options: "i" };
    if (req.query.genre && req.query.genre !== "All") filter.genre = req.query.genre;
    res.json(await Movie.find(filter).sort({ createdAt: -1 }));
  } catch { res.status(500).json({ message: "Could not load movies." }); }
});

app.post("/api/movies", auth, adminOnly, async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch { res.status(400).json({ message: "Movie could not be created. Check required fields." }); }
});

app.get("/api/shows", async (req, res) => {
  try {
    const filter = {};
    if (req.query.movieId) filter.movie = req.query.movieId;
    if (req.query.date) filter.date = req.query.date;
    const shows = await Show.find(filter).populate("movie", "title poster");
    res.json(shows);
  } catch { res.status(500).json({ message: "Could not load shows." }); }
});


app.post("/api/bookings", auth, async (req, res) => {
  try {
    const { showId, seats } = req.body;

    if (!showId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        message: "Choose at least one seat."
      });
    }

    const uniqueSeats = [...new Set(seats)];

    const show = await Show.findById(showId).populate("movie", "title");

    if (!show) {
      return res.status(404).json({ message: "Show not found." });
    }

    if (uniqueSeats.some(seat => show.bookedSeats.includes(seat))) {
      return res.status(409).json({
        message: "One or more seats were just booked. Refresh and choose again."
      });
    }

    show.bookedSeats.push(...uniqueSeats);
    await show.save();

    const booking = await Booking.create({
      user: req.user.id,
      show: show._id,
      movieTitle: show.movie.title,
      cinema: show.cinema,
      date: show.date,
      time: show.time,
      seats: uniqueSeats,
      total: uniqueSeats.length * show.price
    });

    return res.status(201).json(booking);

  } catch (err) {
    console.error("Booking error:", err);

    return res.status(500).json({
      message: "Booking failed. Please try again.",
      error: err.message
    });
  }
});


app.get("/api/bookings/mine", auth, async (req, res) => {
  try { res.json(await Booking.find({ user: req.user.id }).sort({ createdAt: -1 })); }
  catch { res.status(500).json({ message: "Could not load booking history." }); }
});

app.delete("/api/bookings/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    if (booking.status === "Cancelled") return res.status(400).json({ message: "Booking is already cancelled." });
    const show = await Show.findById(booking.show);
    if (show) {
      show.bookedSeats = show.bookedSeats.filter(s => !booking.seats.includes(s));
      await show.save();
    }
    booking.status = "Cancelled";
    await booking.save();
    res.json(booking);
  } catch { res.status(500).json({ message: "Cancellation failed." }); }
});

const PORT = process.env.PORT || 5000;
if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET. Create server/.env using .env.example.");
  process.exit(1);
}
try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");
  await seedDatabase();
  app.listen(PORT, () => console.log(`IMovies API running at http://localhost:${PORT}`));
} catch (error) {
  console.error("MongoDB connection failed. Check MONGO_URI, username/password, and Atlas Network Access.");
  console.error(error.message);
  process.exit(1);
}
