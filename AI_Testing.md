# AI Testing Documentation (GenAI in Testing)

Project: Securing and Enhancing a MERN-Based Car Booking App With AI-Driven Development and Testing  
Stack: MERN (MongoDB + Mongoose, Express, React + Vite, Node), Stripe Checkout, Jest/Supertest  
Focus: AI-assisted test design + automated API tests + validation of security & booking rules.

---

## 1) AI Tools Used

### 1.1 ChatGPT (Test Design + Edge Cases)
Used to:
- Generate end-to-end scenarios for Auth, RBAC, Cars, Booking overlap prevention, Payments, and Audit logs.
- Identify negative test cases (invalid tokens, expired access token, missing cookies, overlapping dates).
- Convert requirements into test steps and expected outcomes.

### 1.2 TestRigor-style Natural Language Tests (Documentation)
Even if TestRigor is not executed, the same “plain English” format was used to generate human-readable automated test scripts.

---

## 2) Test Scope

### Modules Covered
- Authentication: Register, Login, Refresh token, Logout
- Authorization: RBAC (Admin vs User permissions)
- Cars: list, admin create/update/delete, visibility of active/inactive
- Bookings: create booking, date validation, overlap prevention, my bookings history
- Payments: create Stripe checkout session, webhook updates booking to paid
- Audit Logs: log booking + payment actions, admin-only access

---

## 3) AI-Generated Test Cases (Plain English)

> Format matches tools like testRigor: simple steps + expected outputs.

### TC-AUTH-01 Register user (success)
1. Open the app.
2. Go to Register.
3. Enter name, email, password.
4. Submit registration.
Expected:
- User is created.
- App stores user data and accessToken.
- Refresh token cookie is set (HttpOnly).

### TC-AUTH-02 Login user (success)
1. Go to Login.
2. Enter valid email and password.
Expected:
- accessToken returned.
- Refresh token cookie set.
- User navigates to Cars page.

### TC-AUTH-03 Register with existing email (negative)
1. Register with an email already used.
Expected:
- Response shows “Email already in use”.
- No new user is created.

### TC-AUTH-04 Refresh access token (success)
1. Login to get refresh cookie.
2. Wait until access token expires (or force short expiry in env for test).
3. Request any protected route.
Expected:
- Client calls `/api/auth/refresh`.
- A new accessToken is returned.
- Protected request succeeds after retry.

### TC-AUTH-05 Refresh without cookie (negative)
1. Clear cookies.
2. Call `/api/auth/refresh`.
Expected:
- 401 response: “Missing refresh token”.

---

### TC-RBAC-01 User cannot create car (negative)
1. Login as normal user.
2. Call POST `/api/cars` with valid car data.
Expected:
- 403 Forbidden.

### TC-RBAC-02 Admin can create car (success)
1. Login as admin.
2. Call POST `/api/cars` with valid car data.
Expected:
- 201 Created with car details.

---

### TC-CARS-01 Cars list shows only active cars (user view)
1. Ensure at least one car isActive=false and one car isActive=true.
2. Open Cars page (GET `/api/cars`).
Expected:
- Only active cars are returned to users.
- Inactive cars do not appear on Cars page.

### TC-CARS-02 Admin manage shows active + inactive
1. Login as admin.
2. Open Manage Cars page (admin endpoint).
Expected:
- Admin can see all cars including inactive.
- Admin can toggle isActive via PATCH.

---

### TC-BOOK-01 Create booking (success)
1. Login as user.
2. Select a car and choose valid start & end dates.
3. Create booking.
Expected:
- Booking created with status `pending_payment`.
- totalAmount calculated based on days × pricePerDaySnapshot.
- Audit log `BOOKING_CREATED` exists.

### TC-BOOK-02 Invalid date range (negative)
1. Choose endDate <= startDate.
Expected:
- Client blocks submission OR server returns 400.
- UI shows “End must be after start”.

### TC-BOOK-03 Overlap prevention (negative)
1. Create booking for Car X from Jan 10–12.
2. Try booking same Car X from Jan 11–13.
Expected:
- Server returns 409 “Car is already booked for the selected dates”.
- Audit log `BOOKING_OVERLAP_BLOCKED` exists.

### TC-BOOK-04 My bookings history
1. Login as user.
2. Visit My Bookings.
Expected:
- Shows bookings sorted newest first.
- Each booking shows car details + status.

---

### TC-PAY-01 Create checkout session
1. Create booking (pending_payment).
2. Call POST `/api/payments/checkout` with bookingId.
Expected:
- Returns checkoutUrl + sessionId stored in booking.
- Audit log `PAYMENT_CHECKOUT_CREATED` exists.

### TC-PAY-02 Stripe webhook marks booking paid
1. Complete payment via Stripe Checkout (test mode).
2. Stripe sends `checkout.session.completed`.
Expected:
- Booking status updates to `paid`.
- stripePaymentIntentId stored.
- Audit log `PAYMENT_SUCCEEDED` exists.

---

### TC-AUDIT-01 Audit logs restricted to admin
1. Login as normal user.
2. Call GET `/api/audit-logs`.
Expected:
- 403 Forbidden.

### TC-AUDIT-02 Admin can view audit logs
1. Login as admin.
2. Call GET `/api/audit-logs?page=1&limit=20`.
Expected:
- Returns logs with actorRole, action, entityType, entityId, metadata.

---

## 4) Automated API Tests Implemented (Jest)

### Implemented test files
- `auth.test.js` (register/login)
- `rbac.test.js` (user blocked from admin route)
- `booking.test.js` (overlap prevention)
- `auditLogs.test.js` (audit log entries on booking + overlap)

These tests validate:
- Auth success flows
- RBAC enforcement
- Booking overlap logic correctness
- Audit logging correctness

---

## 5) Notes

- Why refresh tokens in HttpOnly cookie?
  - Prevents XSS from stealing refresh token (safer than localStorage).
- Why overlap logic `(existing.start < new.end) AND (new.start < existing.end)`?
  - Correct condition to detect all overlapping ranges.
- Why `pricePerDaySnapshot` stored in booking?
  - Preserves historical pricing even if car price changes later.
- Why webhooks?
  - Payments are confirmed server-to-server; frontend redirects are not trusted.

---