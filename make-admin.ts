import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = "postgresql://neondb_owner:***@ep-wild-lab-ajc243vz-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.update({
    where: { email: "admin@indexstep.com" },
    data: { role: "ADMIN" },
  });
  console.log("✅ User promoted to ADMIN:", user.email, "- Role:", user.role);
}

main().finally(() => prisma.$disconnect());
