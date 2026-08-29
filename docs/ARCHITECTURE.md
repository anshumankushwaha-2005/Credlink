# Architecture

## Overview

```
Browser (React SPA)
   │  Web Speech API (voice capture, hi-IN)
   │  Axios (JWT bearer auth)
   ▼
Express REST API
   │
   ├── authMiddleware ─── verifies JWT, loads req.merchant
   │
   ├── nlpService ──────── rule-based Hindi/Hinglish/English parser
   │                       (swap-in point for an LLM-based extractor later)
   │
   ├── ledgerService ───── single source of truth for balances
   │       │                - reads customer.currentBalance fresh from DB
   │       │                - computes balanceBefore/After
   │       │                - writes Transaction + updates Customer
   │       │                - uses a Mongo session transaction when available,
   │       │                  falls back to sequential writes on standalone Mongo
   │       ▼
   │   pdfService ───────── generates the receipt/statement PDF (PDFKit)
   │
   └── notificationService ─ Twilio WhatsApp when configured,
                              otherwise a wa.me fallback link
```

## Why the backend owns the balance

The frontend never sends a balance to the API — only `{ customerId, amount, type }`. This
avoids a class of bugs (and abuse) where a stale or manipulated frontend balance could
corrupt the ledger. `ledgerService.recordTransaction()` re-reads the customer document
immediately before writing, so concurrent requests always see the latest balance.

## NLP extraction pipeline

`nlpService.extractTransaction(transcript)`:

1. **Amount** — first tries a digit regex (`"500"`), then falls back to a small dictionary of
   Hindi number words (`paanch sau` → 500) for fully-spoken amounts.
2. **Type** — Hindi grammar hint: `"<name> ko ... diya/udhaar"` implies credit *given to* the
   customer; `"<name> ne ... de diye"` implies the customer *paid back* the merchant. Falls
   back to keyword scoring (`udhaar`, `karz` vs `wapas`, `chuka`, `jama`, `payment`).
3. **Customer name** — prefers the word immediately before `ko`/`ne`, else the first
   plausible non-stopword token.
4. **Confidence** — combination of type-keyword strength and whether amount/name were found.
   Below 0.5, the frontend shows an editable review screen instead of auto-saving.

This keeps the whole demo working with zero paid APIs. `OPENAI_API_KEY` /
`OPENROUTER_API_KEY` are reserved in `.env` for anyone who wants to swap in an LLM-based
extractor — the call site (`voiceController.extractFromVoice`) only needs the service
function's return shape to stay the same.

## PDF generation flow

1. Transaction confirmed by merchant → `POST /api/transactions`
2. `ledgerService` validates, calculates balances, saves the `Transaction`, updates `Customer`
3. `generateReceiptNumber()` produces a unique `CRL-YYYYMMDD-####` number (per-day sequence)
4. `pdfService.generateTransactionPDF()` renders the receipt with PDFKit and saves it under
   `server/generated/bills/<receiptNumber>.pdf`
5. The transaction document is updated with `pdfPath` / `pdfGenerated: true`
6. The API response includes the transaction so the frontend can immediately show
   **View / Download / Send on WhatsApp** actions

If PDF generation fails, the transaction is still saved — the error is logged and the PDF
can be regenerated on demand via `GET /api/bills/:id/download` (which regenerates if the file
is missing).

## WhatsApp sharing

`notificationService.sendWhatsAppReceipt()`:

- **Twilio configured:** sends a WhatsApp message with the PDF as a media attachment via the
  Twilio API.
- **Twilio not configured (default):** builds a `wa.me` deep link with a pre-filled message
  and returns it alongside the PDF download URL, so the merchant can open WhatsApp and attach
  the already-downloaded PDF manually. The app never crashes or blocks this flow.
