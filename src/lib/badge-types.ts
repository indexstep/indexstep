/**
 * Temporary type declarations for Badge and UserBadge models.
 * These are needed until Prisma schema is pushed and client is regenerated.
 * After running: npx prisma db push && npx prisma generate
 * you can remove this import from your badge API routes.
 */
export type { Badge, UserBadge } from "@prisma/client";

// Re-export Prisma client with badge types
export { default as prisma } from "@/lib/prisma";
