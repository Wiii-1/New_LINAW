import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient as GeneratedPrismaClient } from "../generated/prisma/client.js";
import type { AppEnv } from "./env.js";

type PrismaClientInstance = InstanceType<typeof GeneratedPrismaClient>;

export function createPrismaClient(
    databaseUrl: string,
): PrismaClientInstance {
    const adapter = new PrismaPg({
        connectionString: databaseUrl,
    });

    return new GeneratedPrismaClient({
        adapter,
        log: [
            "error",
            "warn",
        ],
    });
}

let prisma: PrismaClientInstance;

export function initializePrisma(env: AppEnv): PrismaClientInstance {
    if (!prisma) {
        prisma = createPrismaClient(env.DATABASE_URL);
    }

    return prisma;
}

export { prisma };