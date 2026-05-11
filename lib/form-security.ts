type SpamGuardInput = {
  honeypot?: string;
  startedAt?: number;
  minDurationMs?: number;
};

type SpamGuardResult = {
  ok: boolean;
  reason?: string;
};

const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const SUSPICIOUS_CONTENT_REGEX = /(https?:\/\/|www\.|<\/?[a-z][^>]*>|javascript:|\b(?:viagra|casino|backlink|seo service|crypto giveaway)\b)/i;

function stripControlChars(value: string) {
  return value.replace(CONTROL_CHARS_REGEX, "");
}

export function sanitizeSingleLine(value: string, maxLength: number) {
  return stripControlChars(value).replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function sanitizeMultiline(value: string, maxLength: number) {
  return stripControlChars(value)
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, maxLength);
}

export function hasSuspiciousContent(...values: string[]) {
  return values.some((value) => SUSPICIOUS_CONTENT_REGEX.test(value));
}

export function validateSpamGuard(input: SpamGuardInput): SpamGuardResult {
  const honeypot = input.honeypot?.trim();
  if (honeypot) {
    return { ok: false, reason: "honeypot_triggered" };
  }

  if (!Number.isFinite(input.startedAt)) {
    return { ok: false, reason: "missing_started_at" };
  }

  const elapsed = Date.now() - Number(input.startedAt);
  const minDurationMs = input.minDurationMs ?? 1500;
  if (elapsed < minDurationMs) {
    return { ok: false, reason: "submitted_too_quickly" };
  }

  return { ok: true };
}

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "";
  }

  return request.headers.get("x-real-ip") ?? "";
}

export async function verifyTurnstileToken(token: string | undefined, remoteIp?: string): Promise<SpamGuardResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    return { ok: true };
  }

  if (!token?.trim()) {
    return { ok: false, reason: "captcha_missing" };
  }

  const body = new URLSearchParams({
    secret: secretKey,
    response: token,
  });

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      return { ok: false, reason: "captcha_unavailable" };
    }

    const payload = (await response.json()) as {
      success?: boolean;
      [key: string]: unknown;
    };

    return payload.success ? { ok: true } : { ok: false, reason: "captcha_failed" };
  } catch {
    return { ok: false, reason: "captcha_unavailable" };
  }
}
