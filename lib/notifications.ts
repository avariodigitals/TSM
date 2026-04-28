import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { getSettingValue } from "@/lib/site-settings";

interface AssignmentNotificationInput {
  recipientEmail: string;
  recipientName: string;
  leadName: string;
  serviceNeeded: string;
  city: string;
  notes?: string | null;
}

function canUseSmtp() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  );
}

type SmtpSettings = {
  enabled: boolean;
  host: string;
  port: string;
  user: string;
  pass: string;
  from: string;
};

async function getSmtpConfig() {
  const configured = await getSettingValue<SmtpSettings>("site.smtp", {
    enabled: false,
    host: "",
    port: "",
    user: "",
    pass: "",
    from: "",
  });

  if (
    configured.enabled &&
    configured.host &&
    configured.port &&
    configured.user &&
    configured.pass &&
    configured.from
  ) {
    return {
      host: configured.host,
      port: Number(configured.port),
      user: configured.user,
      pass: configured.pass,
      from: configured.from,
    };
  }

  if (!canUseSmtp()) {
    return null;
  }

  return {
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
    from: process.env.SMTP_FROM!,
  };
}

export async function notifyArtisanAssignment(input: AssignmentNotificationInput) {
  const subject = `New Total Serve Assignment: ${input.serviceNeeded} in ${input.city}`;
  const text = [
    `Hello ${input.recipientName},`,
    "",
    "A new customer enquiry has been assigned to you by Total Serve.",
    `Customer: ${input.leadName}`,
    `Service: ${input.serviceNeeded}`,
    `Location: ${input.city}`,
    input.notes ? `Dispatcher notes: ${input.notes}` : "",
    "",
    "Please log in to your workflow and confirm availability.",
    "",
    "Total Serve Maintenance Ltd",
  ]
    .filter(Boolean)
    .join("\n");

  const smtpConfig = await getSmtpConfig();

  if (!smtpConfig) {
    await prisma.notificationLog.create({
      data: {
        channel: "email",
        recipient: input.recipientEmail,
        subject,
        payload: {
          mode: "dry-run",
          text,
        },
        status: "queued-no-smtp",
      },
    });
    return { ok: true as const, mode: "dry-run" as const };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

    await transporter.sendMail({
      from: smtpConfig.from,
      to: input.recipientEmail,
      subject,
      text,
    });

    await prisma.notificationLog.create({
      data: {
        channel: "email",
        recipient: input.recipientEmail,
        subject,
        payload: {
          mode: "smtp",
          leadName: input.leadName,
          serviceNeeded: input.serviceNeeded,
          city: input.city,
        },
        status: "sent",
      },
    });

    return { ok: true as const, mode: "smtp" as const };
  } catch (error) {
    await prisma.notificationLog.create({
      data: {
        channel: "email",
        recipient: input.recipientEmail,
        subject,
        payload: {
          mode: "smtp",
          leadName: input.leadName,
          serviceNeeded: input.serviceNeeded,
          city: input.city,
        },
        status: "failed",
        error: error instanceof Error ? error.message : "unknown error",
      },
    });

    return { ok: false as const, mode: "smtp" as const };
  }
}
