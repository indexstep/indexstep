import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({
  url: "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const admin = await prisma.user.create({
    data: {
      email: "admin@indexstep",
      password: await bcrypt.hash("admin123", 10),
      name: "Admin",
      role: "ADMIN",
    },
  });

  const mod = await prisma.user.create({
    data: {
      email: "mod@indexstep",
      password: await bcrypt.hash("admin123", 10),
      name: "Moderator",
      role: "MODERATOR",
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "user@indexstep",
      password: await bcrypt.hash("user123", 10),
      name: "Regular User",
      role: "USER",
    },
  });

  console.log("Created 3 users");

  await prisma.tutorial.create({
    data: {
      title: "How to Build a Birdhouse",
      description: "A simple wooden birdhouse perfect for backyard birds. Great weekend project for beginners.",
      category: "DIY",
      difficulty: 2,
      timeMinutes: 120,
      published: true,
      authorId: admin.id,
      coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      tools: {
        create: [
          { name: "Wood planks", quantity: "4 pieces" },
          { name: "Hammer", quantity: "1" },
          { name: "Nails", quantity: "1 box" },
          { name: "Sandpaper", quantity: "1 sheet" },
        ],
      },
      steps: {
        create: [
          { order: 1, title: "Cut the wood pieces", content: "Cut your wood planks according to the measurements: two side panels (6x8 inches), one bottom (5x6 inches), one top (7x7 inches), and one front with a 2-inch hole for the entrance.", imageUrl: null },
          { order: 2, title: "Sand all pieces", content: "Sand each piece thoroughly to remove splinters. Start with 120-grit and finish with 220-grit for a smooth surface.", imageUrl: null },
          { order: 3, title: "Assemble the base", content: "Nail the bottom piece to the two side panels. Make sure the bottom is flush with the bottom edges of the sides.", imageUrl: null },
          { order: 4, title: "Attach the front panel", content: "Nail the front panel to the sides. Make sure the entrance hole is positioned in the upper half of the panel.", imageUrl: null },
          { order: 5, title: "Add the roof", content: "Attach the top piece as the roof, slightly angled for water runoff. You can use wood glue and nails for extra durability.", imageUrl: null },
        ],
      },
    },
  });

  await prisma.tutorial.create({
    data: {
      title: "How to Make Perfect Pizza Dough",
      description: "Learn the secrets to making restaurant-quality pizza dough at home with just 4 ingredients.",
      category: "Cooking",
      difficulty: 2,
      timeMinutes: 90,
      published: true,
      authorId: user.id,
      coverImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
      tools: {
        create: [
          { name: "Stand mixer", quantity: "1" },
          { name: "Mixing bowls", quantity: "2" },
          { name: "Pizza stone", quantity: "1" },
        ],
      },
      steps: {
        create: [
          { order: 1, title: "Activate the yeast", content: "Mix warm water (about 110°F) with a pinch of sugar. Add yeast and let sit for 5-10 minutes until foamy.", imageUrl: null },
          { order: 2, title: "Mix the dough", content: "In a stand mixer bowl, combine flour and salt. Add the yeast mixture and mix on low speed until a shaggy dough forms.", imageUrl: null },
          { order: 3, title: "Knead", content: "Knead the dough on medium speed for 8-10 minutes until smooth and elastic. It should bounce back when poked.", imageUrl: null },
          { order: 4, title: "First rise", content: "Place dough in an oiled bowl, cover with plastic wrap, and let rise in a warm place for 1-2 hours until doubled.", imageUrl: null },
          { order: 5, title: "Shape and top", content: "Punch down the dough, divide into 2 balls, and stretch each into a 12-inch circle. Add your favorite toppings.", imageUrl: null },
          { order: 6, title: "Bake", content: "Place on a preheated pizza stone at 500°F and bake for 10-12 minutes until crust is golden and cheese is bubbly.", imageUrl: null },
        ],
      },
    },
  });

  console.log("Created 2 tutorials");

  await prisma.systemLog.create({
    data: {
      action: "ADMIN_LOGIN",
      actorId: admin.id,
      target: "admin@indexstep",
    },
  });

  console.log("Done!");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});