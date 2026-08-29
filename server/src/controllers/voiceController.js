const { extractTransaction } = require('../services/nlpService');
const Customer = require('../models/Customer');
const { ok, fail } = require('../utils/response');
const axios = require('axios');
const FormData = require('form-data');
const env = require('../config/env');

async function transcribeVoice(req, res, next) {
  try {
    if (!env.GROQ_API_KEY) {
      return fail(res, 'GROQ_API_KEY is not configured on the server.', 500);
    }

    if (!req.file) {
      return fail(res, 'No audio file provided.', 400);
    }

    const { language } = req.body;

    // Construct multipart form data for Groq Whisper transcription API
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname || 'audio.webm',
      contentType: req.file.mimetype || 'audio/webm',
    });
    formData.append('model', 'whisper-large-v3');
    formData.append('temperature', '0.0');

    if (language && language !== 'auto') {
      formData.append('language', language);
    }

    // Hinglish/Indian Context prompt to force Whisper to transcribe Indian terms correctly
    formData.append('prompt', 'CredLink ledger transcription. Ramesh ko 500 rupaye udhaar diya. Suresh ne 1000 rupaye jama kiya. paanch sau rupaye jama, do hazaar rupaye udhaar.');

    const response = await axios.post(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    const text = response.data?.text;
    if (!text || !text.trim()) {
      return fail(res, 'Could not transcribe any audio content. Please speak clearly.', 422);
    }

    return ok(res, { text: text.trim() });
  } catch (err) {
    console.error('Groq Speech-to-Text API Error:', err.response?.data || err.message);
    const msg = err.response?.data?.error?.message || 'Failed to transcribe audio via Groq Whisper.';
    return fail(res, msg, err.response?.status || 500);
  }
}

function getLevenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * POST /api/voice/extract  { transcript, customerId? }
 * Runs the transcript through the rule-based NLP parser. If a customerId is
 * supplied (the user selected a customer before speaking) that name is trusted
 * over whatever name the parser guessed from speech.
 */
async function extractFromVoice(req, res, next) {
  try {
    const { transcript, customerId } = req.body;
    if (!transcript || !transcript.trim()) {
      return fail(res, 'transcript is required.', 400);
    }

    const extraction = await extractTransaction(transcript);

    let customer = null;
    let suggestions = [];

    if (customerId) {
      customer = await Customer.findOne({ _id: customerId, merchantId: req.merchantId });
      if (customer) extraction.customerName = customer.name;
    } else if (extraction.customerName) {
      const allCustomers = await Customer.find({ merchantId: req.merchantId, isActive: true });
      const cleanTarget = extraction.customerName.toLowerCase().trim();

      // 1. Check exact case-insensitive matches
      const exactMatches = allCustomers.filter(c => c.name.toLowerCase() === cleanTarget);

      if (exactMatches.length > 0) {
        if (exactMatches.length === 1) {
          customer = exactMatches[0];
          extraction.customerName = customer.name;
        } else {
          suggestions = exactMatches;
        }
      } else {
        // 2. Substring & fuzzy matches
        const fuzzyMatches = allCustomers.filter(c => {
          const cName = c.name.toLowerCase();
          if (cName.includes(cleanTarget) || cleanTarget.includes(cName)) {
            return true;
          }
          const dist = getLevenshteinDistance(cName, cleanTarget);
          // Allow max 2 edits, and it must be at least 65% similar
          return dist <= 2 && dist / Math.max(cName.length, cleanTarget.length) <= 0.35;
        });

        if (fuzzyMatches.length === 1) {
          customer = fuzzyMatches[0];
          extraction.customerName = customer.name;
        } else if (fuzzyMatches.length > 1) {
          suggestions = fuzzyMatches;
        }
      }
    }

    const needsReview = extraction.confidence < 0.5 || !extraction.amount || !extraction.type || !customer;

    return ok(res, { extraction, needsReview, customer, suggestions });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/voice/search-customer
 * Transcribes the audio block to get a customer's name, then searches their
 * profile in the merchant's customer ledger.
 */
async function searchCustomerByVoice(req, res, next) {
  try {
    if (!env.GROQ_API_KEY) {
      return fail(res, 'GROQ_API_KEY is not configured on the server.', 500);
    }

    if (!req.file) {
      return fail(res, 'No audio file provided.', 400);
    }

    // Call Groq Whisper translation endpoint to guarantee English/Latin character output
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname || 'audio.webm',
      contentType: req.file.mimetype || 'audio/webm',
    });
    formData.append('model', 'whisper-large-v3');
    formData.append('temperature', '0.0');
    formData.append('prompt', 'Sharma, Ramesh, Suresh, Rajesh, Vikas, Sunil, Amit, Rahul, Deepak.');

    const response = await axios.post(
      'https://api.groq.com/openai/v1/audio/translations',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    const text = response.data?.text;
    if (!text || !text.trim()) {
      return fail(res, 'Could not transcribe any customer name. Please speak clearly.', 422);
    }

    const cleanText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
    if (!cleanText) {
      return fail(res, 'Could not transcribe any customer name. Please speak clearly.', 422);
    }

    // 1. Try exact match first
    let exactCustomer = await Customer.findOne({
      merchantId: req.merchantId,
      name: { $regex: new RegExp('^' + cleanText + '$', 'i') }
    });

    // 2. Gather list of matching suggestions (max 5)
    let suggestionsMap = new Map();

    const addSuggestions = (list) => {
      for (const item of list) {
        if (suggestionsMap.size >= 5) break;
        suggestionsMap.set(item._id.toString(), item);
      }
    };

    // Substring match
    const subMatches = await Customer.find({
      merchantId: req.merchantId,
      name: { $regex: new RegExp(cleanText, 'i') }
    }).limit(5);
    addSuggestions(subMatches);

    // 3-letter prefix match
    if (suggestionsMap.size < 5 && cleanText.length >= 3) {
      const prefix3 = cleanText.slice(0, 3);
      const prefixMatches = await Customer.find({
        merchantId: req.merchantId,
        name: { $regex: new RegExp('^' + prefix3, 'i') }
      }).limit(5);
      addSuggestions(prefixMatches);
    }

    // 1-letter prefix match
    if (suggestionsMap.size < 5 && cleanText.length >= 1) {
      const firstLetter = cleanText.charAt(0);
      const firstLetterMatches = await Customer.find({
        merchantId: req.merchantId,
        name: { $regex: new RegExp('^' + firstLetter, 'i') }
      }).limit(5);
      addSuggestions(firstLetterMatches);
    }

    const suggestions = Array.from(suggestionsMap.values());

    // If there is exactly one close suggestion, auto-match it
    if (!exactCustomer && suggestions.length === 1) {
      exactCustomer = suggestions[0];
    }

    return ok(res, { transcript: cleanText, customer: exactCustomer, suggestions }, 'Customer search complete');
  } catch (err) {
    console.error('Customer Voice Search Error:', err.response?.data || err.message);
    const msg = err.response?.data?.error?.message || 'Failed to search customer via voice.';
    return fail(res, msg, err.response?.status || 500);
  }
}

module.exports = { extractFromVoice, transcribeVoice, searchCustomerByVoice };
