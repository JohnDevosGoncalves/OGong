import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// En serverless (Vercel), chaque invocation peut créer une connexion.
// Le singleton évite les fuites de connexions en développement (hot reload).
// Pour la production, configurer le pool via l'URL :
//   ?connection_limit=5&pool_timeout=10
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
