import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient as GeneratedPrismaClient } from "../generated/prisma/client.js";
import { env } from "./env.js"

type PrismaClientInstance = InstanceType<typeof GeneratedPrismaClient>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientInstance | undefined
}

const adapter = new PrismaPg({
  connectionString: env.TEST_DATABASE_URL!,
});

export const prisma =
  globalForPrisma.prisma ??
  new GeneratedPrismaClient({
    adapter,
    log: [
      "error",
      "warn",
    ],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}