```bash
Securing & Enhancing a MERN Car Booking App (AI-Driven Dev & Testing)

A full-stack MERN car rental application focused on security, payments, auditability, and testing.

Built with:
Express + MongoDB (Mongoose)
Stripe Checkout + Webhooks
JWT Authentication (Access + Refresh tokens)
RBAC (Admin-only routes)
Jest + Supertest integration tests
Monorepo structure (client + server)

Key Features :
Booking & Availability
Car listing and booking creation
Overlap prevention (no double-booking for same car/date range)
User booking history
Payments (Stripe)
Stripe Checkout session creation
Payment confirmation via Stripe Webhooks
Booking status transition : pending_payment → paid
Security & Reliability
JWT authentication (access + refresh tokens)
Role-based access control (admin-only endpoints)
Helmet + rate limiting
CORS restricted to frontend origin
Audit logs for sensitive actions

Testing
Jest + Supertest integration tests
MongoDB in-memory database for isolated tests

Coverage includes:
Register / login
RBAC enforcement
Booking overlap rule
Audit log generation
Tech Stack

Backend :
Node.js
Express.js
MongoDB + Mongoose
Zod (validation)
Stripe (Checkout + Webhooks)

Frontend :
React (Vite)
Tailwind CSS
Axios

Testing : 
Jest
Supertest
mongodb-memory-server

Monorepo Structure :
Car-Booking-App/
│
├── apps/
│ ├── server/ # Express API
│ └── client/ # React frontend
│
└── package.json # root scripts

Environment Setup :
⚠️ The .env file is NOT committed to GitHub for security reasons.
After cloning the repository:
1.Navigate to backend : cd apps/server

2.Copy environment example file and paste it into .env file : .env.example -> .env

Fill in the required values : 
(Required Environment Variables)
NODE_ENV=development
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_random_secret
JWT_REFRESH_SECRET=your_random_secret

CORS_ORIGIN=http://localhost:5173

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

APP_BASE_URL=http://localhost:5173

Stripe Setup (Local Development) : 
1.Create a Stripe account:
  https://dashboard.stripe.com/

2.Enable Test Mode

3.Go to Developers → API Keys
  Copy your Secret Key (sk_test_...)
  Add it to .env as STRIPE_SECRET_KEY

4.Install Stripe CLI
  https://stripe.com/docs/stripe-cli

5.Login:stripe login

6.Start webhook listener:
  npm run stripe
  
7.Copy the generated whsec_... value
  Add it to .env as STRIPE_WEBHOOK_SECRET

8.Restart backend after updating .env

Running Locally
Option 1 — Using Separate Terminals

Terminal 1 (Backend):

cd apps/server
npm install
npm run dev

Terminal 2 (Frontend):

cd apps/client
npm install
npm run dev

Terminal 3 (Stripe Webhook):

npm run stripe

Frontend runs on:http://localhost:5173

Backend runs on:http://localhost:5000

Running Tests
From backend folder:cd apps/server
                    npm test

Tests include:
Auth (register/login)
RBAC protection
Booking overlap prevention
Audit log creation

API Endpoints:
Auth

POST /api/auth/register
POST /api/auth/login

Cars

GET /api/cars
POST /api/cars (admin only)

Bookings

POST /api/bookings
GET /api/bookings/me

Payments

POST /api/payments/checkout

Webhooks

POST /api/webhooks/stripe

Audit Logs

GET /api/audit-logs (admin only)

Security Notes : 
Secrets are never committed to GitHub
Stripe secret keys remain backend-only
Webhook signatures are verified before processing
JWT secrets are environment-based
Rate limiting and Helmet protect API endpoints

Instructions To run this project:
1.Clone the repository
2.Create .env from .env.example
3.Add your own Stripe test keys
4.Run the backend and frontend
5.Start Stripe webhook listener

No production secrets are stored in this repository.