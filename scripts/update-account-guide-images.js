/**
 * Add step images to "How to Create an IndexStep Account" tutorial
 * Run: node scripts/update-account-guide-images.js
 */
const { PrismaClient } = require("@prisma/client");
const { PrismaLibSql } = require("@prisma/adapter-libsql");

const adapter = new PrismaLibSql({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const stepImages = {
  1: "/uploads/account-step1-signup.jpg",
  2: "/uploads/account-step2-name.jpg",
  3: "/uploads/account-step3-email.jpg",
  4: "/uploads/account-step4-password.jpg",
  5: "/uploads/account-step5-success.jpg",
};

async function main() {
  const tutorial = await prisma.tutorial.findFirst({
    where: { title: "How to Create an IndexStep Account" },
  });

  if (!tutorial) { console.error("Tutorial not found"); process.exit(1); }

  const steps = await prisma.step.findMany({
    where: { tutorialId: tutorial.id },
    orderBy: { order: "asc" },
  });

  for (const step of steps) {
    const imageUrl = stepImages[step.order];
    if (imageUrl) {
      await prisma.step.update({
        where: { id: step.id },
        data: { imageUrl },
      });
      console.log(`Step ${step.order}: ${imageUrl}`);
    }
  }

  console.log("Done! URL: http://localhost:3000/tutorial/" + tutorial.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); });
