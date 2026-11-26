# PRD: Bus Ticket Booking System (BusGo)

## 1. Overview
BusGo is a full-stack intercity bus ticket booking web application (inspired by Shohoz) built as a university web programming project. Customers can search trips across date ranges, filter and sort results, inspect seat maps, book up to 4 seats, complete a simulated payment flow, and view or print e-tickets. Admins control buses, routes, trips, bookings, and users from a protected dashboard.

## 2. Goals
- Deliver a complete full-stack architecture: Next.js App Router frontend, Express REST API, MySQL relational database via Prisma, JWT authentication, and role-based access control.
- Give administrators full CRUD and operational control over buses, routes, trips, bookings, and user roles.
- Guarantee seat integrity using database transactions and composite unique constraints so two users can never book the same seat.
- Support an end-to-end customer journey with clear feedback, responsive layout, and a simulated local payment flow using only free tools.

## 3. Users and Roles
| Role | Description |
|---|---|
| Guest | Unauthenticated visitor. Can search trips, browse popular routes, and view seat maps. Redirected to login (preserving destination) before booking. |
| User | Registered customer (`USER`). Selects seats, submits passenger details, pays for pending bookings, views/cancels own bookings, and prints tickets. |
| Admin | System administrator (`ADMIN`). Manages buses, routes, trips, bookings, and user roles, and views dashboard analytics. |

## 4. Features

### Core Features (Implemented)
1. **Authentication & Security:** Register, login, profile lookup (`/api/auth/me`), and logout with `bcryptjs` password hashing, JWT bearer tokens, `helmet` security headers, `CLIENT_URL` CORS allowlist, bounded JSON payloads (`32kb`), and rate limiting on `/api/auth` (`15` requests per 15 minutes).
2. **Role-Based Access Control:** Separate `USER` and `ADMIN` roles enforced by backend middleware (`verifyToken`, `requireRole`) and frontend guards (`useRequireAuth`, admin layout guard).
3. **Admin CRUD & Operations:**
   - Buses, Routes, and paginated Trips CRUD under `/api/admin/*` and `/admin/*`.
   - Bookings management with status/date filters, pagination, confirm, and cancel actions.
   - User management (list users, promote/demote roles).
   - Dashboard stats: total active bookings, cancelled bookings, confirmed revenue, bookings today, user count, total/upcoming trips, and top 5 popular routes.
4. **Public Trip Search & Filtering:**
   - Home page search form and top popular routes cards.
   - `/search` supports single-day or multi-day search (up to 14 days via `dateFrom`/`dateTo`), a `DateStrip` day selector, filters (AC/Non-AC, departure/arrival time buckets, bus operator), and sorting (earliest, latest, price low-to-high, price high-to-low).
5. **Seat Selection (`/trips/[id]`):**
   - 2+2 seat map (`SeatGrid`) displaying available, booked, and selected seats (max 4 seats per booking) with live `TripSummary` and `FareSummary`.
   - Displays departure/bookability status and redirects unauthenticated users through `/login?next=...`.
6. **Passenger Details & Atomic Booking (`/booking/[tripId]/confirm`):**
   - Prefills Passenger 1 with the logged-in user's name and phone; optional phone and gender per seat.
   - Creates `Booking` and `BookingSeat` rows inside `prisma.$transaction`, returning `409 Conflict` if any selected seat was booked concurrently.
7. **My Bookings & Printable E-Ticket (`/my-bookings`, `/tickets/[bookingId]`):**
   - View booking history with status badges (`PENDING`, `CONFIRMED`, `CANCELLED`), seat list, and cancellation dialog.
   - Print-ready ticket view with navbar, stepper, and action buttons hidden when printing (`print:hidden`).
8. **Validation & Error Handling:** Zod 4 request validation with structured field errors (`{ field, message }`), Prisma error mapping (`P2002`, `P2003`, `P2025`), and clean API error responses without internal leaks.

### Demo Payment Flow (In Progress)
- Simulated checkout supporting `CARD`, `BKASH`, `NAGAD`, `ROCKET`, and `UPAY` payment methods.
- 10-minute seat hold window (`PAYMENT_WINDOW_MINUTES = 10`) for `PENDING` bookings (`requirePayment: true`), generating a demo transaction reference (`TXN-...`) on payment.
- Automatic expiration of unpaid `PENDING` bookings to release held seats.
- 5-step booking progress `Stepper` (`Choose Trip` -> `Select Seats` -> `Passenger Details` -> `Payment` -> `Ticket`), `/payment/[bookingId]` checkout page, and `/payment/[bookingId]/success` confirmation page.

### Nice to Have (Post-Core / Optional)
- QR code on printable e-tickets.
- Date filter on the admin trips table.
- Custom 404 page and site footer.
- Mobile client (Kotlin + Jetpack Compose) consuming the same REST API (backward-compatible `?date=` search and `requirePayment: false` booking default).

## 5. Out of Scope
- Real payment gateway integrations or live financial transactions.
- Distributed or WebSocket-based real-time seat locking beyond database transactions and unique constraints.
- Multi-language localization.

## 6. Business Rules

