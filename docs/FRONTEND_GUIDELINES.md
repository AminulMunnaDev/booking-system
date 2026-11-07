# FRONTEND GUIDELINES

## 1. Setup
```bash
npx create-next-app@latest frontend
# Choose: App Router = Yes, Tailwind = Yes, src/ directory = Yes
cd frontend
npx shadcn@latest init
npx shadcn@latest add button input label card table dialog select badge dropdown-menu tabs sonner form calendar popover separator skeleton alert-dialog
npm install lucide-react react-hook-form zod @hookform/resolvers date-fns
```

## 2. Folder Structure
```
frontend/src/
├── app/
│   ├── layout.js              # root layout, navbar, toaster
│   ├── page.js                # home (search)
│   ├── search/page.js
│   ├── trips/[id]/page.js     # seat selection
│   ├── booking/[tripId]/confirm/page.js
│   ├── my-bookings/page.js
│   ├── tickets/[bookingId]/page.js
│   ├── login/page.js
│   ├── register/page.js
│   └── admin/
│       ├── layout.js          # admin sidebar + role guard
│       ├── page.js            # dashboard
│       ├── buses/page.js
│       ├── routes/page.js
│       ├── trips/page.js
│       ├── bookings/page.js
│       └── users/page.js
├── components/
│   ├── ui/                    # shadcn generated (do not edit much)
│   ├── layout/                # Navbar, Footer, AdminSidebar
│   ├── search/                # SearchForm, TripCard
│   ├── seats/                 # SeatGrid, Seat, SeatLegend
│   ├── admin/                 # DataTable, BusForm, RouteForm, TripForm, StatCard
│   └── common/                # PageHeader, EmptyState, ConfirmDialog, Loader
├── lib/
│   ├── api.js                 # fetch wrapper (adds token, handles errors)
│   ├── auth.js                # token helpers
│   ├── utils.js               # shadcn cn() and helpers
│   └── validators.js          # zod schemas
├── context/
│   └── AuthContext.js         # user, login(), logout()
└── hooks/
    └── useRequireAuth.js      # redirect if not logged in or wrong role
```

## 3. Naming Rules
- Components: `PascalCase.jsx` (`TripCard.jsx`).
- Hooks: `useSomething.js`.
- Utilities and files in `lib`: `camelCase.js`.
- Route folders: lowercase and kebab-case.
- One component per file. Keep each file under about 200 lines; split if longer.

## 4. Design System

### Colors (Tailwind)
- Primary: `green-600` (buttons, links, active states).
- Accent: `amber-500` (highlights, selected items).
- Danger: `red-600` (cancel, delete).
- Background: `slate-50`. Cards: `white`. Text: `slate-900` and `slate-600`.

### Typography
- Font: Inter (Next.js `next/font/google`).
- Page title `text-2xl font-bold`, section title `text-lg font-semibold`, body `text-sm` or `text-base`.

### Spacing and Layout
- Page container: `max-w-6xl mx-auto px-4 py-8`.
- Cards use shadcn `Card` with `rounded-xl shadow-sm`.
- Mobile first. Use `sm:`, `md:`, `lg:` breakpoints. All pages must work on a phone width.

### Seat Colors
| State | Style |
|---|---|
| Available | `bg-white border-slate-300 hover:border-green-600` |
| Selected | `bg-green-600 text-white` |
| Booked | `bg-slate-300 text-slate-500 cursor-not-allowed` |

Seat layout is 2 + 2 columns with an aisle in the middle (default 40 seats: rows A to J, seats 1 to 4). Seat label example: `A1`, `C4`.

### Status Badges
- CONFIRMED: green. PENDING: amber. CANCELLED: red.

## 5. Component Rules
- Use shadcn components for buttons, inputs, tables, dialogs, and badges. Do not hand-write what shadcn provides.
- Every list page must handle three states: **loading** (Skeleton), **empty** (EmptyState), and **error** (toast or Alert).
- Destructive actions (delete, cancel) always use `AlertDialog` confirmation.
- Forms use react-hook-form + zod. Show field errors under each input.
- Show a toast (sonner) for success and failure of every action.

## 6. API Client (`lib/api.js`)
- Base URL from `NEXT_PUBLIC_API_URL`.
- Automatically adds `Authorization: Bearer <token>` if a token exists.
- On `401`: clear token and redirect to `/login`.
- Throws an error with the message returned by the backend so forms can show it.

## 7. Auth and Route Protection
- `AuthContext` loads the user via `GET /api/auth/me` on app start.
- `useRequireAuth(role?)` redirects to `/login` if not logged in, and to `/` if the role does not match.
- `admin/layout.js` uses `useRequireAuth("ADMIN")`.
- The backend is the real security. Frontend guards are only for user experience.

## 8. Ticket Print Page
- Use a clean ticket card and a "Print" button calling `window.print()`.
- Add print CSS: hide navbar and buttons with `print:hidden`.
