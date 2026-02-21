"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const UpdateProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  phone: z.string().trim().min(6, "Phone number is required."),
  country: z.string().trim().min(2, "Country is required."),
  professionalTitle: z.string().trim().min(2, "Professional title is required."),
  employer: z.string().trim().min(2, "Employer is required."),
  photoUrl: z.string().trim().url("Photo URL must be a valid URL.").optional(),
  bio: z.string().trim().max(2000).optional(),
  contactPreference: z.enum(["PUBLIC", "MEMBERS_ONLY", "PRIVATE"]),
});

export async function updateProfileAction(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const parsed = UpdateProfileSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    country: String(formData.get("country") ?? ""),
    professionalTitle: String(formData.get("professionalTitle") ?? ""),
    employer: String(formData.get("employer") ?? ""),
    photoUrl: String(formData.get("photoUrl") ?? "").trim() || undefined,
    bio: String(formData.get("bio") ?? "").trim() || undefined,
    contactPreference: String(formData.get("contactPreference") ?? "MEMBERS_ONLY"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid profile data");
  }

  const data = parsed.data;

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: {
      fullName: data.fullName,
      phone: data.phone,
      country: data.country,
      professionalTitle: data.professionalTitle,
      employer: data.employer,
      photoUrl: data.photoUrl ?? null,
      bio: data.bio ?? null,
      contactPreference: data.contactPreference,
    },
    create: {
      userId: session.user.id,
      fullName: data.fullName,
      matricNumber: null,
      graduationConfirmed: false,
      phone: data.phone,
      country: data.country,
      professionalTitle: data.professionalTitle,
      employer: data.employer,
      photoUrl: data.photoUrl ?? null,
      bio: data.bio ?? null,
      contactPreference: data.contactPreference,
    },
  });

  revalidatePath("/profile");
  redirect("/profile?saved=1");
}

