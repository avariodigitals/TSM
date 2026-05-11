import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyEnquiryOwner, notifyEnquiryUser } from "@/lib/notifications";
import {
  getRequestIp,
  hasSuspiciousContent,
  sanitizeMultiline,
  sanitizeSingleLine,
  validateSpamGuard,
  verifyTurnstileToken,
} from "@/lib/form-security";
import { enforceRateLimit } from "@/lib/rate-limit";

interface EnquiryPayload {
  fullName: string;
  email: string;
  phone: string;
  serviceNeeded: string;
  city: string;
  postcode: string;
  jobDescription: string;
  urgencyLevel: "standard" | "urgent" | "emergency";
  preferredContact: "email" | "phone" | "whatsapp";
  website?: string;
  startedAt?: number;
  captchaToken?: string;
}

function isEnquiryPayload(value: unknown): value is EnquiryPayload {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return (
    typeof body.fullName === "string" &&
    typeof body.email === "string" &&
    typeof body.phone === "string" &&
    typeof body.serviceNeeded === "string" &&
    typeof body.city === "string" &&
    typeof body.postcode === "string" &&
    typeof body.jobDescription === "string" &&
    (body.urgencyLevel === "standard" || body.urgencyLevel === "urgent" || body.urgencyLevel === "emergency") &&
    (body.preferredContact === "email" || body.preferredContact === "phone" || body.preferredContact === "whatsapp")
  );
}

export async function POST(request: Request) {
  try {
    const requestIp = getRequestIp(request) || "unknown";
    const rateLimit = enforceRateLimit({
      scope: "enquiries",
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

    if (!isEnquiryPayload(json)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid enquiry payload.",
        },
        { status: 400 }
      );
    }

    const spamGuard = validateSpamGuard({
      honeypot: json.website,
      startedAt: json.startedAt,
      minDurationMs: 1500,
    });

    if (!spamGuard.ok) {
      return NextResponse.json({ ok: false, message: "Submission failed validation." }, { status: 400 });
    }

    const captchaResult = await verifyTurnstileToken(json.captchaToken, requestIp);
    if (!captchaResult.ok) {
      return NextResponse.json({ ok: false, message: "Captcha verification failed." }, { status: 400 });
    }

    const payload = {
      fullName: sanitizeSingleLine(json.fullName, 120),
      email: sanitizeSingleLine(json.email, 160).toLowerCase(),
      phone: sanitizeSingleLine(json.phone, 40),
      serviceNeeded: sanitizeSingleLine(json.serviceNeeded, 100),
      city: sanitizeSingleLine(json.city, 80),
      postcode: sanitizeSingleLine(json.postcode, 20),
      jobDescription: sanitizeMultiline(json.jobDescription, 4000),
      urgencyLevel: json.urgencyLevel,
      preferredContact: json.preferredContact,
    };

    if (
      !payload.fullName ||
      !payload.email ||
      !payload.phone ||
      !payload.serviceNeeded ||
      !payload.city ||
      !payload.postcode ||
      !payload.jobDescription
    ) {
      return NextResponse.json({ ok: false, message: "Please complete all required fields." }, { status: 400 });
    }

    if (hasSuspiciousContent(payload.jobDescription, payload.fullName)) {
      return NextResponse.json({ ok: false, message: "Please remove links or scripts from your enquiry." }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        serviceNeeded: payload.serviceNeeded,
        city: payload.city,
        postcode: payload.postcode,
        jobDescription: payload.jobDescription,
        urgencyLevel: payload.urgencyLevel,
        preferredContact: payload.preferredContact,
      },
    });

    const leadEmail = payload.email;

    try {
      await notifyEnquiryOwner({
        leadName: payload.fullName,
        leadEmail,
        leadPhone: payload.phone,
        serviceNeeded: payload.serviceNeeded,
        city: payload.city,
        postcode: payload.postcode,
        urgencyLevel: payload.urgencyLevel,
        preferredContact: payload.preferredContact,
        jobDescription: payload.jobDescription,
      });

      await notifyEnquiryUser({
        recipientEmail: leadEmail,
        recipientName: payload.fullName,
        serviceNeeded: payload.serviceNeeded,
        city: payload.city,
      });
    } catch (error) {
      console.error("enquiry notification error", error);
    }

    return NextResponse.json(
      {
        ok: true,
        id: lead.id,
        status: "received",
        message:
          "Your enquiry has been received. Totalserve will review your request and contact you shortly.",
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Unable to process enquiry at this time.",
      },
      { status: 500 }
    );
  }
}
