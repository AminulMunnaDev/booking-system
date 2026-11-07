# APP FLOW

## 1. Page Map

### Public pages
| Route | Page |
|---|---|
| `/` | Home with search form (From, To, Date) and popular routes |
| `/search?from=&to=&date=` | Search results (list of trips) |
| `/trips/[id]` | Trip details and seat selection |
| `/login` | Login |
| `/register` | Register |

### User pages (login required)
| Route | Page |
|---|---|
| `/booking/[tripId]/confirm` | Passenger details and booking confirmation |
| `/my-bookings` | List of my bookings, cancel option |
| `/tickets/[bookingId]` | Printable ticket |
| `/profile` | View and edit profile (optional) |

### Admin pages (ADMIN role required)
| Route | Page |
|---|---|
| `/admin` | Dashboard (stats) |
| `/admin/buses` | Bus list, add, edit, delete |
| `/admin/routes` | Route list, add, edit, delete |
| `/admin/trips` | Trip list, add, edit, delete |
| `/admin/bookings` | All bookings, confirm or cancel |
| `/admin/users` | User list, change role |

## 2. User Flows

### 2.1 Guest searches trips
1. Open `/`.
2. Choose From, To, Date, then click Search.
3. `/search` shows matching trips (time, bus type, price, seats left).
4. Click "View Seats" to open `/trips/[id]`.
5. Seat grid is visible. If the guest clicks "Continue", redirect to `/login` (return to the same trip after login).

### 2.2 Register and login
1. `/register`: name, email, phone, password, then submit.
2. On success, redirect to `/login`.
3. `/login`: email and password, then submit.
4. On success, store the JWT. Redirect to the page the user came from, or `/`. Admins go to `/admin`.
5. On failure, show an error message.

### 2.3 Book tickets (User)
1. On `/trips/[id]`, click seats to select them (max 4). Total price updates live.
2. Click "Continue". Go to `/booking/[tripId]/confirm`.
3. Enter passenger name, phone, and gender for each seat.
4. Click "Confirm Booking". The API creates the booking in one transaction.
5. Success: redirect to `/tickets/[bookingId]`.
6. If a seat was taken meanwhile: show "Seat already booked", go back to the seat page with refreshed availability.

### 2.4 Manage bookings (User)
1. Open `/my-bookings`.
2. See upcoming and past bookings with status badges.
3. Click "View Ticket" to open `/tickets/[bookingId]`, then Print.
4. Click "Cancel" and confirm in a dialog. Status becomes CANCELLED and seats are released.

### 2.5 Admin manages the product
1. Login as admin. Redirect to `/admin`.
2. Create buses (`/admin/buses`), then routes (`/admin/routes`), then trips (`/admin/trips`).
3. Each list page has a table, "Add" button (dialog or form), "Edit", and "Delete" with confirmation.
4. `/admin/bookings`: filter by status or date, confirm or cancel bookings.
5. `/admin` shows stats cards and a popular routes list.

## 3. Booking Status Flow
```
(create) -> PENDING -> CONFIRMED
                 \         \
                  +---------+--> CANCELLED
```
- New bookings start as `CONFIRMED` if payment is skipped, or `PENDING` if the fake payment step is added.
- Admin or user cancel moves a booking to `CANCELLED` and deletes its seat rows.

## 4. Error and Edge Cases
- Not logged in on a protected page: redirect to `/login`.
- Logged in as USER on an admin page: show 403 page or redirect to `/`.
- Trip not found: 404 page.
- No search results: friendly "No trips found" message.
- Expired or invalid JWT: clear it and redirect to `/login`.
