import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ArtisanRegistrationPayload {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  tradeCategory: string;
  citiesCovered: string[];
  yearsExperience: string;
  certifications: string;
  profileDescription: string;
  consentGiven: boolean;
}

function isArtisanRegistrationPayload(value: unknown): value is ArtisanRegistrationPayload {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return (
    typeof body.fullName === "string" &&
    typeof body.businessName === "string" &&
    typeof body.email === "string" &&
    typeof body.phone === "string" &&
    typeof body.tradeCategory === "string" &&
    Array.isArray(body.citiesCovered) &&
    body.citiesCovered.every((city) => typeof city === "string") &&
    typeof body.yearsExperience === "string" &&
    typeof body.certifications === "string" &&
    typeof body.profileDescription === "string" &&
    typeof body.consentGiven === "boolean"
  );
}

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();

    if (!isArtisanRegistrationPayload(json) || !json.consentGiven || json.citiesCovered.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid artisan registration payload.",
        },
        { status: 400 }
      );
    }

    const artisan = await prisma.artisan.create({
      data: {
        fullName: json.fullName,
        businessName: json.businessName,
        email: json.email.toLowerCase().trim(),
        phone: json.phone,
        tradeCategory: json.tradeCategory,
        citiesCovered: json.citiesCovered,
        yearsExperience: json.yearsExperience,
        certifications: json.certifications,
        profileDescription: json.profileDescription,
        consentGiven: json.consentGiven,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        id: artisan.id,
        status: "received",
        message:
          "Your registration has been received. Our team will review your details before adding you to the Total Serve network.",
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Unable to process registration at this time.",
      },
      { status: 500 }
    );
  }
}
