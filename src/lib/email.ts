import nodemailer from "nodemailer";

type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_URL && process.env.MAIL_FROM);
}

export async function sendMail(input: SendMailInput) {
  const smtpUrl = process.env.SMTP_URL;
  const from = process.env.MAIL_FROM;

  if (!smtpUrl || !from) {
    return { ok: false as const, error: "Email is not configured." };
  }

  const transporter = nodemailer.createTransport(smtpUrl);
  await transporter.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  return { ok: true as const };
}

