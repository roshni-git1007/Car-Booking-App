# Securing & Enhancing a MERN Car Booking App (AI-Driven Dev & Testing)

A MERN-based car booking (rental) backend focused on **security**, **payments**, **auditability**, and **testing**.
Built with Express + MongoDB (Mongoose), Stripe Checkout + Webhooks, and Jest/Supertest integration tests.

## Key Features

### Booking & Availability
- Car listing and booking creation
- **Overlap prevention** (no double-booking for the same car and date range)
- User booking history

### Payments (Stripe)
- Stripe Checkout Session creation
- Payment confirmation via **Stripe Webhooks**
- Booking status transitions:
  - `pending_payment` → `paid`

### Security & Reliability
- JWT auth (access/refresh tokens)
- RBAC: admin-only endpoints (example: audit logs)
- Helmet + rate limiting
- CORS locked to frontend origin
- **Audit logs** for sensitive actions (bookings + payments)

### Testing
- Jest + Supertest integration tests
- MongoDB in-memory tests using `mongodb-memory-server`
- Tests cover:
  - auth register/login
  - RBAC (non-admin blocked)
  - booking overlap rule
  - audit log generation

---

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Validation:** Zod
- **Payments:** Stripe Checkout + Webhooks
- **Security:** Helmet, express-rate-limit, CORS
- **Testing:** Jest, Supertest, mongodb-memory-server
- **Logging:** Morgan (dev), AuditLog collection (security trail)

---

## Monorepo Structure
Car-Booking-App/
apps/
server/ # Express API

## Environment Variables
Create `apps/server/.env` (use `.env.example` as reference).

Required:
- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Run Locally
### Backend
```bash
cd apps/server
npm install
npm run dev
Stripe Webhook (local)
bash
Copy code
stripe login
stripe listen --forward-to localhost:5000/api/webhooks/stripe
Copy the printed whsec_... into:
apps/server/.env → STRIPE_WEBHOOK_SECRET=whsec_...

Restart backend after updating .env

Useful API Endpoints
Auth : 
POST /api/auth/register
POST /api/auth/login

Cars : 
GET /api/cars
POST /api/cars (admin)

Bookings : 
POST /api/bookings
GET /api/bookings/me

Payments :
POST /api/payments/checkout (creates Stripe Checkout session)

Webhooks :
POST /api/webhooks/stripe (Stripe signed webhook)

Audit Logs :
GET /api/audit-logs (admin, supports filters: action, entityType, entityId, paging)