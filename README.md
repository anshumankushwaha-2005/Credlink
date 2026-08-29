# CredLink — A Digital Ledger for Merchant-Retailer Credit

CredLink digitizes the traditional Indian **bahi-khata / udhaar** system used by small
retailers. A merchant can simply say *"Ramesh ko 500 rupaye udhaar diya"* and CredLink
converts speech to text, extracts the customer, amount and transaction type, updates the
ledger, generates a professional PDF receipt, and offers to share it on WhatsApp.

> **College major project — full-stack MERN application.**

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Development Mode (No Paid APIs)](#development-mode-no-paid-apis)
- [Demo Data](#demo-data)
- [Testing Checklist](#testing-checklist)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Problem Statement

Small retailers in India (kirana shops, wholesalers) track customer credit ("udhaar") in a
paper ledger. This is error-prone, hard to search, impossible to back up, and gives
customers no digital proof of their balance.

## Solution

CredLink replaces the paper ledger with a voice-first web app: speak the transaction, the
system extracts the details, the merchant confirms, and everything — ledger, balance, PDF
bill, and WhatsApp receipt — happens automatically.

## Features

- Email/Gmail OTP authentication (no phone OTP, no passwords)
- Merchant dashboard with live stats
- Customer management (add / edit / deactivate / search)
- Voice transaction capture (Web Speech API, Hindi/Hinglish support)
- Rule-based NLP transaction extraction (works with zero paid APIs)
- Credit/payment ledger with backend-enforced balance calculation
- Automatic PDF bill/receipt generation after every transaction
- Customer statements (date-range PDF reports)
- WhatsApp sharing — Twilio API when configured, WhatsApp Web fallback otherwise
- Full transaction history with search/filter
- Mobile-first, modern fintech-style UI

## Architecture

```
┌───────────────┐        HTTPS/JSON        ┌───────────────┐
│  React (Vite) │ ───────────────────────▶ │ Express API   │
│  client/      │ ◀─────────────────────── │ server/       │
└───────────────┘                          └───────┬───────┘
                                                    │
                       ┌────────────────────────────┼───────────────────────────┐
                       ▼                            ▼                           ▼
                 MongoDB (Mongoose)         PDFKit (bill/statement)     Nodemailer / Twilio
```

The backend is the single source of truth for every customer's balance — the frontend never
sends or trusts a balance value; it only sends `{ customerId, amount, type }` and the ledger
service computes `balanceBefore` / `balanceAfter` from what's actually in the database.

## Tech Stack

**Frontend:** React 18, Vite, React Router, Axios, Tailwind CSS, lucide-react, react-hot-toast
**Backend:** Node.js, Express, Mongoose, JWT, Nodemailer, PDFKit, Twilio (optional)
**Database:** MongoDB / MongoDB Atlas
**Voice:** Browser Web Speech API (Hindi `hi-IN` locale)
**NLP:** Rule-based Hindi/Hinglish/English parser (`server/src/services/nlpService.js`)

## Folder Structure

```
credlink/
├── client/            React frontend (Vite)
│   └── src/
│       ├── pages/          Landing, Login, VerifyOTP, Dashboard, Customers,
│       │                   CustomerDetails, VoiceTransaction, Transactions,
│       │                   Bills, Reports, Profile, NotFound
│       ├── components/     layout, common
│       ├── services/       api.js + one service module per resource
│       ├── context/        AuthContext
│       ├── hooks/          useAuth, useVoice
│       └── utils/          formatCurrency, formatDate, validators
├── server/            Express backend
│   ├── generated/bills/    PDFs generated at runtime (gitignored)
│   └── src/
│       ├── config/         env.js, db.js
│       ├── models/         Merchant, Customer, Transaction, OTP
│       ├── controllers/    auth, customer, transaction, voice, bill, report
│       ├── routes/         one router per resource
│       ├── services/       otp, email, jwt, nlp, ledger, pdf, notification
│       ├── middleware/     auth, error, rate-limit
│       ├── utils/          generateOTP, hashOTP, generateReceiptNumber, response, logger
│       ├── app.js / server.js
│       └── seed.js         Demo data generator
└── docs/              API.md, DATABASE.md, ARCHITECTURE.md, SETUP.md
```

## Database Schema

**Merchant** — `name, email (unique), businessName, phone, isVerified, timestamps`

**Customer** — `merchantId, name, phone, whatsappNumber, address, currentBalance, isActive, timestamps`

**Transaction** — `merchantId, customerId, amount, type (CREDIT|PAYMENT), description, transcript, source (voice|manual), balanceBefore, balanceAfter, receiptNumber (unique), pdfPath, pdfGenerated, whatsappSent, timestamps`

**OTP** — `email, otpHash, salt, attempts, verified, expiresAt (TTL index)`

See [docs/DATABASE.md](docs/DATABASE.md) for indexes and design notes.

## API Documentation

Full reference in [docs/API.md](docs/API.md). Summary:

```
POST   /api/auth/send-otp
POST   /api/auth/verify-otp
GET    /api/auth/me
PUT    /api/auth/me
POST   /api/auth/logout

GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id
GET    /api/customers/:id/transactions

GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/:id

POST   /api/voice/extract

GET    /api/bills
GET    /api/bills/:transactionId
GET    /api/bills/:transactionId/download
POST   /api/bills/:transactionId/send-whatsapp

GET    /api/reports/customer/:id
GET    /api/reports/customer/:id/pdf
```

## Setup

### 1. Prerequisites

- Node.js 18+
- A MongoDB connection string (local `mongod` or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 2. Clone & install

```bash
cd credlink
npm run install:all
# or manually:
cd server && npm install
cd ../client && npm install
```

### 3. Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` — at minimum set `MONGODB_URI` and `JWT_SECRET`. Everything else
(Gmail SMTP, Twilio, OpenAI) is optional — see [Development Mode](#development-mode-no-paid-apis).

#### Gmail App Password setup (optional — for real OTP emails)

1. Enable 2-Step Verification on the Gmail account: https://myaccount.google.com/security
2. Go to **App Passwords**, create one for "Mail".
3. Put the generated 16-character password in `SMTP_PASS`, and the Gmail address in `SMTP_USER`.
4. Never commit `.env` — it's already in `.gitignore`.

### 4. Run

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Frontend: http://localhost:5173  ·  Backend: http://localhost:5000/api/health

### 5. (Optional) Seed demo data

```bash
cd server && npm run seed
```

Creates merchant `demo@credlink.test` / "Sharma General Store" with 4 customers
(Ramesh, Sunita, Raj, Amit) and sample transactions + generated PDF receipts.

## Environment Variables

See `server/.env.example` and `client/.env.example` for the full list with comments.
Key ones:

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | Yes | Local or Atlas connection string |
| `JWT_SECRET` | Yes | Long random string |
| `SMTP_USER` / `SMTP_PASS` | No | Leave empty → Development OTP mode (console) |
| `TWILIO_*` | No | Leave empty → WhatsApp Web fallback link |
| `OPENAI_API_KEY` / `OPENROUTER_API_KEY` | No | Rule-based NLP is used by default |

## Development Mode (No Paid APIs)

CredLink is designed to be **fully demonstrable for free**:

| Feature | Without paid API | With paid API |
|---|---|---|
| OTP login | OTP printed to backend console | Real email via Gmail SMTP |
| NLP extraction | Rule-based Hindi/Hinglish parser | (Optional) LLM-based extraction |
| WhatsApp sharing | Pre-filled `wa.me` link + PDF download | Twilio WhatsApp API auto-send |
| PDF storage | Local `server/generated/bills/` | Same, or swap in cloud storage |

## Demo Data

Run `npm run seed` inside `server/`. Demo merchant: `demo@credlink.test`. Since SMTP isn't
configured by default, requesting an OTP for this email will print the OTP to the backend
console — copy it into the Verify OTP screen.

## Testing Checklist

- [x] Frontend starts (`npm run dev` in `client/`)
- [x] Backend starts (`npm run dev` in `server/`)
- [ ] MongoDB connects (depends on your `MONGODB_URI`)
- [x] Gmail OTP works when SMTP is configured
- [x] Development OTP mode works when SMTP is not configured
- [x] JWT auth protects all merchant routes
- [x] Customer CRUD works, scoped to `merchantId`
- [x] Voice recognition captures Hindi/Hinglish/English speech (Chrome/Edge)
- [x] NLP extraction returns customer/amount/type with a confidence score
- [x] CREDIT and PAYMENT both update balances correctly
- [x] Receipt numbers are unique (`CRL-YYYYMMDD-####`)
- [x] PDF is generated automatically after every transaction
- [x] PDF download works (authenticated, streamed as blob)
- [x] Customer statement PDF covers a date range with totals
- [x] WhatsApp fallback link opens with a pre-filled message
- [x] WhatsApp Twilio path is used automatically when Twilio env vars are set
- [x] Merchant A cannot access Merchant B's customers/transactions (`merchantId` scoping on every query)
- [x] Mobile-responsive layout (bottom nav on small screens)
- [x] No secrets exposed to the frontend (SMTP/Twilio/OpenAI keys live only in `server/.env`)

## Deployment

- **Backend:** any Node host (Render, Railway, Fly.io, EC2). Set all `server/.env` variables
  in the platform's environment settings; do not commit `.env`.
- **Frontend:** any static host (Vercel, Netlify, Cloudflare Pages). Set `VITE_API_URL` to
  your deployed backend's `/api` URL.
- **Database:** MongoDB Atlas (free tier is sufficient for a college project demo).
- **PDF storage:** for production, mount a persistent volume or swap `pdfService.js`'s file
  writes for an S3/GCS upload — the function signature (`generateTransactionPDF`) is designed
  to be easy to adapt.

## Troubleshooting

- **"MongoDB connection error"** — check `MONGODB_URI`; for Atlas, make sure your IP is
  whitelisted (or allow `0.0.0.0/0` for a class demo).
- **OTP never arrives by email** — you're likely still in Development OTP mode; check the
  backend console. Confirm `SMTP_USER`/`SMTP_PASS` are both set for real email.
- **Voice button does nothing** — the Web Speech API needs Chrome/Edge and a secure context
  (`localhost` is fine; a deployed site needs HTTPS) and microphone permission.
- **WhatsApp button opens a blank tab** — Twilio isn't configured; this is expected fallback
  behavior. The `wa.me` link opens WhatsApp Web/App with the message pre-filled.
- **"CORS error" in the browser console** — make sure `CLIENT_URL` in `server/.env` matches
  the URL you're loading the frontend from exactly (including port).
