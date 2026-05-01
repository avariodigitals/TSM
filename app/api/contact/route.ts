import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyContactOwner } from "@/lib/notifications";

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
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
    const json: unknown = await request.json();

    if (!isContactPayload(json)) {
      return NextResponse.json({ ok: false, message: "Invalid contact payload." }, { status: 400 });
    }

    const payload = {
      name: json.name.trim(),
      email: json.email.toLowerCase().trim(),
      subject: json.subject.trim(),
      message: json.message.trim(),
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      return NextResponse.json({ ok: false, message: "Please complete all required fields." }, { status: 400 });
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
