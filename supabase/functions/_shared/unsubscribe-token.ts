import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * HMAC-signed unsubscribe tokens.
 * Prevents attackers from disabling other users' notifications by guessing emails.
 *
 * Token format: base64url(HMAC_SHA256(secret, `${email}|${type}|${exp}`)) + '.' + exp
 */

const DEFAULT_TTL_DAYS = 90; // links in old emails stay valid ~3 months

function getSecret(): string {
  // Reuse service role key as the HMAC secret — already secret, available in every edge fn.
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_JWT_SECRET");
  if (!secret) throw new Error("Unsubscribe HMAC secret is not configured");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createUnsubscribeToken(email: string, type?: string | null, ttlDays = DEFAULT_TTL_DAYS): string {
  const exp = Math.floor(Date.now() / 1000) + ttlDays * 24 * 60 * 60;
  const normalized = `${email.toLowerCase()}|${type || ""}|${exp}`;
  const sig = sign(normalized);
  return `${sig}.${exp}`;
}

export function verifyUnsubscribeToken(token: string, email: string, type?: string | null): boolean {
  if (!token || !email) return false;
  const [sig, expStr] = token.split(".");
  if (!sig || !expStr) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;

  const normalized = `${email.toLowerCase()}|${type || ""}|${exp}`;
  const expected = sign(normalized);
  try {
    const enc = new TextEncoder();
    const a = enc.encode(sig);
    const b = enc.encode(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function buildUnsubscribeUrl(baseUrl: string, email: string, type?: string | null): string {
  const token = createUnsubscribeToken(email, type);
  const typeParam = type ? `&type=${encodeURIComponent(type)}` : "";
  return `${baseUrl}?email=${encodeURIComponent(email)}${typeParam}&token=${encodeURIComponent(token)}`;
}