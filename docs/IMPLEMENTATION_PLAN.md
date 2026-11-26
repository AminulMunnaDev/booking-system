# IMPLEMENTATION PLAN

Work step by step, verify each change against running servers, and commit clean milestones to Git.

## Current Status
- **Steps 1–8 are implemented and committed**, including backend API, security hardening (`helmet`, CORS allowlist, auth rate limiter, Zod 4 validation), admin dashboard UI, and the redesigned customer search, seat selection, and passenger details flow.
- **Step 9 (Demo Payment Flow) is partially implemented** in the working tree:
  - Done: `POST /api/bookings/:id/pay`, `requirePayment` validation, `backend/src/utils/payment.js`, `backend/src/middleware/expireUnpaid.js`, `formatBooking` payment fields/countdown, 5-step `Stepper`, `frontend/src/lib/payment.js`, `/payment/[bookingId]/success`, and updated `my-bookings` / `tickets/[bookingId]`.
  - Remaining: add payment columns to Prisma `Booking` model + migrate, move `expireUnpaid` middleware before route handlers in `backend/src/app.js`, implement checkout UI in `frontend/src/app/payment/[bookingId]/page.js`, and wire `booking/[tripId]/confirm/page.js` to pass `requirePayment: true` and redirect to `/payment/[bookingId]`.
- **Step 10 (Final Polish & Submission)** follows immediately after Step 9.

## Completed Steps

### Before You Start (DONE)
- [x] Node.js LTS, MySQL (XAMPP), Git installed; database `bus_booking` created.
- [x] Monorepo folders: `docs/`, `backend/`, `frontend/`.

### Step 1: Backend Setup & Database (DONE)
- [x] Express 5 + Prisma 6 (pinned) + MySQL setup (`backend/prisma/schema.prisma`, initial migration).
- [x] `app.js`, `server.js`, `config/prisma.js`, `middleware/errorHandler.js`, `GET /api/health`.

