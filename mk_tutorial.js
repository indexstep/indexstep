const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const steps = [
  {
    order: 1,
    title: "How to cook step by step starts before the stove",
    content: "The biggest beginner mistake is treating cooking like a single action. It is really a chain of decisions: what you are making, what tools you need, how long each part takes, and when to start each one. If those decisions happen too late, the meal gets messy fast.\n\nStart by choosing a dish that matches your current skill level. A one-pan pasta, roasted vegetables, tacos, omelets, stir-fry, soup, or baked chicken gives you room to practice timing and heat control without juggling too many moving parts.\n\nOnce you know what you are making, read the full recipe all the way through. You are looking for hidden friction points. Does something need to marinate? Does rice need to start before the main dish? Do vegetables need to be chopped into different sizes? A fast read at the beginning often saves ten minutes of scrambling later."
  },
  {
    order: 2,
    title: "Gather tools and ingredients first",
    content: "Before any heat is on, pull out every ingredient and tool you will use. That usually means your pan or pot, knife, cutting board, measuring tools, spatula or spoon, oil, salt, and all recipe ingredients. This is not about making the counter look neat. It is about removing interruptions.\n\nCooking goes more smoothly when you can move forward without stopping to hunt for a can opener or realize the garlic is still unpeeled. In a visual platform like Stephud, this is the kind of step that makes progress easier to track because the setup is part of the process, not an afterthought.\n\nFull prep takes a few extra minutes upfront. For beginners, or for any new dish, gathering first is worth it. It lowers stress and makes the sequence easier to follow."
  },
  {
    order: 3,
    title: "Prep ingredients in the order you will use them",
    content: "Now do the cutting, measuring, washing, draining, or mixing before you start cooking. This is the stage where you turn a recipe into manageable parts.\n\nThink in terms of timing. Ingredients that take longer to cook — like onions, potatoes, carrots, or raw meat — should be ready first. Quick ingredients like spinach, garlic, herbs, or lemon juice can wait until later, but they still need to be within reach.\n\nSize matters more than many people expect. If you cut vegetables unevenly, some pieces burn while others stay undercooked. If chicken breasts are thick on one end and thin on the other, the thinner side dries out before the center is safe. Uniform pieces help food cook at the same pace. It is not about perfection. It is about consistency."
  },
  {
    order: 4,
    title: "Start with heat control, not maximum heat",
    content: "A lot of home cooks assume hotter means better. Usually it just means less control. Medium or medium-high heat is where most everyday cooking works best, especially in a skillet. It gives you time to react.\n\nPreheat the pan first, then add oil if the dish calls for it. You want the pan hot enough that food sizzles when it hits the surface, but not so hot that oil smokes immediately. If the oil starts smoking hard, the pan is too hot for most beginner-friendly cooking. Pull it back, let it cool slightly, and continue.\n\nDifferent foods want different heat levels. Eggs, pancakes, and garlic prefer gentler heat. A steak or a quick sear can handle more. Vegetables often start on medium-high and finish on medium. If you are not sure, start lower. You can always raise the heat, but burned food does not rewind."
  },
  {
    order: 5,
    title: "Cook in stages, not all at once",
    content: "This is the part that makes cooking feel organized. Add ingredients based on how long they need and what you want them to do.\n\nIn many savory dishes, onions go in early because they need time to soften. Garlic comes later because it cooks fast and burns easily. Raw chicken usually needs direct contact with the pan before sauces are added. Pasta water should be boiling while the sauce is underway, not after. Leafy greens often go in at the end because they wilt in minutes.\n\nWhen people crowd the pan with everything at once, the food steams instead of browns. That changes the result. If you want caramelization or crisp edges, leave space. Cook in batches if needed. It takes a little longer, but the texture is usually much better."
  },
  {
    order: 6,
    title: "Taste and adjust as you go",
    content: "One of the clearest answers to how to cook step by step is this: do not wait until the end to find out what you made. Taste during the process.\n\nThat does not mean tasting raw meat or undercooked ingredients. It means checking sauces, vegetables, grains, soups, and finished components as they develop. Is it flat? It may need salt. Too sharp? It may need fat, sweetness, or more cooking time. Too thick? It may need water, broth, or pasta water. Too bland even after salt? It may need acid, like lemon juice or vinegar.\n\nSeason in layers instead of dumping everything in at the finish. A little salt at the beginning, a little during cooking, and a final adjustment at the end usually works better than one heavy-handed addition."
  },
  {
    order: 7,
    title: "Watch for cues, not just the clock",
    content: "Recipes give times because they need to, but food is done by look, smell, sound, and texture as much as by minutes. Onions turn translucent, then soft, then golden. Chicken firms up and loses its raw sheen. Pasta shifts from chalky to tender. Pancake edges set before the flip. Vegetables brighten in color and lose their raw bite.\n\nYour stove, pan, knife cuts, and ingredient temperature all affect timing. That is why one person's eight-minute saute becomes another person's twelve-minute saute. The clock helps, but the cues decide.\n\nOnce you notice what cooked food actually looks like, you depend less on exact timing and more on observation. That skill carries across almost every category of cooking."
  },
  {
    order: 8,
    title: "Finish with rest, texture, and balance",
    content: "Many dishes improve in the last two minutes. This is where you lower the heat, add butter, stir in herbs, squeeze lemon, grate cheese, or let meat rest before slicing. These finishing touches can make a basic meal feel complete.\n\nResting matters more than it seems. If you cut into meat the second it leaves the pan, juices run out. If you serve soup without a final taste, you miss the chance to sharpen it.\n\nBalance is the real checkpoint. Ask three quick questions: does it need more salt, does it need brightness, and does it have enough texture? Crunch from toasted breadcrumbs, freshness from herbs, or creaminess from yogurt can change the whole plate without making the recipe more complicated."
  },
  {
    order: 9,
    title: "How to get better at cooking step by step",
    content: "Improvement comes from repetition, not randomness. Cook the same few dishes more than once. That is how you start noticing what actually changes the outcome. Maybe you learn that your pan runs hot, that diced onions need longer than you thought, or that seasoning earlier gives better results than seasoning late.\n\nPractice one technique at a time: sauteing, roasting, boiling pasta well, making rice, searing chicken, scrambling eggs. When those feel natural, recipes stop feeling like scripts and start feeling flexible.\n\nIf a meal goes wrong, be specific about why. \"The pan was overcrowded, so nothing browned\" is useful. \"I started the vegetables too late\" is useful. Small corrections are how cooks improve.\n\nCooking step by step is really about reducing friction. You set up first, prep with intention, control heat, cook in stages, taste as you go, and finish with attention. The meal does not need to be complicated to be good. It just needs a clear order you can trust the next time you step into the kitchen."
  }
]

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) { console.log('No admin found'); return }
  console.log('Admin:', admin.email)

  const tutorial = await prisma.tutorial.create({
    data: {
      title: "How to Cook Step by Step: A Beginner's Complete Guide",
      description: "A clear sequence that keeps the cooking process organized from the first ingredient to the final taste. Good cooking is rarely about doing one impressive thing — it is about doing small things in the right order.",
      category: "Cooking",
      difficulty: 1,
      timeMinutes: 45,
      published: true,
      authorId: admin.id,
      steps: {
        create: steps
      }
    }
  })

  console.log('Created tutorial ID:', tutorial.id)
  console.log('Title:', tutorial.title)
}

main().catch(console.error).finally(() => prisma.$disconnect())