/**
 * Create "How to Create an IndexStep Account" tutorial
 * Run: node scripts/create-account-guide.js
 */
const { PrismaClient } = require("@prisma/client");
const { PrismaLibSql } = require("@prisma/adapter-libsql");

const adapter = new PrismaLibSql({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) { console.error("No admin found"); process.exit(1); }

  // Delete existing if present
  const existing = await prisma.tutorial.findFirst({ where: { title: "How to Create an IndexStep Account" } });
  if (existing) {
    await prisma.tutorial.delete({ where: { id: existing.id } });
    console.log("Deleted existing");
  }

  const tutorial = await prisma.tutorial.create({
    data: {
      title: "How to Create an IndexStep Account",
      description: "Learn how to sign up and create your free IndexStep account in just a few minutes.",
      category: "Tech",
      difficulty: 1,
      timeMinutes: 5,
      published: true,
      authorId: admin.id,
      tools: {
        create: [
          { name: "Computer, phone, or tablet", quantity: null, size: null, kind: null, notes: "Any device with a web browser", category: "Tech" },
          { name: "Internet connection", quantity: null, size: null, kind: null, notes: "Stable connection recommended", category: "Tech" },
          { name: "Email address", quantity: null, size: null, kind: null, notes: "Must end in .com — e.g. you@example.com", category: "Tech" },
          { name: "Password", quantity: null, size: null, kind: null, notes: "At least 6 characters", category: "Tech" },
        ],
      },
      steps: {
        create: [
          {
            order: 1,
            title: "Go to the Sign Up Page",
            content: "Open your web browser and visit indexstep.com.\nClick the Sign Up button in the top right corner.\nYou'll be taken to the registration form.",
            imageUrl: null,
          },
          {
            order: 2,
            title: "Enter Your Name",
            content: "In the Name field, enter the display name you want shown on your profile.\nThis can be your real name or a nickname — it's what other users will see.\nTip: Use something you'll be comfortable sharing publicly.",
            imageUrl: null,
          },
          {
            order: 3,
            title: "Enter Your Email Address",
            content: "Type your email address in the Email field.\nYour email must end in .com — addresses like @gmail.com, @outlook.com, and @icloud.com all work.\nTip: Use an email you check regularly, as you may need it for account recovery.",
            imageUrl: null,
          },
          {
            order: 4,
            title: "Choose a Password",
            content: "Create a password for your account.\nThe password must be at least 6 characters long.\nTip: Use a mix of letters, numbers, and symbols for a stronger password.",
            imageUrl: null,
          },
          {
            order: 5,
            title: "Click Create Account",
            content: "Once all three fields are filled in, click the Create Account button.\nIf everything looks correct, you'll be automatically logged into your new account.\nYou'll be redirected to the home page where you can start browsing guides.",
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
