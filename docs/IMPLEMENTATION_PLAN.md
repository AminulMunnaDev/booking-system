# IMPLEMENTATION PLAN

Work step by step. Finish and test each step before starting the next. Commit to Git after each step.

## Current Status
**Steps 1 to 8 are built. The backend is complete, the admin dashboard works, and the customer journey (search, seats, booking, my bookings, ticket) is in place.**
Next: confirm the full journey test (see Step 8), then Step 9 (polish and redesign).

## Before You Start
- [x] Install Node.js LTS, MySQL (XAMPP), Git, editor.
- [x] Create folder `bus-booking/` with `docs/`, `backend/`, `frontend/`.
- [x] Create a GitHub repo and push.
- [x] Create the database: `CREATE DATABASE bus_booking;`

## Step 1: Backend Setup and Database (DONE)
- [x] Init backend, install packages (Prisma pinned to version 6).
- [x] Add `.env`.
- [x] Write `schema.prisma`, run `npx prisma migrate dev --name init`.
- [x] Create `app.js`, `server.js`, `config/prisma.js`, `errorHandler.js`.
- [x] Add `GET /api/health`.

## Step 2: Authentication (DONE)
- [x] `POST /auth/register`, `POST /auth/login`, `GET /auth/me`.
- [x] `verifyToken` and `requireRole` middleware.
- [x] Seed script creates the admin and a test user.

## Step 3: Admin CRUD API (DONE)
- [x] Buses, routes, trips CRUD under `/admin/*`, with zod validation.
- [x] Block delete when related trips exist.
- [x] Pagination on the trips list.

## Step 4: Public Search API (DONE)
- [x] `GET /cities`, `GET /trips/search`, `GET /trips/:id`, `GET /trips/popular-routes`.
- [x] Calculate `seatsLeft`, `bookedSeats[]`, and `seatLayout[]`.

## Step 5: Booking API (DONE)
- [x] `POST /bookings` using a transaction.
- [x] `GET /bookings/my`, `GET /bookings/:id`, `PATCH /bookings/:id/cancel`.
- [x] Admin booking list and status change, `GET /admin/stats`, user list and role change.

## Step 6: Frontend Setup, Layout, and Auth (DONE)
- [x] Next.js app (JavaScript, `src/` folder, App Router), shadcn (Radix UI, Nova preset).
- [x] `lib/api.js`, `lib/auth.js`, `AuthContext`, `useRequireAuth`.
- [x] Navbar, root layout, Toaster, `/login` and `/register`.

## Step 7: Admin Dashboard UI (DONE)
- [x] Admin layout with sidebar and role guard.
- [x] Reusable `DataTable`, `ConfirmDialog`, `Pagination`, `StatusBadge`, `PageHeader`, `Field`.
- [x] Pages: dashboard stats, buses, routes, trips (add, edit, delete via dialogs).
- [x] Bookings page (status filter, confirm, cancel) and users page (change role).
- Extra shadcn components used: table, dialog, alert-dialog. Dropdowns are native `<select>` elements.

## Step 8: Public and User Pages (BUILT, verify the journey)
- [x] Home with SearchForm and popular routes.
- [x] `/search` results with TripCard, type filter, and sort.
- [x] `/trips/[id]` SeatGrid with live total (max 4 seats).
- [x] `/booking/[tripId]/confirm` passenger forms and booking submission.
- [x] `/my-bookings` with cancel, and `/tickets/[bookingId]` with print.
- [x] "My Bookings" link in the navbar.
- [ ] **Verify the full journey:** search, pick seats, book, view ticket, cancel. Also run the double-booking test with two users: the second booking must fail with "seats already booked".

## Step 9: Polish, Redesign, and Submission (NEXT)
Functionality
- [ ] Loading, empty, and error states checked on every page.
- [ ] Check mobile layout on every page.
- [ ] Remove the temporary `admin-check` route from `auth.routes.js`.
- [ ] Custom 404 page and a Footer (optional).
- [ ] Optional: date filter on the admin trips list.

Redesign (the UI is intentionally plain until now)
- [ ] Choose a color theme and set it once in `globals.css` (replace the per-button green classes).
- [ ] Restyle the shared components first: Navbar, `SearchForm`, `TripCard`, `SeatGrid`, `DataTable`, ticket card.
- [ ] Improve the home page (hero section, popular routes cards).
- [ ] Polish the admin layout (sidebar, dashboard cards).

Submission
- [ ] Seed realistic demo data (cities, buses, routes, trips for the next 7 days).
- [ ] Write `README.md` (setup steps, test logins, features, screenshots).
- [ ] Draw an ER diagram from the Prisma schema (dbdiagram.io is free).
- [ ] Test the final checklist in `PRD.md` section 9.
- [ ] Optional extras: fake payment page, QR code on the ticket, image upload.

## Optional: Mobile App (Kotlin + Jetpack Compose)
Only after the website works. It uses the same API.
- Emulator base URL: `http://10.0.2.2:5000/api/`. Real phone: your PC IP address on the same Wi-Fi.
- Libraries: Retrofit + OkHttp, Kotlin Serialization, DataStore (token), Navigation Compose, ViewModel + StateFlow.
- Suggested order: login and register, search, seat picker, booking, my bookings.

## Suggested Schedule (about 7 days)
| Day | Steps |
|---|---|
| 1 | Setup, Step 1, Step 2 |
| 2 | Step 3, Step 4 |
| 3 | Step 5 |
| 4 | Step 6, start Step 7 |
| 5 | Finish Step 7 |
| 6 | Step 8 |
| 7 | Step 9, testing, presentation prep |

## Running the Project (every work session)
1. Start **MySQL** in XAMPP.
2. Terminal in `backend`: `npm run dev` (API on http://localhost:5000).
3. Terminal in `frontend`: `npm run dev` (site on http://localhost:3000).
4. Open the site at **http://localhost:3000** (not the network IP like 192.168.x.x, because dev mode and the backend CORS rule only allow `localhost`).

Test accounts (from the seed script):
- Admin: `admin@bus.com` / `Admin@123`
- User: `user@bus.com` / `User@123`

Opening the site from a phone on the same Wi-Fi needs three changes (only if needed):
1. `frontend/next.config.mjs`: add `allowedDevOrigins: ["YOUR_PC_IP"]`.
2. `frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://YOUR_PC_IP:5000/api`.
3. `backend/.env`: `CLIENT_URL="http://YOUR_PC_IP:3000"`. Restart both servers.

## How to Resume in a New Chat (free-tier tip)
When you start a new conversation, paste this:
1. The contents of `PRD.md`, `TECH_STACK.md`, `BACKEND_STRUCTURE.md` (and `FRONTEND_GUIDELINES.md` for frontend work).
2. A line like: "I finished Steps 1 to 8 (backend complete, admin UI and customer UI built). Now help me with Step 9."
3. Notes about my setup: JavaScript (not TypeScript), `src/` folder, shadcn with Radix UI, Express 5, Prisma 6, zod 4. API list responses look like `{ data: [...] }`. Native `<select>` elements are used instead of the shadcn Select. Forms use plain React state (no react-hook-form).
4. Any error message you are stuck on, with the file it came from.

Ask for **one full step at a time** and test before asking for the next. This uses fewer messages than back-and-forth debugging.