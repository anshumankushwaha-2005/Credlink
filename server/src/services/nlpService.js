/**
 * Rule-based Hindi / Hinglish / English transaction extractor.
 *
 * This is deliberately dependency-free so the whole project works without any
 * paid LLM API. If OPENAI_API_KEY or OPENROUTER_API_KEY is set, extractTransaction()
 * can be swapped to call an LLM instead (see callLLMExtractor below) - the rule
 * based parser is always used as the fallback/default.
 *
 * Grammar note this handles:
 *   "<Name> ko <amount> rupaye udhaar diya"   -> CREDIT  (merchant gave credit TO <Name>)
 *   "<Name> ne <amount> rupaye de diye"       -> PAYMENT (<Name> paid the merchant back)
 */

const env = require('../config/env');

// Common Hindi number words -> digits, for amounts spoken instead of typed.
const HINDI_NUMBER_WORDS = {
  ek: 1, do: 2, teen: 3, char: 4, chaar: 4, paanch: 5, panch: 5, che: 6, chhe: 6,
  saat: 7, aath: 8, nau: 9, das: 10, dus: 10,
  bees: 20, tees: 30, chaalis: 40, chalis: 40, pachaas: 50, pachas: 50,
  saath: 60, sattar: 70, assi: 80, nabbe: 90,
  sau: 100, hazaar: 1000, hazar: 1000, lakh: 100000,
};

const CREDIT_KEYWORDS = [
  'udhaar', 'udhar', 'karz', 'karza', 'karza diya', 'credit', 'diya', 'de diya', 'liya diya',
];
const PAYMENT_KEYWORDS = [
  'de diye', 'diye', 'wapas', 'chuka', 'chukaya', 'jama', 'payment', 'paid', 'pay kiya',
  'mila', 'mile', 'received', 'bhar diya', 'bharaya',
];

const STOPWORDS = new Set([
  'ko', 'ne', 'ka', 'ki', 'ke', 'se', 'rupaye', 'rupay', 'rupya', 'rupees', 'rs',
  'diya', 'diye', 'de', 'liya', 'udhaar', 'udhar', 'karz', 'karza', 'wapas',
  'chuka', 'chukaya', 'jama', 'payment', 'paid', 'mila', 'mile', 'received',
  'the', 'to', 'a', 'an', 'and', 'gave', 'give', 'paid', 'has', 'have', 'rupee',
]);

function wordsToAmount(text) {
  // Handles patterns like "paanch sau" (500), "do hazaar" (2000)
  const tokens = text.toLowerCase().split(/\s+/);
  let total = 0;
  let matchedAny = false;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i].replace(/[^a-z]/g, '');
    if (HINDI_NUMBER_WORDS[t] !== undefined) {
      matchedAny = true;
      const val = HINDI_NUMBER_WORDS[t];
      if (val >= 100 && total > 0) {
        total = total * val;
      } else {
        total += val;
      }
    }
  }
  return matchedAny ? total : null;
}

function extractAmount(text) {
  const digitMatch = text.match(/(\d+(?:[.,]\d+)?)/);
  if (digitMatch) {
    return parseFloat(digitMatch[1].replace(',', ''));
  }
  const wordAmount = wordsToAmount(text);
  return wordAmount;
}

function scoreKeywords(text, keywords) {
  let score = 0;
  for (const kw of keywords) {
    if (text.includes(kw)) score += 1;
  }
  return score;
}

