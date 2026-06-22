/**
 * Create a password-protected private tutorial for testing
 * Run: node scripts/create-private-guide.js
 */
const { PrismaClient } = require("@prisma/client");
const { PrismaLibSql } = require("@prisma/adapter-libsql");
const bcrypt = require("bcryptjs");

const adapter = new PrismaLibSql({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) { console.error("No admin found"); process.exit(1); }

  // Delete existing private guide if present
  const existing = await prisma.tutorial.findFirst({ where: { title: "Test Private Guide" } });
  if (existing) await prisma.tutorial.delete({ where: { id: existing.id } });

  const hashedPassword = await bcrypt.hash("secret123", 10);

  const tutorial = await prisma.tutorial.create({
    data: {
      title: "Test Private Guide",
      description: "This is a password-protected guide for testing purposes.",
      category: "Tech",
      difficulty: 1,
      timeMinutes: 5,
      published: true,
      authorId: admin.id,
      password: hashedPassword,
      tools: {
        create: [
          { name: "Computer", quantity: null, size: null, kind: null, notes: "For testing", category: "Tech" },
        ],
      },
      steps: {
        create: [
          { order: 1, title: "Step 1", content: "This is a private guide. You need the password to see this.", imageUrl: null },
          { order: 2, title: "Step 2", content: "The password is: secret123", imageUrl: null },
        ],
      },
    },
  });

  console.log("Created private tutorial:", tutorial.id);
  console.log("Password: secret123");
  console.log("URL: http://localhost:3000/tutorial/" + tutorial.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); });
