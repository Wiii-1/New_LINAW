import { PrismaClient as GeneratedPrismaClient } from "../generated/prisma/client.js";

type PrismaClientInstance = InstanceType<typeof GeneratedPrismaClient>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientInstance | undefined
}

export const prisma = 
    globalForPrisma.prisma ??
        new GeneratedPrismaClient({
            log:[
                "error",
                "warn"
            ]
        } as any) as PrismaClientInstance
        
if(process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma
}