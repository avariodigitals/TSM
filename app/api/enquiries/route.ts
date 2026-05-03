import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyEnquiryOwner, notifyEnquiryUser } from "@/lib/notifications";

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

    const lead = await prisma.lead.create({
      data: {
        fullName: json.fullName,
        email: json.email.toLowerCase().trim(),
        phone: json.phone,
        serviceNeeded: json.serviceNeeded,
        city: json.city,
        postcode: json.postcode,
        jobDescription: json.jobDescription,
        urgencyLevel: json.urgencyLevel,
        preferredContact: json.preferredContact,
      },
    });

    const leadEmail = json.email.toLowerCase().trim();

    try {
      await notifyEnquiryOwner({
        leadName: json.fullName,
        leadEmail,
        leadPhone: json.phone,
        serviceNeeded: json.serviceNeeded,
        city: json.city,
        postcode: json.postcode,
        urgencyLevel: json.urgencyLevel,
        preferredContact: json.preferredContact,
        jobDescription: json.jobDescription,
      });

      await notifyEnquiryUser({
        recipientEmail: leadEmail,
        recipientName: json.fullName,
        serviceNeeded: json.serviceNeeded,
        city: json.city,
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
