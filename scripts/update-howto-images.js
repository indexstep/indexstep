/**
 * Add step images to the "How to Make an IndexStep Guide" tutorial
 * Run: node scripts/update-howto-images.js
 */
const { PrismaClient } = require("@prisma/client");
const { PrismaLibSql } = require("@prisma/adapter-libsql");

const adapter = new PrismaLibSql({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const stepImages = {
  1: "/uploads/step1-signup-form.jpg",
  2: "/uploads/step2-create-button.jpg",
  3: "/uploads/step3-basic-info.jpg",
  4: "/uploads/step4-tools.jpg",
  5: "/uploads/step5-steps.jpg",
  6: "/uploads/step6-image-upload.jpg",
  7: "/uploads/step7-time-difficulty.jpg",
  8: "/uploads/step8-preview.jpg",
};

async function main() {
  const tutorial = await prisma.tutorial.findFirst({
    where: { title: "How to Make an IndexStep Guide" },
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
      console.log(`Step ${step.order}: added image ${imageUrl}`);
    }
  }

  console.log("Done! URL: http://localhost:3000/tutorial/" + tutorial.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); });
