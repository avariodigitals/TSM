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

interface EnquiryOwnerNotificationInput {
  recipientEmail?: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  serviceNeeded: string;
  city: string;
  postcode: string;
  urgencyLevel: string;
  preferredContact: string;
  jobDescription: string;
}

interface EnquiryUserNotificationInput {
  recipientEmail: string;
  recipientName: string;
  serviceNeeded: string;
  city: string;
}

interface ArtisanRegistrationOwnerNotificationInput {
  recipientEmail?: string;
  artisanName: string;
  businessName: string;
  artisanEmail: string;
  artisanPhone: string;
  tradeCategory: string;
  citiesCovered: string[];
  yearsExperience: string;
}

interface ArtisanRegistrationUserNotificationInput {
  recipientEmail: string;
  recipientName: string;
  tradeCategory: string;
}

interface ContactOwnerNotificationInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type AssignmentEmailTemplate = {
  subject: string;
  body: string;
};

type NotificationEmailTemplates = {
  artisanAssignment: AssignmentEmailTemplate;
  userAssignment: AssignmentEmailTemplate;
  enquiryOwner: AssignmentEmailTemplate;
  enquiryUser: AssignmentEmailTemplate;
  artisanRegistrationOwner: AssignmentEmailTemplate;
  artisanRegistrationUser: AssignmentEmailTemplate;
  contactOwner: AssignmentEmailTemplate;
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
  enquiryOwner: {
    subject: "New Service Enquiry: {{serviceNeeded}} in {{city}}",
    body: [
      "A new service enquiry has been submitted.",
      "",
      "Name: {{leadName}}",
      "Email: {{leadEmail}}",
      "Phone: {{leadPhone}}",
      "Service: {{serviceNeeded}}",
      "City: {{city}}",
      "Postcode: {{postcode}}",
      "Urgency: {{urgencyLevel}}",
      "Preferred contact: {{preferredContact}}",
      "",
      "Job description:",
      "{{jobDescription}}",
    ].join("\n"),
  },
  enquiryUser: {
    subject: "We received your Total Serve enquiry",
    body: [
      "Hello {{recipientName}},",
      "",
      "Thanks for contacting Total Serve.",
      "We have received your enquiry for {{serviceNeeded}} in {{city}} and our team will review it shortly.",
      "",
      "Total Serve Maintenance Ltd",
    ].join("\n"),
  },
  artisanRegistrationOwner: {
    subject: "New Artisan Registration: {{tradeCategory}}",
    body: [
      "A new artisan registration has been submitted.",
      "",
      "Name: {{artisanName}}",
      "Business: {{businessName}}",
      "Email: {{artisanEmail}}",
      "Phone: {{artisanPhone}}",
      "Trade: {{tradeCategory}}",
      "Cities covered: {{citiesCovered}}",
      "Years of experience: {{yearsExperience}}",
    ].join("\n"),
  },
  artisanRegistrationUser: {
    subject: "We received your artisan registration",
    body: [
      "Hello {{recipientName}},",
      "",
      "Thank you for registering as a Total Serve artisan in {{tradeCategory}}.",
      "Our team will review your application and contact you with next steps.",
      "",
      "Total Serve Maintenance Ltd",
    ].join("\n"),
  },
  contactOwner: {
    subject: "New Contact Message: {{subject}}",
    body: [
      "A new contact message has been submitted.",
      "",
      "Name: {{name}}",
      "Email: {{email}}",
      "Subject: {{subject}}",
      "",
      "Message:",
      "{{message}}",
    ].join("\n"),
  },
};

