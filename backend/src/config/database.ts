import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient as GeneratedPrismaClient } from "../generated/prisma/client.js";

type PrismaClientInstance = InstanceType<typeof GeneratedPrismaClient>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientInstance | undefined
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
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