### Step 2: Authentication & Security Hardening (DONE)
- [x] `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
- [x] `verifyToken` and `requireRole` middleware, `prisma/seed.js` (admin + test user).
- [x] `helmet`, `CLIENT_URL` CORS allowlist, `32kb` JSON limit, `express-rate-limit` on `/api/auth`, temporary `admin-check` route removed.

### Step 3: Admin CRUD API (DONE)
- [x] Buses, routes, and paginated trips CRUD under `/api/admin/*` with Zod validation.
- [x] Referential guards (block deleting buses/routes with trips, or trips with bookings; block bus changes after bookings).

### Step 4: Public Search & Trip Details API (DONE)
- [x] `GET /api/cities`, `GET /api/trips/search` (single `date` or `dateFrom`–`dateTo` up to 14 days, `type`, `sort`), `GET /api/trips/:id`, `GET /api/trips/popular-routes`.
- [x] Computes `seatsLeft`, `bookedSeats[]`, `seatLayout[]`, and `isBookable` in Dhaka time (`UTC+6`).

### Step 5: Booking, Cancellation & Admin Management API (DONE)
- [x] `POST /api/bookings` inside `prisma.$transaction` with `(tripId, seatNumber)` unique constraint (`409` on conflict).
- [x] `GET /api/bookings/my`, `GET /api/bookings/:id`, `PATCH /api/bookings/:id/cancel` (deletes `BookingSeat` rows atomically).
- [x] `GET /api/admin/bookings`, `PATCH /api/admin/bookings/:id/status`, `GET /api/admin/stats`, `GET /api/admin/users`, `PATCH /api/admin/users/:id/role`.

### Step 6: Frontend Setup, Layout & Auth (DONE)
- [x] Next.js 16 (App Router, JavaScript, `src/`), React 19, Tailwind CSS v4, shadcn/ui (Radix UI).
- [x] `src/lib/api.js`, `src/lib/auth.js`, `src/hooks/useApi.js`, `src/hooks/useRequireAuth.js`, `src/context/AuthContext.js`.
- [x] Root layout, `Navbar`, `Stepper`, `Toaster` (`sonner`), `/login`, `/register`.

### Step 7: Admin Dashboard UI (DONE)
- [x] `/admin` layout with role guard and sidebar navigation.
- [x] Reusable `DataTable`, `ConfirmDialog`, `Pagination`, `StatusBadge`, `PageHeader`, `Field`.
- [x] Pages: `/admin` stats, `/admin/buses`, `/admin/routes`, `/admin/trips`, `/admin/bookings`, `/admin/users`.

### Step 8: Customer Journey & UI Redesign (DONE)
- [x] Home page with `SearchForm` and popular routes cards.
- [x] `/search` with date-range query, `DateStrip`, `SearchFilters` (AC/Non-AC, time buckets, bus operator), sort buttons, and redesigned `TripCard`.
- [x] `/trips/[id]` with `TripSummary`, `SeatGrid` (max 4 seats), and `FareSummary`.
- [x] `/booking/[tripId]/confirm` with passenger 1 prefill, gender picker, and booking summary.
- [x] `/my-bookings` and printable `/tickets/[bookingId]`.

## Step 9: Finish Demo Payment Flow (CURRENT)
1. **Database Schema (`backend/prisma/schema.prisma`):**
   - [ ] Add `paymentMethod String?`, `paymentRef String?`, and `paidAt DateTime?` to `Booking`.
   - [ ] Run `npx prisma migrate dev --name add_payment_fields` in `backend/`.
2. **Backend Expiry Middleware Order (`backend/src/app.js`):**
   - [ ] Register `app.use("/api", require("./middleware/expireUnpaid"))` **before** `/api`, `/api/admin`, and `/api/bookings` route mounts (currently placed after routes at line 62, so requests finish before cleanup runs).
3. **Frontend Checkout Page (`frontend/src/app/payment/[bookingId]/page.js`):**
   - [ ] Replace the placeholder `TicketPage` content in `frontend/src/app/payment/[bookingId]/page.js` with the actual payment checkout UI:
     - Fetch `GET /bookings/${bookingId}` and handle `CONFIRMED` (redirect to `/payment/${bookingId}/success`) or `CANCELLED`/expired states.
     - Show live countdown timer from `secondsLeft` (`10` min payment window), trip & fare summary, and payment method picker (`CARD`, `BKASH`, `NAGAD`, `ROCKET`, `UPAY` via `frontend/src/lib/payment.js`).
     - Submit `POST /bookings/${bookingId}/pay` and redirect to `/payment/${bookingId}/success`.
4. **Booking Handoff (`frontend/src/app/booking/[tripId]/confirm/page.js`):**
   - [ ] Send `requirePayment: true` in `POST /bookings` and redirect to `/payment/${res.data.id}` instead of `/tickets/${res.data.id}`.
5. **Verify Payment & Expiry Flow:**
   - [ ] Create booking -> lands on `/payment/[id]` as `PENDING` with seats held.
   - [ ] Pay -> updates to `CONFIRMED` with `TXN-...` reference, redirects to `/payment/[id]/success`, shows transaction details on `/tickets/[id]`.
   - [ ] Let a `PENDING` booking expire (or test with short window) -> seats are released automatically.
   - [ ] Confirm `POST /bookings` with `requirePayment: false`/omitted still works for non-payment clients.

## Step 10: Polish, Verification & Submission (NEXT)
1. **UI & Edge-Case Polish:**
   - [ ] Verify loading, empty, and error states across all public, user, and admin pages.
   - [ ] Verify mobile responsiveness across search, seat grid, checkout, ticket print, and admin tables.
   - [ ] Unify primary green theme tokens in `frontend/src/app/globals.css` (optional) and add custom 404 / Footer if desired.
   - [ ] Optional: add date filter to `/admin/trips` and QR code to `/tickets/[bookingId]`.
2. **End-to-End & Concurrency Verification:**
   - [ ] Test full journey: search -> seat selection -> login redirect -> passenger details -> payment -> ticket print -> cancel -> seats freed.
   - [ ] Test double-booking concurrency with two users selecting the same seat simultaneously -> second request must fail with `409` and return to seat selection.
   - [ ] Confirm all items in `PRD.md` Section 8 (Success Criteria).
3. **Submission Artifacts:**
   - [ ] Expand `backend/prisma/seed.js` (or add a demo seed) with realistic buses, routes, and trips for the next 7 days.
   - [ ] Update `README.md` with full setup instructions, env variables, test accounts, feature list, and screenshots.
   - [ ] Export/draw an ER diagram from `backend/prisma/schema.prisma` (e.g., via dbdiagram.io).

## Optional Future Work: Mobile App (Kotlin + Jetpack Compose)
- Uses the same REST API (`http://10.0.2.2:5000/api/` on Android emulator, or LAN IP on a physical device).
- Backward-compatible endpoints (`GET /api/trips/search?date=...`, `POST /api/bookings` defaulting `requirePayment: false`).
- Recommended stack: Retrofit + OkHttp, Kotlin Serialization, DataStore (JWT), Navigation Compose, ViewModel + StateFlow.

## Running the Project Locally
1. Start **MySQL** (e.g., via XAMPP).
2. Backend (`backend/`):
   - `npm run dev` -> runs on `http://localhost:5000` (`/api/health` checks DB connectivity).
3. Frontend (`frontend/`):
   - `npm run dev` -> runs on `http://localhost:3000`.
4. Open `http://localhost:3000` (keep `CLIENT_URL` in `backend/.env` and `NEXT_PUBLIC_API_URL` in `frontend/.env.local` aligned if testing over LAN).

Seeded test accounts:
- **Admin:** `admin@bus.com` / `Admin@123`
- **User:** `user@bus.com` / `User@123`

## Notes for Future Sessions
- **Frontend conventions:** JavaScript (no TypeScript), `src/` App Router, Tailwind CSS v4, shadcn/ui (`radix-ui`), plain React `useState` forms (no `react-hook-form`), native `<select>` elements for dropdowns, `useApi` + `api()` in `src/lib/api.js`.
- **Backend conventions:** Express 5, Prisma 6 (pinned — do not upgrade), Zod 4, CommonJS modules, responses shaped as `{ data, ... }` or `{ message, data }`.
