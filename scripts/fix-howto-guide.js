/**
 * Update "How to Make an IndexStep Guide" tutorial with better content and use existing images
 * Run: node scripts/fix-howto-guide.js
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
  console.log("Tutorial ID:", tutorial.id);

  // Update steps with better content (no images since those are AI-generated mocks)
  const steps = await prisma.step.findMany({
    where: { tutorialId: tutorial.id },
    orderBy: { order: "asc" },
  });

  const updatedSteps = [
    {
      order: 1,
      title: "Sign Up for an IndexStep Account",
      content: "Before you can create a guide, you need an IndexStep account.\nVisit the sign up page and enter your name, a valid email address ending in .com, and a password of at least 6 characters.\nOnce registered, you'll be logged in automatically and can start creating right away.",
      imageUrl: "/uploads/account-step1-signup.jpg",
    },
    {
      order: 2,
      title: "Click Create Guide in the Navigation Bar",
      content: "Look for the Create Guide button at the top of any page on IndexStep.\nClick it and you'll be taken to the guide editor where you'll fill in all the details of your tutorial.\nThis is where every guide on IndexStep starts.",
      imageUrl: "/uploads/step2-create-button.jpg",
    },
    {
      order: 3,
      title: "Fill In the Basic Information",
      content: "Every guide needs a few key details before it can be published:\nGive your guide a clear, descriptive title that tells readers exactly what they'll learn.\nWrite a short description explaining what the reader will accomplish by following your guide.\nChoose a category that best fits your guide's topic.\nSet a difficulty level — be honest so readers know what to expect.",
      imageUrl: "/uploads/step3-basic-info.jpg",
    },
    {
      order: 4,
      title: "Add Tools and Materials",
      content: "Tools and materials are the items a reader needs before getting started.\nClick Add Tool and enter each item your guide requires.\nFor each tool you can fill in:\nName — the item itself (e.g. screwdriver, flour, wire)\nQuantity — how many are needed\nSize or type — optional details like dimensions or specifications\nNotes — any extra context the reader should know\nOnly fill in the fields that are relevant. Skip the ones that aren't.",
      imageUrl: "/uploads/step4-tools.jpg",
    },
    {
      order: 5,
      title: "Add Steps to Your Guide",
      content: "Steps are the core of your tutorial — each one represents one action the reader needs to take.\nClick Add Step to create a new step.\nGive each step a clear, short title that describes what happens in that step.\nWrite the instructions in the content box. If a step has multiple sub-points, write each one on its own line — they'll automatically show as a bullet list for the reader.\nTip: Keep steps focused on one action each. Short, clear steps are better than long, complicated ones.",
      imageUrl: "/uploads/step5-steps.jpg",
    },
    {
      order: 6,
      title: "Add Images to Your Guide",
      content: "A good cover image makes your guide much more appealing and easier to understand.\nUpload a cover photo for your guide — this is the thumbnail readers see when browsing.\nYou can also add an image to individual steps to visually guide the reader.\nJPEG, PNG, and WebP formats are supported.",
      imageUrl: "/uploads/step6-image-upload.jpg",
    },
    {
      order: 7,
      title: "Set the Time Estimate and Difficulty",
      content: "Be honest about how long your guide takes and how hard it is:\nThe time estimate helps readers decide if they have enough time to complete the guide in one session.\nThe difficulty level sets expectations — don't overestimate your own skill level. Readers trust accurate difficulty ratings.",
      imageUrl: "/uploads/step7-time-difficulty.jpg",
    },
    {
      order: 8,
      title: "Preview and Publish Your Guide",
      content: "Before publishing, use the preview to double-check everything looks right:\nRead through each step and make sure the instructions are clear.\nVerify all tools are listed and images loaded properly.\nCheck that steps are in the correct order.\nWhen you're satisfied, hit Publish — your guide goes live and is visible to everyone on IndexStep.\nYou can always edit it later if you need to make changes.",
      imageUrl: "/uploads/step8-preview.jpg",
    },
  ];

  for (const s of updatedSteps) {
    const step = steps.find((st) => st.order === s.order);
    if (step) {
      await prisma.step.update({
        where: { id: step.id },
        data: { title: s.title, content: s.content, imageUrl: s.imageUrl },
      });
      console.log(`Updated step ${s.order}: ${s.title}`);
    }
  }

  console.log("\nDone! URL: http://localhost:3000/tutorial/" + tutorial.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); });
