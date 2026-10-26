# IMovies — MERN Movie Ticket Booking Demo

## Requirements
- Node.js LTS (18+ recommended)
- MongoDB Atlas account (or local MongoDB)
- VS Code

## 1. Configure the backend
Open a terminal in VS Code and run:
```bash
cd server
npm install
```
Copy `server/.env.example` to `server/.env` and fill in `MONGO_URI` and `JWT_SECRET`.
Then run:
```bash
npm run dev
```
The API runs at http://localhost:5000.

## 2. Configure the frontend
Open a SECOND terminal in VS Code:
```bash
cd client
npm install
npm run dev
```
Open the local URL printed by Vite, usually http://localhost:5173.

## MongoDB Atlas quick setup
1. Create a free cluster at https://www.mongodb.com/cloud/atlas.
2. In Database Access, create a database username and password.
3. In Network Access, add your current IP address (for a quick demo, Atlas may allow `0.0.0.0/0`; remove this after testing).
4. Click Connect → Drivers → Node.js and copy the connection string.
5. Replace `<password>` with your database user's password and set the database name to `imovies`, e.g. `mongodb+srv://USERNAME:PASSWORD@cluster0.example.mongodb.net/imovies?retryWrites=true&w=majority`.
6. Paste it into `server/.env` as `MONGO_URI=...`.

## Demo admin
Register normally in the app. To grant admin access for a presentation, change that user's `role` to `admin` in the `users` collection using MongoDB Atlas Data Explorer. Do not expose admin access this way in a real public app.

## Features
- Movie listings and search
- Register/login with hashed passwords and JWT
- Show selection and seat selection
- Booking confirmation and booking history
- Admin-only movie creation endpoint (API)
- Seat booking conflict check in the booking endpoint

## Important
This is a student/demo project. Payments are simulated; no real payment is collected. For production use, add payment-provider integration, robust transactions/locking, validation, rate limiting, tests, and deployment security.
