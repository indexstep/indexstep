import prisma from "../src/lib/prisma";

const img = "https://upload.wikimedia.org/wikipedia/en/5/52/Monster_Hunter_Wilds_cover.png";

async function main() {
  await prisma.tutorial.update({
    where: { id: "cmqlmb9cg0000s6j18nej75y3" },
    data: { coverImage: img },
  });
  console.log("Cover image updated:", img);
}

main().finally(() => prisma.$disconnect());