function extractType(text) {
  const lower = text.toLowerCase();
  const creditScore = scoreKeywords(lower, CREDIT_KEYWORDS);
  const paymentScore = scoreKeywords(lower, PAYMENT_KEYWORDS);

  // "X ko ... diya" strongly implies credit given TO X.
  const hasKoDiya = /\bko\b[^|]*\b(diya|udhaar|udhar|karz)\b/.test(lower);
  // "X ne ... de diye / diye" implies X paid the merchant back.
  const hasNePaid = /\bne\b[^|]*\b(de diye|diye|wapas|chuka|jama|paid|pay)\b/.test(lower);

  let finalCreditScore = creditScore + (hasKoDiya ? 2 : 0);
  let finalPaymentScore = paymentScore + (hasNePaid ? 2 : 0);

  if (finalCreditScore === 0 && finalPaymentScore === 0) {
    return { type: null, confidence: 0 };
  }

  const type = finalCreditScore >= finalPaymentScore ? 'CREDIT' : 'PAYMENT';
  const winningScore = Math.max(finalCreditScore, finalPaymentScore);
  const totalScore = finalCreditScore + finalPaymentScore;
  const confidence = totalScore > 0 ? winningScore / (winningScore + 1) : 0;

  return { type, confidence: Math.min(confidence, 0.95) };
}

function extractCustomerName(text) {
  // Prefer the word immediately before "ko" or "ne" (typical Hindi sentence structure).
  const koMatch = text.match(/([A-Za-z]+)\s+ko\b/i);
  if (koMatch) return capitalize(koMatch[1]);

  const neMatch = text.match(/([A-Za-z]+)\s+ne\b/i);
  if (neMatch) return capitalize(neMatch[1]);

  // Fallback: first capitalized word that's not a stopword/number.
  const tokens = text.split(/\s+/);
  for (const tok of tokens) {
    const clean = tok.replace(/[^A-Za-z]/g, '');
    if (!clean) continue;
    if (STOPWORDS.has(clean.toLowerCase())) continue;
    if (/^\d+$/.test(tok)) continue;
    if (/^[A-Z]/.test(clean) || clean.length > 2) {
      return capitalize(clean);
    }
  }
  return null;
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Extracts { customerName, amount, type, confidence, rawText } from a transcript.
 * confidence is 0-1; callers should treat < 0.5 as "needs manual review".
 */
const axios = require('axios');

async function extractTransaction(transcript) {
  const rawText = (transcript || '').trim();
  if (!rawText) {
    return { customerName: null, amount: null, type: null, confidence: 0, rawText };
  }

  // If Groq API Key is configured, use it for extraction
  if (env.GROQ_API_KEY) {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are a transaction extraction assistant for CredLink, an Indian digital credit ledger (Bahi-Khata).\nYour task is to parse a spoken transaction transcript in Hindi, Hinglish, or English and extract:\n1. customerName: The name of the customer. Always write this name in Latin/English characters (e.g., write "Ramesh" instead of "रमेश"). Capitalize it correctly. Return null if not mentioned.\n2. amount: The transaction amount as a number. Return null if not mentioned.\n3. type: Either "CREDIT" (udhaar diya, credit, khata) or "PAYMENT" (jama kiya, mila, payment, paid back, wapas kiya). Return null if not mentioned.\n4. confidence: A float between 0.0 and 1.0.\n\nReturn ONLY a JSON object in this format:\n{\n  "customerName": string | null,\n  "amount": number | null,\n  "type": "CREDIT" | "PAYMENT" | null,\n  "confidence": number\n}'
            },
            {
              role: 'user',
              content: `Parse this transcript: "${rawText}"`
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 4000
        }
      );

      const resultText = response.data?.choices?.[0]?.message?.content;
      if (resultText) {
        const parsed = JSON.parse(resultText);
        return {
          customerName: parsed.customerName || null,
          amount: parsed.amount || null,
          type: parsed.type || null,
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
          rawText
        };
      }
    } catch (err) {
      console.error('Groq NLP extraction failed, falling back to rule-based parser:', err.message);
    }
  }

  // Fallback to rule-based local parser
  const amount = extractAmount(rawText);
  const { type, confidence: typeConfidence } = extractType(rawText);
  const customerName = extractCustomerName(rawText);

  let confidence = typeConfidence;
  if (amount === null) confidence *= 0.4;
  if (!customerName) confidence *= 0.5;
  if (!type) confidence = 0;

  return {
    customerName,
    amount,
    type,
    confidence: Math.round(confidence * 100) / 100,
    rawText,
  };
}

module.exports = { extractTransaction };
