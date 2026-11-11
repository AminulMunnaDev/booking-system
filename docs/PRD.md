# PRD: Bus Ticket Booking System

## 1. Overview
A dynamic web application for booking intercity bus tickets (inspired by Shohoz). Visitors search trips, pick seats, and book tickets. An admin controls all the data (buses, routes, trips, bookings, users) from a backend dashboard.

This is a university web programming project. It must be a dynamic website with a backend where the admin can control the "product" (trips and tickets).

## 2. Goals
- Show a complete full-stack app: frontend, REST API, relational database, authentication, and roles.
- Give the admin full CRUD control over the product data.
- Prevent double booking of the same seat.
- Be finishable by one student in several days, using free tools only.

## 3. Users and Roles
| Role | Description |
|---|---|
| Guest | Not logged in. Can search trips and view seat availability. Must log in to book. |
| User | Registered customer. Books seats, views and cancels own bookings, prints tickets. |
| Admin | Manages buses, routes, trips, bookings, and users. Sees dashboard stats. |

## 4. Features

### Must have (MVP)
1. Register, login, logout (JWT auth, bcrypt passwords).
2. Role-based access: `USER` and `ADMIN`.
3. Admin CRUD: buses, routes, trips.
4. Public trip search by From, To, Date.
5. Search results show price, departure time, bus type, seats left.
6. Seat selection page (grid: available / booked / selected). Max 4 seats per booking.
7. Booking with passenger details; seats are locked by a database transaction.
8. "My Bookings" page with cancel option.
9. Printable ticket page.
10. Admin: view all bookings, confirm or cancel.
11. Admin dashboard stats: total bookings, revenue, bookings today, popular routes.

### Should have
- Form validation with clear messages (Zod on the backend, field errors shown in the forms).
- Search filters: bus type (AC / Non-AC), sort by price or time.
- Pagination on admin tables.
- Admin can manage users (view, change role).

### Nice to have (only if time remains)
- Simulated payment page (bKash / Nagad style, fake).
- QR code on ticket.
- Bus image upload.
- Email confirmation.
- Operator role (bus companies manage only their own buses).
- Mobile app (Kotlin + Jetpack Compose) using the same REST API, built after the website is finished.

## 5. Out of Scope
- Real payment gateway integration.
- Real-time seat locking across many users (we only use the DB unique constraint).
- Multi-language support.

## 6. Business Rules

### Booking and seats
- A seat can belong to only one active booking per trip (database unique rule on trip + seat number).
- A booking has 1 to 4 seats. The same seat cannot be selected twice in one booking.
- Seats are labelled A1, A2, A3, A4, B1 ... (4 per row, 2 + 2 layout). A 40-seat bus uses A1 to J4.
- A booking is all or nothing: if any seat is already taken, the whole booking fails with a clear message.
- New bookings are CONFIRMED immediately (there is no payment step).
- Cancelling a booking frees its seats immediately (the seat rows are deleted, so a cancelled booking shows no seats).
- A cancelled booking cannot be confirmed again. The user must book again.
- A trip in the past, or one that has already departed, cannot be booked.
- Users cannot cancel a trip that has already departed. Admins can.
- Search hides today's trips that have already departed.
- All dates and times use Bangladesh time (UTC+6).

### Access and accounts
- A user can only view and cancel their own bookings. Admins can view and cancel any booking.
- Only admins can access `/admin` pages and `/api/admin` endpoints.
- Registration always creates a USER. The admin account is created only by the seed script.
- An admin cannot change their own role.
- Email is stored in lowercase and must be unique. Password must be at least 6 characters.

### Product data
- A route (From city + To city) must be unique, and From and To must be different.
- A bus plate number must be unique.
- A bus or route that has trips cannot be deleted (a clear message is shown).
- A trip cannot be created with a past travel date.
- The same bus cannot have two trips at the same date and departure time.
- The bus of a trip cannot be changed once seats are booked on it.
- A trip with bookings cannot be deleted. Admin sets it inactive (isActive = false) to hide it from search.
- Times use 24-hour HH:MM format. Prices are whole numbers in BDT.

### Statistics
- Revenue counts only CONFIRMED bookings.
- Booking counts and popular routes ignore CANCELLED bookings.

## 7. Constraints
- Free tools only. Free-tier AI chat has limited messages, so work in small steps and keep these docs handy.
- Several days of development time.
- Stack: Next.js + Tailwind + shadcn/ui, Express, MySQL, Prisma 6 (pinned, do not upgrade).

## 8. Success Criteria
- Admin can create a bus, route, and trip, and it appears in public search.
- A user can book seats, and those seats show as booked for everyone else.
- Two users cannot book the same seat on the same trip.
- Cancelling a booking makes the seats available again.
- Dashboard numbers match the data.

## 9. Progress
- [x] Step 1: Backend setup, database, Prisma schema
- [x] Step 2: Authentication (register, login, me, role middleware, seed)
- [x] Step 3: Admin CRUD API (buses, routes, trips)
- [x] Step 4: Public search API (cities, search, trip details, popular routes)
- [x] Step 5: Booking API, cancel, admin bookings, users, dashboard stats
- [x] Step 6: Frontend setup, layout, navbar, login and register pages, route guard
- [ ] Step 7: Admin dashboard UI
- [ ] Step 8: Public and user pages (search, seat picker, booking, my bookings, ticket)
- [ ] Step 9: Polish, README, ER diagram

The backend is complete. Remaining work is the frontend (Steps 7 to 9). See `IMPLEMENTATION_PLAN.md`.