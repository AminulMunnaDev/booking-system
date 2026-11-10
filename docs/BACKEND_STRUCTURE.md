# BACKEND STRUCTURE

## 1. Setup
```bash
mkdir backend && cd backend
npm init -y
npm install express cors helmet morgan dotenv jsonwebtoken bcryptjs zod @prisma/client
npm install -D nodemon prisma
npx prisma init --datasource-provider mysql
```
Add to `package.json` scripts: `"dev": "nodemon src/server.js"`, `"start": "node src/server.js"`, `"seed": "node prisma/seed.js"`.

## 2. Folder Structure
```
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.js               # creates admin user + sample data
├── src/
│   ├── server.js             # starts the server
│   ├── app.js                # express app, middleware, routes
│   ├── config/
│   │   └── prisma.js         # single PrismaClient instance
│   ├── middleware/
│   │   ├── auth.js           # verifyToken, requireRole("ADMIN")
│   │   ├── validate.js       # zod validation middleware
│   │   └── errorHandler.js   # central error handler
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── trips.routes.js        # public search and trip details
│   │   ├── bookings.routes.js     # user bookings
│   │   └── admin.routes.js        # all admin endpoints
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── trips.controller.js
│   │   ├── bookings.controller.js
│   │   ├── bus.controller.js
│   │   ├── route.controller.js
│   │   ├── adminTrip.controller.js
│   │   ├── adminBooking.controller.js
│   │   ├── user.controller.js
│   │   └── stats.controller.js
│   ├── validators/           # zod schemas
│   └── utils/
│       ├── generateSeats.js  # builds seat labels for a bus
│       └── AppError.js       # custom error class with status code
├── .env
└── package.json
```

## 3. Database Schema (`prisma/schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum BusType {
  AC
  NON_AC
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
}

model User {
  id        Int       @id @default(autoincrement())
  name      String
  email     String    @unique
  phone     String
  password  String
  role      Role      @default(USER)
  createdAt DateTime  @default(now())
  bookings  Booking[]
}

model Bus {
  id         Int      @id @default(autoincrement())
  name       String
  plateNo    String   @unique
  type       BusType
  totalSeats Int      @default(40)
  createdAt  DateTime @default(now())
  trips      Trip[]
}

model Route {
  id           Int      @id @default(autoincrement())
  fromCity     String
  toCity       String
  distanceKm   Int?
  createdAt    DateTime @default(now())
  trips        Trip[]

  @@unique([fromCity, toCity])
}

model Trip {
  id            Int       @id @default(autoincrement())
  routeId       Int
  busId         Int
  travelDate    DateTime  @db.Date
  departureTime String    // "22:30"
  arrivalTime   String?   // "05:00"
  price         Int       // price per seat in BDT
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  route         Route     @relation(fields: [routeId], references: [id])
  bus           Bus       @relation(fields: [busId], references: [id])
  bookings      Booking[]
  seats         BookingSeat[]

  @@index([routeId, travelDate])
}

model Booking {
  id          Int           @id @default(autoincrement())
  userId      Int
  tripId      Int
  totalAmount Int
  status      BookingStatus @default(CONFIRMED)
  createdAt   DateTime      @default(now())
  user        User          @relation(fields: [userId], references: [id])
  trip        Trip          @relation(fields: [tripId], references: [id])
  seats       BookingSeat[]
}

model BookingSeat {
  id            Int     @id @default(autoincrement())
  bookingId     Int
  tripId        Int
  seatNumber    String  // "A1"
  passengerName String
  passengerPhone String?
  gender        String?
  booking       Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  trip          Trip    @relation(fields: [tripId], references: [id])

  @@unique([tripId, seatNumber])   // prevents double booking
}
```
`tripId` is repeated in `BookingSeat` on purpose, so the unique constraint `(tripId, seatNumber)` can stop two people from booking the same seat.

## 4. API Endpoints
Base: `/api`. All responses are JSON. Errors: `{ "message": "..." }` with the right HTTP status.

### Auth
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create user (role USER) |
| POST | `/auth/login` | Public | Returns `{ token, user }` |
| GET | `/auth/me` | Logged in | Current user |

### Public trips
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/cities` | Public | Distinct city names for the search dropdowns |
| GET | `/trips/search?from=&to=&date=&type=&sort=` | Public | Matching trips with `seatsLeft` |
| GET | `/trips/:id` | Public | Trip details, bus, route, and `bookedSeats[]` |
| GET | `/trips/popular-routes` | Public | Top routes for the home page |