### Booking, Seats, and Payment
- A seat on a trip can belong to at most one active booking (enforced by `@@unique([tripId, seatNumber])` on `BookingSeat`).
- A booking contains `1` to `4` distinct seats. Seats use 2+2 row labels (`A1`–`A4`, `B1`–`B4`, ...; a 40-seat bus spans `A1`–`J4`).
- Booking creation is atomic: if any requested seat is already booked, the transaction rolls back with `409 Conflict` and returns the user to seat selection.
- When `requirePayment: true`, bookings start as `PENDING` and hold seats for `10` minutes (`secondsLeft` countdown). Unpaid expired bookings are cancelled and their seats are released. When `requirePayment` is `false` or omitted, bookings are `CONFIRMED` immediately.
- Paying a `PENDING` booking uses an atomic status-guarded update (`where: { id, status: "PENDING" }`) so double submissions cannot pay twice.
- Cancelling a booking sets status to `CANCELLED` and deletes its `BookingSeat` rows inside a transaction so seats become available immediately.
- Cancelled bookings cannot be re-confirmed; users must create a new booking.
- Past or already-departed trips cannot be booked, and search hides today's already-departed trips.
- Normal users cannot cancel a booking after the trip has departed; admins can cancel any non-cancelled booking.
- All date/time comparisons use Bangladesh time (`UTC+6`, `Asia/Dhaka`).

### Customer Flow
- Guests can browse and inspect seat availability, then return to `/trips/[id]` after logging in via `?next=`.
- Passenger 1 defaults to the logged-in user's name and phone on the confirmation form.
- Ticket printing hides navigation and interactive controls.

### Access and Accounts
- Users can view, pay for, and cancel only their own bookings; admins can view and manage any booking.
- `/admin` UI routes and `/api/admin/*` endpoints require `ADMIN` role.
- Public registration always creates `USER` accounts; admin accounts are seeded. Admins cannot change their own role.
- Email is normalized to lowercase and must be unique; password minimum is 6 characters.

### Product Data & Statistics
- Routes (`fromCity` + `toCity`) must be unique and `fromCity !== toCity`.
- Bus `plateNo` must be unique.
- Buses or routes linked to trips cannot be deleted.
- Trips cannot be created in the past, cannot share the same bus at the same `travelDate` and `departureTime`, cannot change bus once seats are booked, and cannot be deleted once bookings exist (set `isActive = false` instead).
- Times use 24-hour `HH:MM` format; prices are integer BDT values.
- Revenue counts only `CONFIRMED` bookings; booking counts and popular routes exclude `CANCELLED` bookings.

## 7. Tech Stack & Constraints
- **Frontend (`/frontend`):** Next.js 16 (App Router, JavaScript, `src/`), React 19, Tailwind CSS v4 (`@tailwindcss/turbopack`), shadcn/ui (Radix UI), `lucide-react`, `sonner`, `fetch` wrapper (`src/lib/api.js` + `useApi`).
- **Backend (`/backend`):** Node.js, Express 5, MySQL, Prisma 6 (pinned, do not upgrade), Zod 4, `jsonwebtoken`, `bcryptjs`, `helmet`, `cors`, `express-rate-limit`, `morgan`.
- **UI Architecture:** Domain logic lives in `src/lib/*`, `src/hooks/*`, and `src/context/*`; shared UI lives in small reusable components (`Stepper`, `SearchForm`, `DateStrip`, `SearchFilters`, `TripCard`, `SeatGrid`, `TripSummary`, `FareSummary`, `DataTable`, `ConfirmDialog`, `Pagination`, `StatusBadge`, `PageHeader`, `Field`).

## 8. Success Criteria
- Admin can create buses, routes, and trips that immediately appear in public search.
- Users can search trips, select seats, complete booking/payment, view/print tickets, and cancel bookings (releasing seats).
- Concurrent attempts to book the same seat allow only one booking to succeed (`409 Conflict` for the second).
- Unpaid `PENDING` bookings expire after 10 minutes and release held seats.
- Dashboard statistics accurately reflect active bookings, cancellations, revenue, and popular routes.

## 9. Progress
- [x] Step 1: Backend setup, MySQL, Prisma 6 schema and initial migration
- [x] Step 2: Authentication (`register`, `login`, `me`, JWT/role middleware, seed)
- [x] Step 3: Admin CRUD API (buses, routes, trips)
- [x] Step 4: Public search & trip details API (cities, date-range search, trip details, popular routes)
- [x] Step 5: Transactional booking API, cancellation, admin bookings, users, dashboard stats, security hardening
- [x] Step 6: Frontend setup, layout, navbar, auth context, route guards, `/login` & `/register`
- [x] Step 7: Admin dashboard UI (stats, buses, routes, trips, bookings, users)
- [x] Step 8: Customer UI + Search/Seat/Booking redesign (`SearchForm`, `DateStrip`, `SearchFilters`, `TripCard`, `SeatGrid`, `Stepper`, `TripSummary`, `FareSummary`, `my-bookings`, `tickets`)
- [ ] Step 9: Complete Demo Payment flow (Prisma payment fields, checkout page, booking handoff, expiry middleware order)
- [ ] Step 10: Final polish, end-to-end verification, `README.md`, and ER diagram
