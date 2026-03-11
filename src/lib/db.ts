import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "file:dev.db";
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  const adapter = authToken
    ? new PrismaLibSql({ url, authToken })
    : new PrismaLibSql({ url });
  return new PrismaClient({ adapter });
}

function hasExpectedDelegates(client: PrismaClient | undefined): client is PrismaClient {
  if (!client) return false;

  const candidate = client as PrismaClient & {
    workExperience?: unknown;
    siteConfig?: unknown;
  };

  return Boolean(candidate.workExperience && candidate.siteConfig);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = hasExpectedDelegates(globalForPrisma.prisma)
  ? globalForPrisma.prisma
  : createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
