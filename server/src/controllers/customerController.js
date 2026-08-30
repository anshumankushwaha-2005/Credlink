const path = require('path');
const fs = require('fs');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const { ok, fail } = require('../utils/response');

/** GET /api/customers?search=&page=&limit= */
async function listCustomers(req, res, next) {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const query = { merchantId: req.merchantId, isActive: true };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [customers, total] = await Promise.all([
      Customer.find(query).sort({ updatedAt: -1 }).skip(skip).limit(Number(limit)),
      Customer.countDocuments(query),
    ]);

    return ok(res, { customers, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

function normalizeAndValidatePhone(phone) {
  if (!phone) return { valid: true, normalized: '' };

  // Remove all non-digits
  let digits = phone.replace(/\D/g, '');

  // Normalize prefix:
  if (digits.startsWith('0091') && digits.length === 14) {
    digits = digits.slice(4);
  } else if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  const isValid = /^[6-9]\d{9}$/.test(digits);
  return { valid: isValid, normalized: digits };
}

function extractPhone(text) {
  if (!text) return null;
  const matches = String(text).match(/(?:\+?\d[\s-]*){10,14}/g);
  if (matches) {
    for (const m of matches) {
      const { valid, normalized } = normalizeAndValidatePhone(m);
      if (valid && normalized) {
        return normalized;
      }
    }
  }
  return null;
}

function cleanupCustomerName(name, phone) {
  if (!name) return name;
  let clean = String(name);
  if (phone) {
    clean = clean.replace(new RegExp(phone, 'g'), '');
    clean = clean.replace(/(?:\+?91|0091|0)\b/g, '');
  }
  clean = clean.replace(/\b(?:ka number|number|phone|mobile|ka|no|num)\b/gi, '');
  clean = clean.replace(/[^A-Za-z\s]/g, '');
  return clean.replace(/\s+/g, ' ').trim();
}

/** POST /api/customers */
async function createCustomer(req, res, next) {
  try {
    let { name, phone, whatsappNumber, address } = req.body;
    if (!name) return fail(res, 'Customer name is required.', 400);

    // 1. Voice flow might send phone inside name or as separate field
    let extractedPhone = extractPhone(phone) || extractPhone(name);

    if (extractedPhone) {
      name = cleanupCustomerName(name, extractedPhone);
      phone = extractedPhone;
    }

    // 2. Validate and normalize phone if present
    if (phone) {
      const { valid, normalized } = normalizeAndValidatePhone(phone);
      if (!valid) {
        return fail(res, 'Invalid phone number. Must be a 10-digit Indian mobile number starting with 6, 7, 8 or 9.', 400);
      }
      phone = normalized;
      whatsappNumber = whatsappNumber || phone;
    } else {
      phone = '';
      whatsappNumber = whatsappNumber || '';
    }

    const customer = await Customer.create({
      merchantId: req.merchantId,
      name,
      phone,
      whatsappNumber: whatsappNumber || phone,
      address,
      profilePhoto: req.body.profilePhoto || '',
    });

    return ok(res, { customer }, 'Customer created', 201);
  } catch (err) {
    next(err);
  }
}

/** GET /api/customers/:id */
async function getCustomer(req, res, next) {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, merchantId: req.merchantId });
    if (!customer) return fail(res, 'Customer not found.', 404);

    const transactions = await Transaction.find({ customerId: customer._id }).sort({ createdAt: -1 }).limit(50);

    const totalCredit = transactions.filter((t) => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
    const totalPayment = transactions.filter((t) => t.type === 'PAYMENT').reduce((s, t) => s + t.amount, 0);

    return ok(res, {
      customer,
      transactions,
      summary: {
        totalCredit,
        totalPayment,
        lastTransaction: transactions[0] || null,
      },
    });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/customers/:id */
async function updateCustomer(req, res, next) {
  try {
    const existing = await Customer.findOne({ _id: req.params.id, merchantId: req.merchantId });
    if (!existing) return fail(res, 'Customer not found.', 404);

    let { name, phone, whatsappNumber, address, profilePhoto } = req.body;

    if (name === undefined) name = existing.name;
    if (phone === undefined) phone = existing.phone;
    if (whatsappNumber === undefined) whatsappNumber = existing.whatsappNumber;
    if (address === undefined) address = existing.address;
    if (profilePhoto === undefined) profilePhoto = existing.profilePhoto;

    if (!name) return fail(res, 'Customer name is required.', 400);

    // Validate and normalize phone if present
    if (phone) {
      const { valid, normalized } = normalizeAndValidatePhone(phone);
      if (!valid) {
        return fail(res, 'Invalid phone number. Must be a 10-digit Indian mobile number starting with 6, 7, 8 or 9.', 400);
      }
      phone = normalized;
      whatsappNumber = whatsappNumber || phone;
    } else {
      phone = '';
      whatsappNumber = whatsappNumber || '';
    }

    // Clean up old profile photo if it changed or was removed
    if (profilePhoto !== undefined && existing.profilePhoto && existing.profilePhoto !== profilePhoto) {
      const oldPath = path.join(__dirname, '..', '..', existing.profilePhoto);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (e) {
          console.error('Failed to delete old profile photo:', e.message);
        }
      }
    }

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, merchantId: req.merchantId },
      { $set: { name, phone, whatsappNumber, address, profilePhoto } },
      { new: true, runValidators: true }
    );
    return ok(res, { customer }, 'Customer updated');
  } catch (err) {
    next(err);
  }
}

/** POST /api/customers/upload-photo */
async function uploadCustomerPhoto(req, res, next) {
  try {
    if (!req.file) {
      return fail(res, 'No image file uploaded.', 400);
    }

    const relativePath = `/uploads/profiles/${req.file.filename}`;
    return ok(res, { profilePhoto: relativePath }, 'Customer photo uploaded successfully');
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/customers/:id - soft delete (deactivate) */
async function deleteCustomer(req, res, next) {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, merchantId: req.merchantId },
      { $set: { isActive: false } },
      { new: true }
    );
    if (!customer) return fail(res, 'Customer not found.', 404);
    return ok(res, { customer }, 'Customer deactivated');
  } catch (err) {
    next(err);
  }
}

module.exports = { listCustomers, createCustomer, getCustomer, updateCustomer, deleteCustomer, uploadCustomerPhoto };
