# API Documentation

Base URL: `http://localhost:5000/api` (or your deployed backend + `/api`)

All responses follow the shape:

```json
{ "success": true, "message": "...", "data": { } }
```

Errors:

```json
{ "success": false, "message": "...", "errors": null }
```

Protected routes require `Authorization: Bearer <jwt>`.

---

## Auth

### POST /auth/send-otp
Body: `{ "email": "demo@credlink.test" }`
Creates the merchant profile on first call, generates and sends/logs an OTP.

Response `data`: `{ devMode: boolean, expiresInMinutes: number, message: string }`

### POST /auth/verify-otp
Body: `{ "email": "...", "otp": "123456" }`
Response `data`: `{ token: "<jwt>", merchant: { ... } }`

### GET /auth/me
Protected. Returns the logged-in merchant's profile.

### PUT /auth/me
Protected. Body: `{ name?, businessName?, phone? }`

### POST /auth/logout
Protected. Stateless (JWT) — client just discards the token.

---

## Customers

### GET /customers?search=&page=&limit=
Protected, scoped to the merchant. Returns `{ customers: [...], total, page, limit }`.

### POST /customers
Body: `{ name, phone?, whatsappNumber?, address? }`

### GET /customers/:id
Returns `{ customer, transactions (last 50), summary: { totalCredit, totalPayment, lastTransaction } }`.

### PUT /customers/:id
Body: any of `{ name, phone, whatsappNumber, address }`.

### DELETE /customers/:id
Soft delete — sets `isActive: false`.

### GET /customers/:id/transactions
Returns `{ customer, transactions }` (full history, unpaginated).

---

## Transactions

### POST /transactions
Body: `{ customerId, amount, type: "CREDIT"|"PAYMENT", description?, transcript?, source? }`
The backend computes `balanceBefore`/`balanceAfter` from the customer's current balance —
it never trusts a balance sent by the client. Also generates the PDF receipt automatically.

Response `data`: `{ transaction, customer }`

### GET /transactions?customerId=&type=&from=&to=&search=&page=&limit=

### GET /transactions/:id

---

## Voice

### POST /voice/extract
Body: `{ transcript: "Ramesh ko 500 rupaye udhaar diya", customerId? }`
Runs the rule-based NLP parser. If `customerId` is supplied, that customer's name overrides
whatever name the parser guessed from speech.

Response `data`: `{ extraction: { customerName, amount, type, confidence, rawText }, needsReview: boolean, customer }`

---

## Bills

### GET /bills?page=&limit=
List all generated receipts for the merchant.

### GET /bills/:transactionId
Bill metadata.

### GET /bills/:transactionId/download
Streams the PDF (regenerates it if the file is missing).

### POST /bills/:transactionId/send-whatsapp
Sends via Twilio if configured; otherwise returns a `wa.me` fallback link.

Response `data` (fallback mode): `{ mode: "fallback", message, whatsappWebUrl, pdfDownloadUrl, info }`
Response `data` (Twilio mode): `{ mode: "twilio", message, sent: true }`

---

## Reports

### GET /reports/customer/:id?from=&to=
Defaults to the last 30 days if no range given.
Returns `{ customer, period, transactions, totals: { totalCredit, totalPayment, outstanding } }`.

### GET /reports/customer/:id/pdf?from=&to=
Streams a generated customer statement PDF.
