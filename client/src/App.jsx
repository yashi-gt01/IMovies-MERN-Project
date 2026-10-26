import Food from "./Food";
import React from "react";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;
console.log("TMDB API key loaded:", Boolean(TMDB_KEY));
async function getNowPlayingMovies() {
  const response = await axios.get(
    "https://api.themoviedb.org/3/movie/now_playing",
    {
      params: {
        api_key: TMDB_KEY,
        region: "IN",
        language: "en-US",
        page: 1,
      },
    }
  );

  return response.data.results.map((movie) => ({
    _id: String(movie.id),
    title: movie.title,
    genre: "Now Showing",
    language: movie.original_language?.toUpperCase() || "N/A",
    duration: "",
    rating: movie.vote_average?.toFixed(1) || "N/A",
    description: movie.overview,
    poster: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "",
  }));
}

import { Film, Search, Ticket, UserRound, LogOut, CalendarDays, Clock3, MapPin, X, CheckCircle2, Popcorn, Star, Armchair, ArrowRight, Clapperboard } from "lucide-react";

const API = "http://localhost:5000/api";
const cities = [
  { name: "Indore", state: "Madhya Pradesh" },
  { name: "Bhopal", state: "Madhya Pradesh" },
  { name: "Mumbai", state: "Maharashtra" },
  { name: "Pune", state: "Maharashtra" },
  { name: "New Delhi", state: "Delhi" }
];
const theatres = [
  {
    name: "C21 Cinemas",
    city: "Indore",
    area: "Scheme 54",
    state: "Madhya Pradesh"
  },
  {
    name: "INOX",
    city: "Indore",
    area: "Vijay Nagar",
    state: "Madhya Pradesh"
  },
  {
    name: "DB Mall Cinemas",
    city: "Bhopal",
    area: "MP Nagar",
    state: "Madhya Pradesh"
  },
  {
    name: "PVR Cinemas",
    city: "Mumbai",
    area: "Andheri",
    state: "Maharashtra"
  },
  {
    name: "PVR Cinemas",
    city: "Pune",
    area: "Koregaon Park",
    state: "Maharashtra"
  },
  {
    name: "PVR Cinemas",
    city: "New Delhi",
    area: "Connaught Place",
    state: "Delhi"
  }
];
const fallbackMovies = [
  { _id: "demo1", title: "The Last Galaxy", genre: "Sci-Fi", language: "English", duration: "2h 08m", rating: "8.4", description: "A daring crew travels beyond the edge of the known universe to discover a mysterious signal.", poster: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600" },
  { _id: "demo2", title: "Midnight Chase", genre: "Action", language: "Hindi", duration: "2h 02m", rating: "7.9", description: "One night, one city, and a detective racing against time to solve a case.", poster: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600" },
  { _id: "demo3", title: "Letters to June", genre: "Romance", language: "English", duration: "1h 54m", rating: "8.1", description: "Two strangers discover that a collection of old letters can change their future.", poster: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600" },
  { _id: "demo4", title: "The Hidden Temple", genre: "Adventure", language: "Hindi", duration: "2h 15m", rating: "8.6", description: "A young archaeologist follows ancient clues into a forgotten kingdom.", poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600" },
  { _id: "demo5", title: "Laugh Out Loud", genre: "Comedy", language: "Hindi", duration: "1h 48m", rating: "7.5", description: "A chaotic family reunion turns into a series of hilarious misunderstandings.", poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600" },
  { _id: "demo6", title: "Deep Blue", genre: "Thriller", language: "English", duration: "2h 01m", rating: "8.0", description: "A marine research team uncovers a secret hidden beneath the ocean.", poster: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600" }
];
const demoShows = [
  { _id: "s1", time: "10:30 AM", price: 180, cinema: "IMovies Central Mall", date: new Date().toISOString().slice(0, 10), bookedSeats: [] },
  { _id: "s2", time: "2:15 PM", price: 220, cinema: "IMovies Central Mall", date: new Date().toISOString().slice(0, 10), bookedSeats: [] },
  { _id: "s3", time: "6:45 PM", price: 260, cinema: "IMovies Central Mall", date: new Date().toISOString().slice(0, 10), bookedSeats: [] },
  { _id: "s4", time: "9:30 PM", price: 240, cinema: "IMovies Central Mall", date: new Date().toISOString().slice(0, 10), bookedSeats: [] }
];

export default function App() {
  const [movies, setMovies] = useState(fallbackMovies);
  const [showFood, setShowFood] = useState(false);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [shows, setShows] = useState(demoShows);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [modal, setModal] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("imoviesUser") || "null"));
  const [token, setToken] = useState(() => localStorage.getItem("imoviesToken") || "");
  const [bookings, setBookings] = useState([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState("home");
  const [selectedTheatre, setSelectedTheatre] = useState("");
  const [selectedCity, setSelectedCity] = useState(() => {
return localStorage.getItem("imoviesCity") || "Indore";
});
  const [showDate, setShowDate] = useState(new Date().toISOString().slice(0, 10));

  const client = useMemo(() => axios.create({ baseURL: API, headers: token ? { Authorization: `Bearer ${token}` } : {} }), [token]);

  useEffect(() => {
  getNowPlayingMovies()
    .then((data) => {
      if (data.length > 0) {
        setMovies(data);
      }
    })
    .catch((error) => {
      console.error("TMDB movie loading failed:", error);
    });
}, []);
  useEffect(() => {
    if (!selectedMovie) return;
    client.get(`/shows?movieId=${selectedMovie._id}&date=${showDate}`).then(r => setShows(r.data.length ? r.data : demoShows)).catch(() => setShows(demoShows));
    setSelectedShow(null); setSelectedSeats([]);
  }, [selectedMovie, showDate]);
  useEffect(() => { if (token && view === "bookings") loadBookings(); }, [token, view]);

  const genres = ["All", ...new Set(movies.map(m => m.genre).filter(Boolean))];
  const filtered = movies.filter(m => (m.title || "").toLowerCase().includes(query.toLowerCase()) && (genre === "All" || m.genre === genre));
  const showToast = message => { setNotice(message); setTimeout(() => setNotice(""), 3500); };

  async function submitAuth(e) {
    e.preventDefault(); setBusy(true);
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const payload = authMode === "login" ? { email, password } : { name, email, password };
      const { data } = await axios.post(API + endpoint, payload);
      setToken(data.token); setUser(data.user); localStorage.setItem("imoviesToken", data.token); localStorage.setItem("imoviesUser", JSON.stringify(data.user));
      setModal(""); setName(""); setEmail(""); setPassword(""); showToast(`Welcome${data.user.name ? ", " + data.user.name : ""}!`);
    } catch (err) { showToast(err.response?.data?.message || "Could not connect. Start the backend and check MongoDB."); }
    finally { setBusy(false); }
  }
  async function loadBookings() {
    try { const { data } = await client.get("/bookings/mine"); setBookings(data); }
    catch { setBookings([]); }
  }
  function logout() {
    setToken(""); setUser(null); localStorage.removeItem("imoviesToken"); localStorage.removeItem("imoviesUser"); setView("home"); showToast("You have logged out.");
  }
  function openMovie(movie) {
    setSelectedMovie(movie); setSelectedShow(null); setSelectedSeats([]); setShowDate(new Date().toISOString().slice(0, 10)); setModal("movie");
  }
  function toggleSeat(seat) {
    if (selectedShow?.bookedSeats?.includes(seat)) return;
    setSelectedSeats(old => old.includes(seat) ? old.filter(s => s !== seat) : [...old, seat]);
  }
  async function confirmBooking() {
    if (!token) { setModal("auth"); setAuthMode("login"); showToast("Please log in to confirm your booking."); return; }
    if (!selectedShow || !selectedSeats.length) return showToast("Choose a showtime and at least one seat.");
    setBusy(true);
    try {
      const { data } = await client.post("/bookings", { showId: selectedShow._id, seats: selectedSeats });
      setModal("success"); setBookings(old => [data, ...old]); setSelectedSeats([]);
      showToast("Your tickets are confirmed!");
    } catch (err) { showToast(err.response?.data?.message || "Booking failed. Please try again."); }
    finally { setBusy(false); }
  }
  async function cancelBooking(id) {
    try { await client.delete(`/bookings/${id}`); await loadBookings(); showToast("Booking cancelled."); }
    catch (err) { showToast(err.response?.data?.message || "Could not cancel booking."); }
  }

  return <div className="app-shell">
    <header className="navbar">
      <button className="brand" onClick={() => { setView("home"); setModal(""); }}><span className="brand-icon"><Film size={22} /></span><span>i<span className="brand-accent">MOVIES</span><small>YOUR CINEMA, YOUR SEAT</small></span></button><div className="city-selector">
  <span className="city-label">📍 Select location</span>

  <select
    value={selectedCity}
    onChange={(e) => {
      const city = e.target.value;
      setSelectedCity(city);
      localStorage.setItem("imoviesCity", city);
      setSelectedTheatre("");
    }}
  >
    {cities.map((city) => (
      <option key={city.name} value={city.name}>
        {city.name}, {city.state}
      </option>
    ))}
  </select>

  <select
    value={selectedTheatre}
    onChange={(e) => setSelectedTheatre(e.target.value)}
    aria-label="Select theatre"
  >
    <option value="">Choose theatre</option>

    {theatres
      .filter((theatre) => theatre.city === selectedCity)
      .map((theatre) => (
        <option
          key={`${theatre.city}-${theatre.area}-${theatre.name}`}
          value={`${theatre.name} - ${theatre.area}`}
        >
          {theatre.name} - {theatre.area}
        </option>
      ))}
  </select>
</div>
 
      <nav><button className={view === "home" ? "nav-link active" : "nav-link"} onClick={() => { setView("home"); setModal(""); }}>Explore</button><button className={view === "bookings" ? "nav-link active" : "nav-link"} onClick={() => { if (!token) { setModal("auth"); setAuthMode("login"); return; } setView("bookings"); setModal(""); }}>My bookings</button></nav>
      <div className="nav-right">{user ? <><span className="welcome-user"><UserRound size={16} /> {user.name}</span><button className="outline-btn" onClick={logout}><LogOut size={15} /> Log out</button></> : <button className="login-btn" onClick={() => { setAuthMode("login"); setModal("auth"); }}>Sign in <ArrowRight size={16} /></button>}</div>
    </header>

    {view === "home" ? <>
      <main>

        

<section className="hero simple-hero">
  <div className="hero-copy">
    <h1>Welcome to iMovies</h1>
    <p>Find a movie, choose your showtime, and book your seats.</p>

    <button
      className="primary-btn"
      onClick={() => {
        document.getElementById("movies")?.scrollIntoView({
          behavior: "smooth",
        });
      }}
    >
      Browse Movies
    </button>
  </div>

  <div className="hero-food">
    <Food />
  </div>
</section>


        
<section id="movies" className="movies-section">
  <div className="section-heading">
    <h2>Now Showing</h2>
    <p>Choose a movie and book your seats.</p>
  </div>

  <div className="movie-controls">
    <div className="search-box">
      <Search size={18} />
      <input
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
    </div>

    <select value={genre} onChange={e => setGenre(e.target.value)}>
      {genres.map(g => (
        <option key={g} value={g}>{g}</option>
      ))}
    </select>
  </div>

  <div className="movie-grid">
    {filtered.map(movie => (
      <article className="movie-card" key={movie._id}>
        <img src={movie.poster} alt={movie.title} />
        <div className="movie-card-content">
          <h3>{movie.title}</h3>
          <p>{movie.genre} · {movie.language}</p>
          <p>{movie.duration} · ⭐ {movie.rating}</p>
          <button
            className="primary-btn"
            onClick={() => openMovie(movie)}
          >
            <Ticket size={16} /> Book a Ticket
          </button>
        </div>
      </article>
    ))}
  </div>

  {filtered.length === 0 && <p>No movies found. Try another search.</p>}
</section>

      </main>
    </> : <main className="bookings-page"><div className="eyebrow">YOUR IMOVIES ACCOUNT</div><h1>My <span>bookings.</span></h1><p className="page-intro">Your next great movie night, all in one place.</p>{bookings.length ? <div className="booking-list">{bookings.map(b => <article className="booking-row" key={b._id}><div className="booking-icon"><Ticket size={23} /></div><div className="booking-main"><h3>{b.movieTitle}</h3><p><MapPin size={14} /> {b.cinema} · <CalendarDays size={14} /> {b.date} · <Clock3 size={14} /> {b.time}</p><small>Seats: {b.seats?.join(", ")} · Booking ID: {b._id?.slice(-7).toUpperCase()}</small></div><div className="booking-total"><b>₹{b.total}</b><span className={b.status === "Cancelled" ? "status cancelled" : "status"}>{b.status}</span>{b.status !== "Cancelled" && <button className="cancel-btn" onClick={() => cancelBooking(b._id)}>Cancel</button>}</div></article>)}</div> : <div className="empty-bookings"><Ticket size={36} /><h3>No bookings yet</h3><p>Book a movie and your tickets will appear here.</p><button className="primary-btn" onClick={() => setView("home")}>Explore movies <ArrowRight size={16} /></button></div>}</main>}

    <footer><div className="footer-brand"><Film size={19} /> i<span>MOVIES</span></div><p>Made for movie lovers. © {new Date().getFullYear()} IMovies</p><span className="footer-note">DEMO BOOKING EXPERIENCE</span></footer>

    {modal === "movie" && selectedMovie && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(""); }}><div className="modal movie-modal"><button className="close-btn" onClick={() => setModal("")}><X size={20} /></button><div className="modal-movie-top"><img src={selectedMovie.poster} alt={selectedMovie.title} /><div><div className="eyebrow">MOVIE DETAILS</div><h2>{selectedMovie.title}</h2><div className="detail-meta"><span><Star size={14} fill="currentColor" /> {selectedMovie.rating || "8.0"}</span><span>{selectedMovie.genre}</span><span>{selectedMovie.duration}</span></div><p>{selectedMovie.description}</p><span className="language-tag">{selectedMovie.language || "English"} audio</span></div></div><div className="modal-divider" /><div className="show-header"><h3><CalendarDays size={18} /> Choose date & showtime</h3><input type="date" min={new Date().toISOString().slice(0, 10)} value={showDate} onChange={e => setShowDate(e.target.value)} /></div><div className="show-grid">{shows.map(show => <button key={show._id} className={selectedShow?._id === show._id ? "show-option chosen" : "show-option"} onClick={() => { setSelectedShow(show); setSelectedSeats([]); }}><b>{show.time}</b><span>{show.cinema || "IMovies Central Mall"}</span><strong>₹{show.price}</strong></button>)}</div>{selectedShow && <><div className="seat-section"><div className="screen-label">SCREEN THIS WAY</div><div className="screen-glow" /><div className="seat-legend"><span><i className="seat-dot available" /> Available</span><span><i className="seat-dot chosen-seat" /> Selected</span><span><i className="seat-dot occupied" /> Booked</span></div><div className="seat-grid">{Array.from({ length: 6 }, (_, r) => <div className="seat-row" key={r}><small>{String.fromCharCode(65 + r)}</small>{Array.from({ length: 8 }, (_, c) => { const seat = `${String.fromCharCode(65 + r)}${c + 1}`; const booked = selectedShow.bookedSeats?.includes(seat); return <button key={seat} disabled={booked} title={booked ? "Already booked" : seat} className={`seat ${booked ? "occupied" : selectedSeats.includes(seat) ? "selected" : ""}`} onClick={() => toggleSeat(seat)}>{c + 1}</button>; })}<small>{String.fromCharCode(65 + r)}</small></div>)}</div></div><div className="checkout-bar"><div><span>{selectedSeats.length} seat{selectedSeats.length !== 1 ? "s" : ""} selected</span><strong>₹{selectedSeats.length * selectedShow.price}</strong></div><button className="primary-btn" disabled={!selectedSeats.length || busy} onClick={confirmBooking}>{busy ? "Please wait..." : "Confirm booking"} <ArrowRight size={16} /></button></div></>}</div></div>}

    {modal === "auth" && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(""); }}><div className="modal auth-modal"><button className="close-btn" onClick={() => setModal("")}><X size={20} /></button><div className="auth-icon"><Film size={24} /></div><div className="eyebrow">WELCOME TO IMOVIES</div><h2>{authMode === "login" ? "Welcome back." : "Join the audience."}</h2><p>{authMode === "login" ? "Sign in to book your perfect seat." : "Create an account and make it a movie night."}</p><form onSubmit={submitAuth}>{authMode === "register" && <label>Full name<input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required /></label>}<label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required /></label><button className="primary-btn auth-submit" disabled={busy}>{busy ? "Please wait..." : authMode === "login" ? "Sign in" : "Create account"} <ArrowRight size={16} /></button></form><div className="auth-switch">{authMode === "login" ? "New to IMovies?" : "Already have an account?"} <button onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>{authMode === "login" ? "Create account" : "Sign in"}</button></div></div></div>}

    {modal === "success" && <div className="modal-backdrop"><div className="modal success-modal"><div className="success-check"><CheckCircle2 size={35} /></div><div className="eyebrow">BOOKING CONFIRMED</div><h2>It's movie time!</h2><p>Your booking has been saved. Have a wonderful show.</p><div className="ticket-stub"><div><span>MOVIE</span><b>{selectedMovie?.title}</b></div><div><span>SHOWTIME</span><b>{selectedShow?.time}</b></div><div><span>SEATS</span><b>{bookings[0]?.seats?.join(", ") || "Selected seats"}</b></div><div><span>TOTAL PAID</span><b>₹{bookings[0]?.total || (selectedSeats.length * (selectedShow?.price || 0))}</b></div></div><p className="demo-note">Demo project: no real payment was taken.</p><button className="primary-btn full-btn" onClick={() => { setModal(""); setView("bookings"); }}>View my bookings <ArrowRight size={16} /></button><button className="text-btn" onClick={() => { setModal(""); setView("home"); }}>Back to movies</button></div></div>}

    {notice && <div className="toast"><CheckCircle2 size={18} />{notice}<button onClick={() => setNotice("")}><X size={15} /></button></div>}

  </div>;
}