### User bookings
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/bookings` | USER | Create booking (see section 5) |
| GET | `/bookings/my` | USER | My bookings |
| GET | `/bookings/:id` | Owner or ADMIN | Single booking and ticket data |
| PATCH | `/bookings/:id/cancel` | Owner or ADMIN | Cancel and free seats |

### Admin (all need ADMIN)
| Method | Path | Description |
|---|---|---|
| GET/POST | `/admin/buses` | List / create bus |
| PUT/DELETE | `/admin/buses/:id` | Update / delete bus |
| GET/POST | `/admin/routes` | List / create route |
| PUT/DELETE | `/admin/routes/:id` | Update / delete route |
| GET/POST | `/admin/trips` | List (paginated) / create trip |
| PUT/DELETE | `/admin/trips/:id` | Update / delete trip |
| GET | `/admin/bookings?status=&date=&page=` | All bookings |
| PATCH | `/admin/bookings/:id/status` | Set CONFIRMED or CANCELLED |
| GET | `/admin/users` | List users |
| PATCH | `/admin/users/:id/role` | Change role |
| GET | `/admin/stats` | Dashboard numbers |

## 5. Booking Logic (the important part)

`POST /api/bookings`
Body:
```json
{
  "tripId": 12,
  "passengers": [
    { "seatNumber": "A1", "name": "Rahim", "phone": "01700000000", "gender": "M" },
    { "seatNumber": "A2", "name": "Karima", "gender": "F" }
  ]
}
```
Steps (inside one `prisma.$transaction`):
1. Validate with zod (1 to 4 passengers, seat labels valid for the bus, no duplicates).
2. Load the trip. Reject if not found, inactive, or the travel date and time is in the past.
3. Create the `Booking` with `totalAmount = price * passengers.length`.
4. Create all `BookingSeat` rows.
5. If Prisma throws error code `P2002` (unique constraint failed), a seat was already taken. Roll back and return `409 { message: "One or more seats are already booked" }`.
6. Return the booking with seats.

Cancel: in a transaction, set the status to `CANCELLED` and **delete the booking's `BookingSeat` rows** so the seats become free. Block cancellation if the status is already `CANCELLED` or the trip has already departed.

Seats left = `bus.totalSeats - count(BookingSeat for the trip)`.

## 6. Middleware
- `verifyToken`: reads the `Authorization: Bearer ...` header, verifies the JWT, and sets `req.user = { id, role }`. Responds `401` if missing or invalid.
- `requireRole("ADMIN")`: responds `403` if `req.user.role` does not match.
- `validate(schema)`: parses `req.body` with zod and responds `400` with field errors.
- `errorHandler`: catches all errors and returns `{ message }` with the right status. Never leak stack traces in responses.

## 7. Security Checklist
- Hash passwords with bcryptjs (10 salt rounds). Never return the password field.
- JWT payload: `{ id, role }`. Secret from `.env`.
- Register always creates role `USER`. The admin account comes from the seed script.
- Users may only read or cancel their own bookings (check `booking.userId === req.user.id` unless ADMIN).
- Use Prisma (parameterized queries) to avoid SQL injection.
- CORS only allows `CLIENT_URL`.

## 8. Seed Data (`prisma/seed.js`)
- Admin: `admin@bus.com` / `Admin@123` (change before demo).
- Test user: `user@bus.com` / `User@123`.
- Cities: Dhaka, Chattogram, Sylhet, Cox's Bazar, Rajshahi, Khulna.
- 3 to 5 buses, 6 to 8 routes, 10 to 15 trips over the next 7 days.


Add that list endpoints return { data: [...] }, and the trips list also returns page, limit, total, totalPages. Add “Register returns the user only (no token), the user then logs in.”