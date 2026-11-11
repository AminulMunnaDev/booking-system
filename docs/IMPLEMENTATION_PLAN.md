# IMPLEMENTATION PLAN

Work step by step. Finish and test each step before starting the next. Commit to Git after each step.

## Current Status
**Steps 1 to 6 are DONE. The backend is complete and the frontend has login, register, and a protected `/admin` route.**
Next: Step 7 (Admin Dashboard UI).

## Before You Start
- [x] Install Node.js LTS, MySQL (XAMPP), Git, editor.
- [x] Create folder `bus-booking/` with `docs/`, `backend/`, `frontend/`.
- [x] Create a GitHub repo and push.
- [x] Create the database: `CREATE DATABASE bus_booking;`

## Step 1: Backend Setup and Database (DONE)
Read: `TECH_STACK.md`, `BACKEND_STRUCTURE.md` (sections 1 to 3).
- [x] Init backend, install packages (Prisma pinned to version 6).
- [x] Add `.env`.
- [x] Write `schema.prisma`, run `npx prisma migrate dev --name init`.
- [x] Create `app.js`, `server.js`, `config/prisma.js`, `errorHandler.js`.
- [x] Add `GET /api/health` returning `{ ok: true }`.
- **Done when:** the server runs and `/api/health` shows the database is connected.

## Step 2: Authentication (DONE)
Read: `BACKEND_STRUCTURE.md` (sections 4 and 6).
- [x] `POST /auth/register`, `POST /auth/login`, `GET /auth/me`.
- [x] `verifyToken` and `requireRole` middleware.
- [x] Seed script creates the admin and a test user.
- **Done when:** in Postman you can log in as admin, get a token, and `/auth/me` returns the user.

## Step 3: Admin CRUD API (DONE)
- [x] Buses, routes, trips CRUD under `/admin/*`, with zod validation.
- [x] Block delete when related trips exist (return a clear message).
- [x] Pagination on the trips list.
- **Done when:** you can create a bus, route, and trip via Postman, and a USER token gets `403`.

## Step 4: Public Search API (DONE)
- [x] `GET /cities`, `GET /trips/search`, `GET /trips/:id`, `GET /trips/popular-routes`.
- [x] Calculate `seatsLeft`, `bookedSeats[]`, and `seatLayout[]`.
- **Done when:** searching Dhaka to Chattogram on a seeded date returns trips with seat counts.

## Step 5: Booking API (DONE)
Read: `BACKEND_STRUCTURE.md` (section 5).
- [x] `POST /bookings` using a transaction.
- [x] `GET /bookings/my`, `GET /bookings/:id`, `PATCH /bookings/:id/cancel`.
- [x] Admin booking list and status change, `GET /admin/stats`, user list and role change.
- **Done when:** booking the same seat twice returns `409`, and cancelling frees the seat.

## Step 6: Frontend Setup, Layout, and Auth (DONE)
Read: `FRONTEND_GUIDELINES.md`, `APP_FLOW.md` (sections 1, 2.2).
- [x] Create Next.js app (JavaScript, `src/` folder, App Router), init shadcn (Radix UI, Nova preset), install components.
- [x] `lib/api.js`, `lib/auth.js`, `AuthContext`, `useRequireAuth`.
- [x] Navbar (changes by login state), root layout, Toaster.
- [x] `/login` and `/register` pages (plain React state forms with server field errors).
- [x] Placeholder `/admin` page protected for admins only.
- [ ] Footer (optional, can be done in Step 9).
- **Done when:** you can register, log in, see your name in the navbar, and log out. (Verified.)

## Step 7: Admin Dashboard UI (NEXT)
Before starting, install these extra shadcn components in `frontend`:
`npx shadcn@latest add table dialog select alert-dialog skeleton`
- [ ] Admin layout with sidebar and role guard.
- [ ] Reusable `DataTable` and `ConfirmDialog`.
- [ ] Pages: buses, routes, trips (add, edit, delete via dialogs).
- [ ] Bookings page (filter by status, confirm, cancel), users page (change role), dashboard stat cards.
- **Done when:** the admin can run the whole product from the browser.

## Step 8: Public and User Pages
Read: `APP_FLOW.md` (sections 2.1, 2.3, 2.4).
- [ ] Home with SearchForm and popular routes.
- [ ] `/search` results with TripCard and filters.
- [ ] `/trips/[id]` SeatGrid with live total (max 4 seats).
- [ ] Confirm page with passenger forms, and booking submission.
- [ ] `/my-bookings` with cancel, and `/tickets/[id]` with print.
- [ ] Add a "My Bookings" link to the navbar for logged-in users.
- **Done when:** a full journey works: search, pick seats, book, view ticket, cancel.

## Step 9: Polish and Submission
- [ ] Loading, empty, and error states on every page.
- [ ] Check mobile layout.
- [ ] Green theme for the shadcn buttons (optional).
- [ ] Remove the temporary `admin-check` route from `auth.routes.js`.
- [ ] Seed realistic demo data (cities, buses, routes, trips).
- [ ] Write `README.md` (setup steps, admin login, features, screenshots).
- [ ] Draw an ER diagram from the Prisma schema (dbdiagram.io is free).
- [ ] Test the final checklist in `PRD.md` section 8.
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

Test accounts (from the seed script):
- Admin: `admin@bus.com` / `Admin@123`
- User: `user@bus.com` / `User@123`

## How to Resume in a New Chat (free-tier tip)
When you start a new conversation, paste this:
1. The contents of `PRD.md`, `TECH_STACK.md`, `BACKEND_STRUCTURE.md` (and `FRONTEND_GUIDELINES.md` for frontend steps).
2. A line like: "I finished Steps 1 to 6 (backend complete, frontend login and register done). Now give me complete code for Step 7."
3. Notes about my setup: JavaScript (not TypeScript), `src/` folder, shadcn with Radix UI, Express 5, Prisma 6, zod 4. API list responses look like `{ data: [...] }`.
4. Any error message you are stuck on, with the file it came from.

Ask for **one full step at a time** and test before asking for the next. This uses fewer messages than back-and-forth debugging.