type SiteGeneralSettings = {
  siteName: string;
  supportEmail: string;
  supportPhone: string;
  siteUrl: string;
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
    enquiryOwner: {
      ...defaultNotificationEmailTemplates.enquiryOwner,
      ...(configured.enquiryOwner ?? {}),
    },
    enquiryUser: {
      ...defaultNotificationEmailTemplates.enquiryUser,
      ...(configured.enquiryUser ?? {}),
    },
    artisanRegistrationOwner: {
      ...defaultNotificationEmailTemplates.artisanRegistrationOwner,
      ...(configured.artisanRegistrationOwner ?? {}),
    },
    artisanRegistrationUser: {
      ...defaultNotificationEmailTemplates.artisanRegistrationUser,
      ...(configured.artisanRegistrationUser ?? {}),
    },
    contactOwner: {
      ...defaultNotificationEmailTemplates.contactOwner,
      ...(configured.contactOwner ?? {}),
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

async function resolveOwnerRecipient(explicitRecipient?: string) {
  if (explicitRecipient?.trim()) {
    return explicitRecipient.trim().toLowerCase();
  }

  const general = await getSettingValue<SiteGeneralSettings>("site.general", {
    siteName: "Total Serve Maintenance Ltd",
    supportEmail: process.env.SMTP_FROM ?? "",
    supportPhone: "",
    siteUrl: "",
  });

  if (general.supportEmail?.trim()) {
    return general.supportEmail.trim().toLowerCase();
  }

  if (process.env.SMTP_FROM?.trim()) {
    return process.env.SMTP_FROM.trim().toLowerCase();
  }

  return "";
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

export async function notifyEnquiryOwner(input: EnquiryOwnerNotificationInput) {
  const templates = await getEmailTemplates();
  const ownerRecipient = await resolveOwnerRecipient(input.recipientEmail);
  if (!ownerRecipient) {
    await prisma.notificationLog.create({
      data: {
        channel: "email",
        recipient: "owner",
        subject: "New Service Enquiry",
        payload: {
          template: "enquiryOwner",
          leadName: input.leadName,
          serviceNeeded: input.serviceNeeded,
          city: input.city,
        },
        status: "failed",
        error: "Owner recipient email is not configured (site.general.supportEmail or SMTP_FROM)",
      },
    });
    return { ok: false as const, mode: "smtp" as const };
  }

  const variables = {
    leadName: input.leadName,
    leadEmail: input.leadEmail,
    leadPhone: input.leadPhone,
    serviceNeeded: input.serviceNeeded,
    city: input.city,
    postcode: input.postcode,
    urgencyLevel: input.urgencyLevel,
    preferredContact: input.preferredContact,
    jobDescription: input.jobDescription,
  };

  const subject = renderTemplate(templates.enquiryOwner.subject, variables).trim();
  const text = renderTemplate(templates.enquiryOwner.body, variables).trim();

  return sendAssignmentEmail({
    recipient: ownerRecipient,
    subject,
    text,
    payload: {
      template: "enquiryOwner",
      leadName: input.leadName,
      serviceNeeded: input.serviceNeeded,
      city: input.city,
    },
  });
}

export async function notifyEnquiryUser(input: EnquiryUserNotificationInput) {
  const templates = await getEmailTemplates();
  const variables = {
    recipientName: input.recipientName,
    serviceNeeded: input.serviceNeeded,
    city: input.city,
  };

  const subject = renderTemplate(templates.enquiryUser.subject, variables).trim();
  const text = renderTemplate(templates.enquiryUser.body, variables).trim();

  return sendAssignmentEmail({
    recipient: input.recipientEmail,
    subject,
    text,
    payload: {
      template: "enquiryUser",
      recipientName: input.recipientName,
      serviceNeeded: input.serviceNeeded,
      city: input.city,
    },
  });
}

export async function notifyArtisanRegistrationOwner(input: ArtisanRegistrationOwnerNotificationInput) {
  const templates = await getEmailTemplates();
  const ownerRecipient = await resolveOwnerRecipient(input.recipientEmail);
  if (!ownerRecipient) {
    await prisma.notificationLog.create({
      data: {
        channel: "email",
        recipient: "owner",
        subject: "New Artisan Registration",
        payload: {
          template: "artisanRegistrationOwner",
          artisanName: input.artisanName,
          tradeCategory: input.tradeCategory,
        },
        status: "failed",
        error: "Owner recipient email is not configured (site.general.supportEmail or SMTP_FROM)",
      },
    });
    return { ok: false as const, mode: "smtp" as const };
  }

  const variables = {
    artisanName: input.artisanName,
    businessName: input.businessName,
    artisanEmail: input.artisanEmail,
    artisanPhone: input.artisanPhone,
    tradeCategory: input.tradeCategory,
    citiesCovered: input.citiesCovered.join(", "),
    yearsExperience: input.yearsExperience,
  };

  const subject = renderTemplate(templates.artisanRegistrationOwner.subject, variables).trim();
  const text = renderTemplate(templates.artisanRegistrationOwner.body, variables).trim();

  return sendAssignmentEmail({
    recipient: ownerRecipient,
    subject,
    text,
    payload: {
      template: "artisanRegistrationOwner",
      artisanName: input.artisanName,
      tradeCategory: input.tradeCategory,
    },
  });
}

export async function notifyArtisanRegistrationUser(input: ArtisanRegistrationUserNotificationInput) {
  const templates = await getEmailTemplates();
  const variables = {
    recipientName: input.recipientName,
    tradeCategory: input.tradeCategory,
  };

  const subject = renderTemplate(templates.artisanRegistrationUser.subject, variables).trim();
  const text = renderTemplate(templates.artisanRegistrationUser.body, variables).trim();

  return sendAssignmentEmail({
    recipient: input.recipientEmail,
    subject,
    text,
    payload: {
      template: "artisanRegistrationUser",
      recipientName: input.recipientName,
      tradeCategory: input.tradeCategory,
    },
  });
}

export async function notifyContactOwner(input: ContactOwnerNotificationInput) {
  const templates = await getEmailTemplates();
  const ownerRecipient = await resolveOwnerRecipient();
  if (!ownerRecipient) {
    await prisma.notificationLog.create({
      data: {
        channel: "email",
        recipient: "owner",
        subject: "New Contact Message",
        payload: {
          template: "contactOwner",
          email: input.email,
          subject: input.subject,
        },
        status: "failed",
        error: "Owner recipient email is not configured (site.general.supportEmail or SMTP_FROM)",
      },
    });
    return { ok: false as const, mode: "smtp" as const };
  }

  const variables = {
    name: input.name,
    email: input.email,
    subject: input.subject,
    message: input.message,
  };

  const subject = renderTemplate(templates.contactOwner.subject, variables).trim();
  const text = renderTemplate(templates.contactOwner.body, variables).trim();

  return sendAssignmentEmail({
    recipient: ownerRecipient,
    subject,
    text,
    payload: {
      template: "contactOwner",
      email: input.email,
      subject: input.subject,
    },
  });
}

export async function sendNewUserCredentialsEmail({
  email,
  fullName,
  password,
  role,
  loginUrl,
}: {
  email: string;
  fullName: string;
  password: string;
  role: string;
  loginUrl: string;
}): Promise<{ ok: boolean; mode: string }> {
  const smtpConfig = await getSmtpConfig();

  if (!smtpConfig) {
    await prisma.notificationLog.create({
      data: {
        channel: "email",
        recipient: email,
        subject: "Your Admin Account Credentials",
        payload: {
          fullName,
          role,
          loginUrl,
        },
        status: "queued-no-smtp",
      },
    });
    return { ok: true, mode: "dry-run" };
  }

  const subject = "Your Total Serve Admin Account Credentials";
  const text = [
    `Hello ${fullName},`,
    "",
    `Your admin account has been created with the role: ${role}`,
    "",
    "Login credentials:",
    `Email: ${email}`,
    `Password: ${password}`,
    "",
    `Login URL: ${loginUrl}`,
    "",
    "Important: Please change your password after your first login.",
    "",
    "If you did not request this account, please contact your administrator immediately.",
    "",
    "Total Serve Maintenance Ltd",
  ].join("\n");

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.port === 465,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
  });

  try {
    await transporter.sendMail({
      from: smtpConfig.from,
      to: email,
      subject,
      text,
    });

    await prisma.notificationLog.create({
      data: {
        channel: "email",
        recipient: email,
        subject,
        payload: {
          fullName,
          role,
        },
        status: "sent",
      },
    });

    return { ok: true, mode: "smtp" };
  } catch (error) {
    await prisma.notificationLog.create({
      data: {
        channel: "email",
        recipient: email,
        subject,
        payload: {
          fullName,
          role,
        },
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return { ok: false, mode: "smtp" };
  }
}
