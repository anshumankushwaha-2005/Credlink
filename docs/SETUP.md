# Setup Guide

## 1. Requirements

- Node.js 18 or newer
- A MongoDB database — either:
  - Local: `mongod` running on `mongodb://127.0.0.1:27017`, or
  - Free cloud: [MongoDB Atlas](https://www.mongodb.com/atlas) M0 cluster

## 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

## 3. Configure `server/.env`

```bash
cp server/.env.example server/.env
```

Minimum required:

```
MONGODB_URI=mongodb://127.0.0.1:27017/credlink
JWT_SECRET=some_long_random_string
CLIENT_URL=http://localhost:5173
```

Everything else can stay blank for local development — see the Development Mode section in
the main README.

### MongoDB Atlas quick setup

1. Create a free cluster at https://www.mongodb.com/atlas
2. Database Access → add a user with a password
3. Network Access → add your IP (or `0.0.0.0/0` for a class demo)
4. Connect → "Drivers" → copy the connection string into `MONGODB_URI`, filling in the
   username/password and adding `/credlink` before the `?` query string

### Gmail App Password (optional, for real OTP emails)

1. https://myaccount.google.com/security → enable 2-Step Verification
2. Search "App Passwords" → generate one for "Mail" / "Other"
3. Set `SMTP_USER=your_email@gmail.com` and `SMTP_PASS=<16-char app password>`

### Twilio WhatsApp (optional)

1. Create a Twilio account, enable the WhatsApp Sandbox (or a approved sender)
2. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`
   (format: `whatsapp:+14155238886` — but only the number part, without the `whatsapp:` prefix,
   goes in `TWILIO_WHATSAPP_NUMBER`; the code adds the prefix)

## 4. Configure `client/.env`

```bash
cp client/.env.example client/.env
```

```
VITE_API_URL=http://localhost:5000/api
```

## 5. Run

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Visit http://localhost:5173.

## 6. Seed demo data (optional but recommended for a first run)

```bash
cd server && npm run seed
```

Login with `demo@credlink.test`. Since SMTP isn't configured out of the box, request the OTP
and read it from the backend terminal (Development OTP Mode).

## 7. Voice feature notes

- Works best in Chrome or Edge (desktop or Android). Safari/iOS support for the Web Speech
  API is limited.
- The browser will ask for microphone permission the first time you tap the mic button.
- `localhost` counts as a secure context, so HTTPS isn't needed for local development — but
  a deployed instance does need HTTPS for the mic to work.
