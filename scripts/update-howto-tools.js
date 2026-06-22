/**
 * Update "How to Make an IndexStep Guide" tutorial category and tools
 * Run: node scripts/update-howto-tools.js
 */
const { PrismaClient } = require("@prisma/client");
const { PrismaLibSql } = require("@prisma/adapter-libsql");

const adapter = new PrismaLibSql({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const tutorial = await prisma.tutorial.findFirst({
    where: { title: "How to Make an IndexStep Guide" },
  });

  if (!tutorial) { console.error("Tutorial not found"); process.exit(1); }

  // Update category to Tech so it matches the tools
  await prisma.tutorial.update({
    where: { id: tutorial.id },
    data: { category: "Tech" },
  });
  console.log("Updated category to Tech");

  // Delete existing tools
  await prisma.tool.deleteMany({ where: { tutorialId: tutorial.id } });

  // Add materials/tools under Tech category (shows as "System Requirements")
  const tools = [
    { name: "Computer, tablet, or phone", quantity: null, size: null, kind: null, notes: "Any device with a modern web browser", category: "Tech" },
    { name: "Internet connection", quantity: null, size: null, kind: null, notes: "Stable connection recommended", category: "Tech" },
    { name: "Email address", quantity: null, size: null, kind: null, notes: "Must end in .com (e.g. you@example.com)", category: "Tech" },
    { name: "Password", quantity: null, size: null, kind: null, notes: "At least 6 characters", category: "Tech" },
    { name: "Cover image", quantity: null, size: null, kind: null, notes: "Optional — JPEG, PNG, or WebP recommended", category: "Tech" },
    { name: "Step images", quantity: null, size: null, kind: null, notes: "Optional — one per step for visual clarity", category: "Tech" },
  ];

  for (const tool of tools) {
    await prisma.tool.create({
      data: { ...tool, tutorialId: tutorial.id },
    });
  }

  console.log("Added", tools.length, "tools to tutorial");
  console.log("URL: http://localhost:3000/tutorial/" + tutorial.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); });
