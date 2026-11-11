# IMPLEMENTATION PLAN

Work step by step. Finish and test each step before starting the next. Commit to Git after each step.

## Before You Start
- [ ] Install Node.js LTS, MySQL (XAMPP or Workbench), Git, VS Code.
- [ ] Create folder `bus-booking/` with `docs/`, `backend/`, `frontend/`.
- [ ] Create a GitHub repo and push.
- [ ] Create the database: `CREATE DATABASE bus_booking;`

## Step 1: Backend Setup and Database
Read: `TECH_STACK.md`, `BACKEND_STRUCTURE.md` (sections 1 to 3).
- [ ] Init backend, install packages.
- [ ] Add `.env`.
- [ ] Write `schema.prisma`, run `npx prisma migrate dev --name init`.
- [ ] Create `app.js`, `server.js`, `config/prisma.js`, `errorHandler.js`.
- [ ] Add `GET /api/health` returning `{ ok: true }`.
- **Done when:** the server runs and Prisma Studio shows all empty tables.

## Step 2: Authentication
Read: `BACKEND_STRUCTURE.md` (sections 4 and 6).
- [ ] `POST /auth/register`, `POST /auth/login`, `GET /auth/me`.
- [ ] `verifyToken` and `requireRole` middleware.
- [ ] Seed script creates the admin and a test user.
- **Done when:** in Postman you can log in as admin, get a token, and `/auth/me` returns the user.

## Step 3: Admin CRUD API
- [ ] Buses, routes, trips CRUD under `/admin/*`, with zod validation.
- [ ] Block delete when related trips exist (return a clear message).
- [ ] Pagination on the trips list.
- **Done when:** you can create a bus, route, and trip via Postman, and a USER token gets `403`.
done till here

## Step 4: Public Search API
- [ ] `GET /cities`, `GET /trips/search`, `GET /trips/:id`, `GET /trips/popular-routes`.
- [ ] Calculate `seatsLeft` and `bookedSeats[]`.
- **Done when:** searching Dhaka to Chattogram on a seeded date returns trips with seat counts.

## Step 5: Booking API
Read: `BACKEND_STRUCTURE.md` (section 5).
- [ ] `POST /bookings` using a transaction.
- [ ] `GET /bookings/my`, `GET /bookings/:id`, `PATCH /bookings/:id/cancel`.
- [ ] Admin booking list and status change, `GET /admin/stats`, user list and role change.
- **Done when:** booking the same seat twice returns `409`, and cancelling frees the seat.

## Step 6: Frontend Setup, Layout, and Auth
Read: `FRONTEND_GUIDELINES.md`, `APP_FLOW.md` (sections 1, 2.2).
- [ ] Create Next.js app, init shadcn, install components.
- [ ] `lib/api.js`, `AuthContext`, `useRequireAuth`.
- [ ] Navbar (changes by login state), Footer, root layout, Toaster.
- [ ] `/login` and `/register` pages.
- **Done when:** you can register, log in, see your name in the navbar, and log out.

## Step 7: Admin Dashboard UI
- [ ] Admin layout with sidebar and role guard.
- [ ] Reusable `DataTable` and `ConfirmDialog`.
- [ ] Pages: buses, routes, trips (add, edit, delete via dialogs).
- [ ] Bookings page (filter, confirm, cancel), users page, dashboard stat cards.
- **Done when:** the admin can run the whole product from the browser.

## Step 8: Public and User Pages
Read: `APP_FLOW.md` (sections 2.1, 2.3, 2.4).
- [ ] Home with SearchForm and popular routes.
- [ ] `/search` results with TripCard and filters.
- [ ] `/trips/[id]` SeatGrid with live total (max 4 seats).
- [ ] Confirm page with passenger forms, and booking submission.
- [ ] `/my-bookings` with cancel, and `/tickets/[id]` with print.
- **Done when:** a full journey works: search, pick seats, book, view ticket, cancel.

## Step 9: Polish and Submission
- [ ] Loading, empty, and error states on every page.
- [ ] Check mobile layout.
- [ ] Seed realistic demo data.
- [ ] Write `README.md` (setup steps, admin login, features, screenshots).
- [ ] Draw an ER diagram from the Prisma schema (dbdiagram.io is free).
- [ ] Test the final checklist in `PRD.md` section 8.
- [ ] Optional extras: fake payment page, QR code on the ticket, image upload.

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

## How to Resume in a New Chat (free-tier tip)
When you start a new conversation, paste this:
1. The contents of the 6 docs (or at least `PRD.md`, `TECH_STACK.md`, `BACKEND_STRUCTURE.md`).
2. A line like: "I finished Steps 1 to 3. Now give me complete code for Step 4."
3. Any error message you are stuck on, with the file it came from.

Ask for **one full step at a time** and test before asking for the next. This uses fewer messages than back-and-forth debugging.
4,5 done
