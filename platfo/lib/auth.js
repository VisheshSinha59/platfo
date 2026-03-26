import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "platfo_secret_key";
const JWT_EXPIRES = "24h";

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password, hash) {
  try {
    console.log("comparePassword called");
    console.log("password:", password);
    console.log("hash start:", hash ? hash.substring(0, 10) : "NULL");

    if (!hash) return false;

    if (hash.startsWith("$2")) {
      const result = await bcrypt.compare(String(password), String(hash));
      console.log("bcrypt result:", result);
      return result;
    }

    const result = String(password) === String(hash);
    console.log("plain compare result:", result);
    return result;

  } catch (err) {
    console.error("comparePassword error:", err.message);
    return false;
  }
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token) {
  try {
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

const rateLimitMap = new Map();

export function rateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, []);
  }

  const requests = rateLimitMap.get(key).filter((time) => time > windowStart);
  requests.push(now);
  rateLimitMap.set(key, requests);

  return requests.length <= maxRequests;
}

export function sanitizeString(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/[<>]/g, "")
    .replace(/\$/g, "")
    .trim()
    .slice(0, 500);
}

export function sanitizeNumber(num) {
  const n = Number(num);
  return isNaN(n) ? 0 : n;
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function validatePhone(phone) {
  return /^\d{10}$/.test(String(phone));
}