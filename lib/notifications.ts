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

interface UserAssignmentNotificationInput {
  recipientEmail: string;
  recipientName: string;
  leadName: string;
  serviceNeeded: string;
  city: string;
  artisanName: string;
  artisanBusinessName?: string | null;
  notes?: string | null;
}

type AssignmentEmailTemplate = {
  subject: string;
  body: string;
};

type NotificationEmailTemplates = {
  artisanAssignment: AssignmentEmailTemplate;
  userAssignment: AssignmentEmailTemplate;
};

const defaultNotificationEmailTemplates: NotificationEmailTemplates = {
  artisanAssignment: {
    subject: "New Total Serve Assignment: {{serviceNeeded}} in {{city}}",
    body: [
      "Hello {{recipientName}},",
      "",
      "A new customer enquiry has been assigned to you by Total Serve.",
      "Customer: {{leadName}}",
      "Service: {{serviceNeeded}}",
      "Location: {{city}}",
      "Dispatcher notes: {{notes}}",
      "",
      "Please log in to your workflow and confirm availability.",
      "",
      "Total Serve Maintenance Ltd",
    ].join("\n"),
  },
  userAssignment: {
    subject: "Your Total Serve enquiry update: {{serviceNeeded}} in {{city}}",
    body: [
      "Hello {{recipientName}},",
      "",
      "Good news. We have assigned your enquiry to an artisan.",
      "Service: {{serviceNeeded}}",
      "Location: {{city}}",
      "Assigned artisan: {{artisanName}}",
      "Business: {{artisanBusinessName}}",
      "Update notes: {{notes}}",
      "",
      "Our team will continue to coordinate the next steps.",
      "",
      "Total Serve Maintenance Ltd",
    ].join("\n"),
  },
};

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

async function getEmailTemplates() {
  const configured = await getSettingValue<NotificationEmailTemplates>(
    "notifications.emailTemplates",
    defaultNotificationEmailTemplates
  );

  return {
    artisanAssignment: {
      ...defaultNotificationEmailTemplates.artisanAssignment,
      ...(configured.artisanAssignment ?? {}),
    },
    userAssignment: {
      ...defaultNotificationEmailTemplates.userAssignment,
      ...(configured.userAssignment ?? {}),
    },
  };
}

function renderTemplate(template: string, variables: Record<string, string>) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => variables[key] ?? "");
}

async function sendAssignmentEmail({
  recipient,
  subject,
  text,
  payload,
}: {
  recipient: string;
  subject: string;
  text: string;
  payload: Record<string, unknown>;
}) {
  const smtpConfig = await getSmtpConfig();

  if (!smtpConfig) {
    await prisma.notificationLog.create({
      data: {
        channel: "email",
        recipient,
        subject,
        payload: {
          mode: "dry-run",
          text,
          ...payload,
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
      to: recipient,
      subject,
      text,
    });

    await prisma.notificationLog.create({
      data: {
        channel: "email",
        recipient,
        subject,
        payload: {
          mode: "smtp",
          ...payload,
        },
        status: "sent",
      },
    });

    return { ok: true as const, mode: "smtp" as const };
  } catch (error) {
    await prisma.notificationLog.create({
      data: {
        channel: "email",
        recipient,
        subject,
        payload: {
          mode: "smtp",
          ...payload,
        },
        status: "failed",
        error: error instanceof Error ? error.message : "unknown error",
      },
    });

    return { ok: false as const, mode: "smtp" as const };
  }
}

export async function notifyArtisanAssignment(input: AssignmentNotificationInput) {
  const templates = await getEmailTemplates();
  const variables = {
    recipientName: input.recipientName,
    leadName: input.leadName,
    serviceNeeded: input.serviceNeeded,
    city: input.city,
    notes: input.notes ?? "",
  };

  const subject = renderTemplate(templates.artisanAssignment.subject, variables).trim();
  const text = renderTemplate(templates.artisanAssignment.body, variables).trim();

  return sendAssignmentEmail({
    recipient: input.recipientEmail,
    subject,
    text,
    payload: {
      template: "artisanAssignment",
      leadName: input.leadName,
      serviceNeeded: input.serviceNeeded,
      city: input.city,
    },
  });
}

export async function notifyUserAssignment(input: UserAssignmentNotificationInput) {
  const templates = await getEmailTemplates();
  const variables = {
    recipientName: input.recipientName,
    leadName: input.leadName,
    serviceNeeded: input.serviceNeeded,
    city: input.city,
    artisanName: input.artisanName,
    artisanBusinessName: input.artisanBusinessName ?? "",
    notes: input.notes ?? "",
  };

  const subject = renderTemplate(templates.userAssignment.subject, variables).trim();
  const text = renderTemplate(templates.userAssignment.body, variables).trim();

  return sendAssignmentEmail({
    recipient: input.recipientEmail,
    subject,
    text,
    payload: {
      template: "userAssignment",
      leadName: input.leadName,
      serviceNeeded: input.serviceNeeded,
      city: input.city,
      artisanName: input.artisanName,
    },
  });
}
