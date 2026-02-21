"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { isEmailConfigured, sendMail } from "@/lib/email";
import { generateToken } from "@/lib/tokens";

const RegisterSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name is required."),
    departmentId: z.string().trim().min(1, "Department is required."),
    matricNumber: z.string().trim().optional(),
    graduationConfirmed: z.coerce.boolean(),
    email: z.string().trim().toLowerCase().email("Valid email is required."),
    phone: z.string().trim().min(6, "Phone number is required."),
    country: z.string().trim().min(2, "Country is required."),
    professionalTitle: z.string().trim().min(2, "Professional title is required."),
    employer: z.string().trim().min(2, "Employer is required."),
    photoUrl: z.string().trim().url("Photo URL must be a valid URL.").optional(),
    password: z.string().min(8, "Password must be at least 8 characters."),
  })
  .refine((v) => v.graduationConfirmed === true, {
    message: "Please confirm your graduation.",
    path: ["graduationConfirmed"],
  });

export type RegisterState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  devVerificationUrl?: string;
};

function toFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!key) continue;
    if (fieldErrors[key]) continue;
    fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const raw = {
    fullName: String(formData.get("fullName") ?? ""),
    departmentId: String(formData.get("departmentId") ?? ""),
    matricNumber: String(formData.get("matricNumber") ?? "").trim() || undefined,
    graduationConfirmed: formData.get("graduationConfirmed"),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    country: String(formData.get("country") ?? ""),
    professionalTitle: String(formData.get("professionalTitle") ?? ""),
    employer: String(formData.get("employer") ?? ""),
    photoUrl: String(formData.get("photoUrl") ?? "").trim() || undefined,
    password: String(formData.get("password") ?? ""),
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const data = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      message: "An account with this email already exists. Please sign in.",
    };
  }

  const department = await prisma.department.findUnique({
    where: { id: data.departmentId },
    select: { id: true, name: true },
  });
  if (!department) {
    return { ok: false, message: "Please select a valid department." };
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      departmentId: department.id,
      profile: {
        create: {
          fullName: data.fullName,
          matricNumber: data.matricNumber ?? null,
          graduationConfirmed: data.graduationConfirmed,
          phone: data.phone,
          country: data.country,
          professionalTitle: data.professionalTitle,
          employer: data.employer,
          photoUrl: data.photoUrl ?? null,
        },
      },
      emailVerificationTokens: {
        create: { token, expiresAt },
      },
    },
    select: { email: true },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  const mail = await sendMail({
    to: user.email,
    subject: "Verify your email — LASU Engineering 2001 Alumni",
    text: [
      `Hello ${data.fullName},`,
      "",
      "Please verify your email to continue your membership request:",
      verificationUrl,
      "",
      "After verification, an administrator will review and approve your account.",
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
  });

  const showDevLink = process.env.NODE_ENV !== "production" && !isEmailConfigured();

  return {
    ok: true,
    message: mail.ok
      ? "Registration received. Please check your email to verify your address (then await admin approval)."
      : "Registration received. Email sending is not configured yet; use the dev verification link below (then await admin approval).",
    devVerificationUrl: showDevLink ? verificationUrl : undefined,
  };
}

