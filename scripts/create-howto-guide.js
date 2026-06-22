/**
 * Create "How to Make an IndexStep Guide" tutorial
 * Run: node scripts/create-howto-guide.js
 */
const { PrismaClient } = require("@prisma/client");
const { PrismaLibSql } = require("@prisma/adapter-libsql");

const adapter = new PrismaLibSql({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) { console.error("No admin found"); process.exit(1); }
  console.log("Using admin:", admin.email);

  // Delete existing guide with same title if present
  const existing = await prisma.tutorial.findFirst({ where: { title: "How to Make an IndexStep Guide" } });
  if (existing) {
    console.log("Deleting existing tutorial ID:", existing.id);
    await prisma.tutorial.delete({ where: { id: existing.id } });
  }

  const tutorial = await prisma.tutorial.create({
    data: {
      title: "How to Make an IndexStep Guide",
      description: "A step-by-step guide to creating your own tutorial on IndexStep — from signing up to publishing your first guide.",
      category: "DIY",
      difficulty: 1,
      timeMinutes: 15,
      published: true,
      authorId: admin.id,
      steps: {
        create: [
          {
            order: 1,
            title: "Sign Up for an Account",
            content: "Visit indexstep.com and click Sign Up.\nEnter your name, a valid email address ending in .com, and a password (at least 6 characters).\nClick Create Account — you'll be logged in automatically.",
            imageUrl: null,
          },
          {
            order: 2,
            title: "Navigate to Create Guide",
            content: "Once logged in, click the Create Guide button in the top navigation bar.\nThis takes you to the guide editor where you'll fill in all the details of your tutorial.",
            imageUrl: null,
          },
          {
            order: 3,
            title: "Fill In the Basic Info",
            content: "Start with the basics:\nGive your guide a clear, descriptive title.\nWrite a short description that explains what the reader will learn or accomplish.\nChoose a category (DIY, Cooking, Tech, etc.) and set a difficulty level from Easy to Master.",
            imageUrl: null,
          },
          {
            order: 4,
            title: "Add Tools and Materials",
            content: "Tools and materials are the items a reader needs before starting.\nClick Add Tool and enter the name of each item.\nDepending on the category, you'll see different fields — like quantity, size, or notes.\nFill in whatever fields are relevant and skip the ones that aren't.",
            imageUrl: null,
          },
          {
            order: 5,
            title: "Add Steps to Your Guide",
            content: "Steps are the core of your tutorial.\nClick Add Step for each action the reader needs to take.\nGive each step a clear title and write the instructions in the content box.\nTip: if your step has multiple sub-points, write each one on a new line — they'll automatically appear as a bullet list for the reader.",
            imageUrl: null,
          },
          {
            order: 6,
            title: "Add Cover Image and Optional Photos",
            content: "A good cover image makes your guide much more appealing.\nUpload a cover photo for your guide using the image upload option.\nYou can also add an image to individual steps to show exactly what the reader should see.",
            imageUrl: null,
          },
          {
            order: 7,
            title: "Set Time and Difficulty",
            content: "Be honest about how long your guide takes and how hard it is.\nThe time estimate helps readers plan their session.\nThe difficulty level sets expectations — don't overstate or understate it.",
            imageUrl: null,
          },
          {
            order: 8,
            title: "Preview and Publish",
            content: "Before publishing, preview your guide to make sure everything looks right.\nCheck that all steps are in order, tools are listed, and images loaded properly.\nWhen you're ready, hit Publish — your guide goes live and is visible to everyone.",
            imageUrl: null,
          },
        ],
      },
    },
  });

  console.log("Created tutorial:", tutorial.id);
  console.log("URL: http://localhost:3000/tutorial/" + tutorial.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); });
