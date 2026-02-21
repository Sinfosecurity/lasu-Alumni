import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role, MemberStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required for seeding.");
const pool = new Pool({ connectionString, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEPARTMENTS = [
  { name: "Mechanical Engineering", slug: "mechanical-engineering" },
  {
    name: "Electronic & Computer Engineering",
    slug: "electronic-computer-engineering",
  },
  { name: "Chemical & Polymer Engineering", slug: "chemical-polymer-engineering" },
] as const;

async function main() {
  for (const dept of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { slug: dept.slug },
      update: { name: dept.name },
      create: dept,
    });
  }

  const email = process.env.SUPER_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!password) {
    throw new Error(
      "SUPER_ADMIN_PASSWORD is required for seeding (set it in .env).",
    );
  }

  const department = await prisma.department.findUnique({
    where: { slug: "mechanical-engineering" },
  });
  if (!department) throw new Error("Seed error: default department missing.");

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: Role.SUPER_ADMIN,
      status: MemberStatus.ACTIVE,
      departmentId: department.id,
      approvedAt: new Date(),
      approvedById: null,
      emailVerifiedAt: new Date(),
    },
    create: {
      email,
      passwordHash,
      role: Role.SUPER_ADMIN,
      status: MemberStatus.ACTIVE,
      departmentId: department.id,
      approvedAt: new Date(),
      emailVerifiedAt: new Date(),
    },
  });

  console.log("Seed complete: departments + super admin ensured.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

