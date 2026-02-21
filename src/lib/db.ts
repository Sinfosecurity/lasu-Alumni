import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: InstanceType<typeof PrismaClient>;
  prismaPool?: Pool;
};

let prismaSingleton: InstanceType<typeof PrismaClient> | undefined;
let prismaPoolSingleton: Pool | undefined;

function getPool(connectionString: string) {
  if (process.env.NODE_ENV !== "production") {
    const pool =
      globalForPrisma.prismaPool ??
      new Pool({
        connectionString,
        max: 1,
      });
    globalForPrisma.prismaPool = pool;
    return pool;
  }

  prismaPoolSingleton ??= new Pool({
    connectionString,
    max: 5,
  });
  return prismaPoolSingleton;
}

function createAdapter() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  const pool = getPool(connectionString);

  return new PrismaPg(pool);
}

function createClient() {
  return new PrismaClient({
    adapter: createAdapter(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export function getPrisma() {
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma ??= createClient();
    return globalForPrisma.prisma;
  }

  prismaSingleton ??= createClient();
  return prismaSingleton;
}

export const prisma: InstanceType<typeof PrismaClient> = new Proxy(
  {} as InstanceType<typeof PrismaClient>,
  {
    get(_target, prop) {
      const client = getPrisma() as any;
      const value = client[prop];
      return typeof value === "function" ? value.bind(client) : value;
    },
  },
);

