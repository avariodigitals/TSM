import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyContactOwner } from "@/lib/notifications";
import {
  getRequestIp,
  hasSuspiciousContent,
  sanitizeMultiline,
  sanitizeSingleLine,
  validateSpamGuard,
  verifyTurnstileToken,
} from "@/lib/form-security";
import { enforceRateLimit } from "@/lib/rate-limit";

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
  startedAt?: number;
  captchaToken?: string;
}

function isContactPayload(value: unknown): value is ContactPayload {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;

  return (
    typeof body.name === "string" &&
    typeof body.email === "string" &&
    typeof body.subject === "string" &&
    typeof body.message === "string"
  );
}

export async function POST(request: Request) {
  try {
    const requestIp = getRequestIp(request) || "unknown";
    const rateLimit = enforceRateLimit({
      scope: "contact",
      key: requestIp,
      maxRequests: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: "Too many submissions from this network. Please try again shortly.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    const json: unknown = await request.json();

    if (!isContactPayload(json)) {
      return NextResponse.json({ ok: false, message: "Invalid contact payload." }, { status: 400 });
    }

    const spamGuard = validateSpamGuard({
      honeypot: json.website,
      startedAt: json.startedAt,
      minDurationMs: 1200,
    });

    if (!spamGuard.ok) {
      return NextResponse.json({ ok: false, message: "Submission failed validation." }, { status: 400 });
    }

    const captchaResult = await verifyTurnstileToken(json.captchaToken, requestIp);
    if (!captchaResult.ok) {
      return NextResponse.json({ ok: false, message: "Captcha verification failed." }, { status: 400 });
    }

    const payload = {
      name: sanitizeSingleLine(json.name, 120),
      email: sanitizeSingleLine(json.email, 160).toLowerCase(),
      subject: sanitizeSingleLine(json.subject, 160),
      message: sanitizeMultiline(json.message, 4000),
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      return NextResponse.json({ ok: false, message: "Please complete all required fields." }, { status: 400 });
    }

    if (hasSuspiciousContent(payload.subject, payload.message, payload.name)) {
      return NextResponse.json({ ok: false, message: "Please remove links or scripts from your message." }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        fullName: payload.name,
        email: payload.email,
        phone: "Not provided",
        serviceNeeded: `Contact: ${payload.subject}`,
        city: "Contact form",
        postcode: "Not provided",
        jobDescription: payload.message,
        urgencyLevel: "standard",
        preferredContact: "email",
        notes: "Submitted through the Contact Us form.",
      },
    });

    try {
      const result = await notifyContactOwner(payload);

      if (!result.ok) {
        console.error("contact notification failed", { leadId: lead.id });
      }
    } catch (error) {
      console.error("contact notification error", error);
    }

    return NextResponse.json({ ok: true, id: lead.id, message: "Your message has been sent." }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Unable to send your message at this time." },
      { status: 500 }
    );
  }
}
