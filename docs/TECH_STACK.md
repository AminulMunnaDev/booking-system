# TECH STACK

Use the latest stable version of each tool at project start. Do not mix in other libraries for the same job.

## Frontend (`/frontend`)
| Purpose | Tool |
|---|---|
| Framework | Next.js (App Router) + React |
| Language | JavaScript (or TypeScript if you are comfortable) |
| Styling | Tailwind CSS |
| UI components | shadcn/ui |
| Icons | lucide-react |
| Forms | react-hook-form + zod + @hookform/resolvers |
| HTTP | fetch wrapper (or axios) in `lib/api.js` |
| Toasts | sonner (shadcn toast) |
| Dates | date-fns |

## Backend (`/backend`)
| Purpose | Tool |
|---|---|
| Runtime | Node.js LTS (20 or newer) |
| Framework | Express |
| Database | MySQL 8 (XAMPP or MySQL Workbench) |
| ORM | Prisma |
| Auth | jsonwebtoken (JWT) + bcryptjs |
| Validation | zod |
| Security | helmet, cors |
| Config | dotenv |
| Dev server | nodemon |
| Logging | morgan |

## Tools
- Git and GitHub (commit after every finished step).
- VS Code.
- Postman or Thunder Client for testing the API.
- Prisma Studio (`npx prisma studio`) to view database data.

## Environment Variables

`backend/.env`
```
DATABASE_URL="mysql://root:@localhost:3306/bus_booking"
JWT_SECRET="change_this_to_a_long_random_string"
JWT_EXPIRES_IN="7d"
PORT=5000
CLIENT_URL="http://localhost:3000"
```

`frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Ports
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- MySQL: `3306`

## Key Decisions
- **Separate Express backend** (not Next.js API routes), so the backend requirement is clearly met.
- **MySQL + Prisma** because the data is relational and needs a unique constraint and transactions.
- **JWT in Authorization header** (`Bearer <token>`). Frontend stores the token in localStorage for simplicity.
- **Simple REST JSON API**, no GraphQL.

Add “Prisma is pinned to version 6. Do not upgrade.” Also note Express 5 and zod 4.
