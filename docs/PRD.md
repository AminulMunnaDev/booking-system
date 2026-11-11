# PRD: Bus Ticket Booking System

## 1. Overview
A dynamic web application for booking intercity bus tickets (inspired by Shohoz). Visitors search trips, pick seats, and book tickets. An admin controls all the data (buses, routes, trips, bookings) from a backend dashboard.

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
- Form validation with clear messages (Zod).
- Search filters: bus type (AC / Non-AC), sort by price or time.
- Pagination on admin tables.
- Admin can manage users (view, change role).

### Nice to have (only if time remains)
- Simulated payment page (bKash / Nagad style, fake).
- QR code on ticket.
- Bus image upload.
- Email confirmation.
- Operator role (bus companies manage only their own buses).

## 5. Out of Scope
- Real payment gateway integration.
- Real-time seat locking across many users (we only use the DB unique constraint).
- Mobile app.
- Multi-language support.

## 6. Business Rules
- A seat can belong to only one active booking per trip.
- Cancelling a booking frees its seats immediately.
- A trip in the past cannot be booked.
- A user can only view and cancel their own bookings.
- Only admins can access `/admin` pages and `/api/admin` endpoints.
- A bus or route that has trips cannot be deleted (block deletion, show a clear message).
- Registration always creates a USER. The admin account is created only by the seed script.
- Email is stored in lowercase and must be unique. Password must be at least 6 characters.
- A route (From city + To city) must be unique, and From and To must be different.
- A bus plate number must be unique.
- A trip cannot be created with a past travel date.
- The same bus cannot have two trips at the same date and departure time.
- The bus of a trip cannot be changed once seats are booked on it.
- A trip with bookings cannot be deleted. Admin sets it inactive (isActive = false) to hide it from search.
- A bus or route that has trips cannot be deleted (this rule was already listed, now enforced).
- Times use 24-hour HH:MM format. Prices are whole numbers in BDT.

## 7. Constraints
- Free tools only. Free-tier AI chat has limited messages, so work in small steps and keep these docs handy.
- Several days of development time.
- Stack: Next.js + Tailwind + shadcn/ui, Express, MySQL, Prisma.

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
- [ ] Step 4 onward: see IMPLEMENTATION_PLAN.md

4,5 done