# Database Design

MongoDB via Mongoose. Four collections.

## Merchant

| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique, lowercase, indexed |
| businessName | String | required |
| phone | String | optional |
| isVerified | Boolean | set true after first successful OTP verification |
| createdAt / updatedAt | Date | timestamps |

## OTP

| Field | Type | Notes |
|---|---|---|
| email | String | indexed |
| otpHash | String | HMAC-SHA256(otp, salt) — plaintext OTP is never stored |
| salt | String | random per-request |
| attempts | Number | incremented on each wrong guess, capped by `OTP_MAX_ATTEMPTS` |
| verified | Boolean | set true on success, then the doc is deleted |
| expiresAt | Date | TTL index — MongoDB auto-deletes expired OTPs |

## Customer

| Field | Type | Notes |
|---|---|---|
| merchantId | ObjectId → Merchant | required, indexed — every query is scoped by this |
| name | String | required |
| phone | String | |
| whatsappNumber | String | defaults to `phone` if not given |
| address | String | |
| currentBalance | Number | source of truth for outstanding credit, only ever changed by `ledgerService` |
| isActive | Boolean | soft-delete flag |
| createdAt / updatedAt | Date | |

Compound index: `{ merchantId: 1, name: 1 }` for fast per-merchant name search.

## Transaction

| Field | Type | Notes |
|---|---|---|
| merchantId | ObjectId → Merchant | required, indexed |
| customerId | ObjectId → Customer | required, indexed |
| amount | Number | required, > 0 |
| type | String enum | `CREDIT` \| `PAYMENT` |
| description | String | free text or the raw transcript |
| transcript | String | original spoken text, if `source: "voice"` |
| source | String enum | `voice` \| `manual` |
| balanceBefore | Number | customer's balance immediately before this transaction |
| balanceAfter | Number | customer's balance immediately after |
| receiptNumber | String | unique, format `CRL-YYYYMMDD-####` |
| pdfPath | String | absolute path under `server/generated/bills/` |
| pdfGenerated | Boolean | |
| whatsappSent | Boolean | true only when sent via the Twilio path |
| createdAt / updatedAt | Date | |

Indexes: `{ merchantId: 1, createdAt: -1 }`, `{ customerId: 1, createdAt: -1 }` for fast
dashboard/history queries sorted by recency.

## Data isolation

Every controller derives `merchantId` from the authenticated JWT (`req.merchantId`, set in
`authMiddleware.js`) and includes it in every Mongo query and every write. There is no
endpoint that accepts a `merchantId` from the request body — this is what guarantees
Merchant A can never read or modify Merchant B's customers or transactions.
