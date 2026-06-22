/**
 * Script to create Monster Hunter Wilds: Complete Weapons Guide
 * Run: npx tsx scripts/create-mh-wilds-weapons-guide.ts
 * Uses direct Prisma — no API auth needed.
 */

import prisma from "../src/lib/prisma";

const tutorial = {
  title: "Monster Hunter Wilds: Complete Weapons Guide (All 14 Types)",
  description: `Monster Hunter Wilds features 14 distinct weapon types, each with unique mechanics, combos, and playstyles. This guide breaks down every weapon so you can find your perfect match — whether you're a newcomer to the series or a veteran returning from Monster Hunter World or Rise.\n\nWilds introduces a groundbreaking **Dual-Weapon System**, letting you carry two weapons into every hunt and swap between them mid-fight on your Seikret mount. The game also introduces **Weapon Skills** — abilities built directly into your weapon that stay active regardless of what armor you wear. These two changes fundamentally reshape how you approach build-crafting compared to previous titles.\n\nThis guide covers all 14 weapons, explains the new systems, and gives clear recommendations for beginners versus advanced players.`,
  category: "Gaming",
  difficulty: 2,
  timeMinutes: 25,
  coverImage: "",
  published: true,
  locked: false,
  price: 0,
};

const tools = [
  { name: "Monster Hunter Wilds (any platform)", quantity: "1 copy", kind: "Game", notes: "PC (Steam/Game Pass), PS5, or Xbox Series X|S", category: "Gaming" },
  { name: "Training Area (in-game)", quantity: "Unlimited", kind: "Location", notes: "Practice all 14 weapons with no resource cost", category: "Gaming" },
];

const steps = [
  {
    title: "Welcome to the Forbidden Lands",
    content: `Monster Hunter Wilds throws you into the **Forbidden Lands** — a vast, unforgiving territory where massive monsters roam and ecosystems shift in real time. If you're new to Monster Hunter, the sheer depth of systems can feel overwhelming. But here's the good news: you don't need to master everything on day one.\n\nThe game guides you through the basics naturally through its main story, but when it comes to choosing your weapon, you're mostly on your own. That's where this guide comes in.\n\nBefore we dive into the 14 weapons, let's cover two systems that affect every weapon choice in Wilds.`,
    imageUrl: "",
    order: 1,
  },
  {
    title: "The Dual-Weapon System (Game-Changer)",
    content: `For the first time in the series, you can **carry two weapons simultaneously** and swap between them mid-hunt. When mounted on your Seikret mount, simply open the weapon wheel and select your secondary weapon to switch on the fly.\n\n**Why this matters:**\n\n- You can bring a melee weapon for general combat and a ranged weapon for specific monster weaknesses\n- You can adapt to multi-monster encounters without returning to camp\n- Build diversity explodes — you're no longer locked into one playstyle all hunt\n\n**Practical example:** Take a Long Sword for spirit gauge building, then swap to a Bow to apply status coatings at range when the monster enrages and you need distance.\n\nThis system also ties into **Weapon Skills** — your secondary weapon's skill activates when you swap, giving you two layers of tactical options.`,
    imageUrl: "",
    order: 2,
  },
  {
    title: "Understanding the HUD and Core Systems",
    content: `Before picking a weapon, get comfortable with what you're looking at during hunts:\n\n**Health Bar (red):** Depletes from monster attacks. When it hits zero, you faint and return to camp with reduced rewards.\n\n**Stamina Bar (green):** Used for dodging, running, sprinting, and some weapon special moves. Manage it carefully — running out mid-combat is deadly.\n\n**Sharpness Bar (below stamina, melee only):** Your weapon's blade condition. Low sharpness = weaker hits and potential bounces off monster parts. Restore with a Whetstone.\n\n**Hunter Rank (HR):** Your progression badge. Higher HR unlocks stronger monsters and better gear. Don't rush it — the game is designed to let you build at your own pace.\n\n**Mini-Map:** Always shows monster location, gathering spots, and quest markers. Check it constantly.\n\n**Seikret:** Your new mount companion. It auto-collects materials as you ride, lets you swap weapons mid-hunt, and can fast-travel to camp when things go badly.`,
    imageUrl: "",
    order: 3,
  },
  {
    title: "Melee Weapons: Great Sword & Long Sword",
    content: `**GREAT SWORD**\nThe iconic heavyweight. Great Swords deal massive damage per hit and teach you the most important Monster Hunter lesson: **timing**. Every charged attack has a wind-up — learning when to commit and when to roll away is the entire skill curve.\n\n**Pros:** Highest raw damage per hit in the game. Teaches patience and positioning.\n**Cons:** Very slow. Low mobility. Requires you to commit to animations fully.\n**Best for:** Players who love the satisfaction of landing a perfectly timed true charge slash.\n\n**LONG SWORD**\nFast, fluid, and visually spectacular. The Long Sword builds and maintains a **Spirit Gauge** through hit combos, eventually unlocking color-tiered attacks (white → yellow → red) that deal dramatically more damage.\n\n**Pros:** High mobility, fast attacks, excellent DPS once you understand the spirit gauge rotation.\n**Cons:** The spirit gauge management adds complexity. Can feel over-reliant on landing counters.\n**Best for:** Players who want Great Sword-level damage with more mobility and combo satisfaction.\n\n**Tier Rating (current meta):** Long Sword — S | Great Sword — A`,
    imageUrl: "",
    order: 4,
  },
  {
    title: "Melee Weapons: Dual Blades & Sword and Shield",
    content: `**DUAL BLADES**\nThe fastest melee weapons in the game. Dual Blades enter **Demon Mode** for a sustained speed boost and access to the demon dance — a wide AoE spinning attack. They excel at building elemental damage and status effects.\n\n**Pros:** Extremely fast attacks, high mobility, great elemental scaling.\n**Cons:** Low raw damage per hit, short range, Demon Mode drains stamina quickly.\n**Best for:** Aggressive players who love being in the monster's face.\n\n**SWORD AND SHIELD**\nThe most **beginner-friendly weapon** in Monster Hunter Wilds. It offers a balanced mix of offense and defense, fast attacks, and one unique advantage: you can **use items without sheathing** your weapon.\n\n**Pros:** Fast, mobile, can heal and buff mid-combat. Low skill floor.\n**Cons:** Lower damage ceiling than other melee options. Small shield isn't great for blocking.\n**Best for:** New hunters, players who want to focus on survival and support, anyone who hates sheathing animations.\n\n**Tier Rating (current meta):** Sword and Shield — S | Dual Blades — A`,
    imageUrl: "",
    order: 5,
  },
  {
    title: "Melee Weapons: Charge Blade, Switch Axe & Hammer",
    content: `**CHARGE BLADE**\nThe most mechanically complex melee weapon. The Charge Blade switches between **Sword & Shield mode** (builds phials) and **Axe mode** (consumes phials for explosive elemental damage). Master it and you have one of the highest damage ceilings in the game.\n\n**Pros:** Incredible DPS in both modes, satisfying morph combos, strong elemental damage via phials.\n**Cons:** Steep learning curve. Complex inputs for the SAED (Super Amped Elemental Discharge).\n**Best for:** Players who love high-skill-cap weapons and don't mind a long mastery journey.\n\n**SWITCH AXE**\nSimilar philosophy to Charge Blade — you morph between **Axe mode** (long reach, heavy hits) and **Sword mode** (fast, sword-specific combos). The Sword mode builds up a meter that powers up your Axe mode hits.\n\n**Pros:** High mobility, strong sustained damage, satisfying morph switch.\n**Cons:** Less elemental flexibility than Charge Blade. Axeless state can feel limiting.\n**Best for:** Players who want Charge Blade-style complexity without the phial minigame.\n\n**HAMMER**\nBlunt weapon focused entirely on **stunning monsters**. Charged attacks to the head build stun damage — land enough big hits and the monster collapses, giving your team a free damage window.\n\n**Pros:** Highest stun potential, strong KO damage, surprisingly mobile with charge attacks.\n**Cons:** Limited range, no cut damage (can't sever tails), no elemental damage.\n**Best for:** Solo hunters and teams alike. Excellent control over hunt pacing.\n\n**Tier Rating (current meta):** Charge Blade — B+ | Switch Axe — A | Hammer — A`,
    imageUrl: "",
    order: 6,
  },
  {
    title: "Support & Defense: Hunting Horn, Lance & Gunlance",
    content: `**HUNTING HORN**\nThe ultimate **support weapon**. The Hunting Horn plays melodies that grant powerful buffs to you and nearby allies — attack up, defense up, stamina management, health regen, and more. Echo Bubbles placed on the ground extend these buffs to anyone who walks through them.\n\n**Pros:** Unique team-buff system, solid blunt damage, self-sufficient once you learn your songs.\n**Cons:** Recital system adds complexity, songs can be interrupted mid-performance.\n**Best for:** Players who want to be the most valuable person in a co-op hunt.\n\n**LANCE**\nThe king of **defense and counterattacks**. The Lance lets you block almost any attack with minimal knockback, perform thrust attacks that never bounce, and has a unique **Counter Attack** that turns defense into offense.\n\n**Pros:** Best defensive tool in the game, stable DPS, great for learning monster attack patterns.\n**Cons:** Slow movement while blocking, lower damage ceiling, requires patience.\n**Best for:** New players learning monster patterns, and veterans who love the jousting playstyle.\n\n**GUNLANCE**\nA Lance with **explosive shells**. Gunlance adds shelling attacks, wyvern's fire (big burst damage), and a unique **Reload** mechanic. It has higher burst damage than the Lance but trades some defensive capability.\n\n**Pros:** Explosive burst damage, strong melee damage, unique ranged shell options.\n**Cons:** Heavy, slow, ammo management adds complexity.\n**Best for:** Players who want Lance-style defense with more explosive payoff.\n\n**Tier Rating (current meta):** Hunting Horn — S | Lance — B+ | Gunlance — B`,
    imageUrl: "",
    order: 7,
  },
  {
    title: "Exotic Weapons: Insect Glaive, Bow & Bowguns",
    content: `**INSECT GLAIVE**\nUnique among all weapons, the Glaive lets you vault through the air for aerial attacks while your **Kinsect** (a companion bug) harvests elemental **extracts** from monster parts. Combining the right extracts powers up your melee moves significantly.\n\nWilds shifted Insect Glaive toward **ground-based combat** rather than the aerial dominance of World: Iceborne — the signature Vaulting Dance was reworked. This makes it more accessible in Wilds.\n\n**Pros:** Excellent mobility, aerial options, extract buffs significantly boost damage.\n**Cons:** Managing Kinsect + extracts + vaulting adds cognitive load.\n**Best for:** Players who love mobile, aerial combat and bug companions.\n\n**BOW**\nA **ranged weapon** with high mobility and different **coatings** (status effects applied to arrows). Coatings include Power (raw damage), Paralysis, Poison, Sleep, and more.\n\n**Pros:** High mobility, great elemental options, coating system adds strategic flexibility.\n**Cons:** Ammo/coating management, close-range is dangerous.\n**Best for:** Players who want ranged damage without heavybowgun's commitment.\n\n**LIGHT BOWGUN & HEAVY BOWGUN**\nThe LBG is mobile and can **Rapid Fire** special ammo types. The HBG is slower but deals **heavy single shots** and has built-in defensive options like a shield.\n\n**Tier Rating (current meta):** Bow — S | LBG — A | HBG — A | Insect Glaive — B+`,
    imageUrl: "",
    order: 8,
  },
  {
    title: "Weapon Skills — Wilds' New Build System",
    content: `In previous Monster Hunter games, core combat skills came from **armor sets and decorations** — which meant optimizing your build often meant wearing ugly or mismatched armor just for the right skills.\n\n**Monster Hunter Wilds changes this fundamentally.** Weapon Skills are abilities built directly into your weapon. They stay active regardless of your armor, which means:\n\n- Your fashion hunter dreams are finally achievable — wear what you want!\n- Weapon selection is about more than raw damage — it's about what skills that weapon gives you\n- Build diversity increases dramatically since you're no longer locked to specific armor sets\n\n**Examples from actual weapons:**\n- Great Sword: Focus (faster charge times) + Critical Draw (opening strike power)\n- Sword and Shield: Horn Maestro (faster Hunting Horn song recitals)\n- Bow: Constitution (less stamina use when dodging)\n\n**Practical tip:** When choosing your secondary weapon for the dual-weapon system, consider whether its Weapon Skill complements or conflicts with your primary build. A Long Sword with quick spirit gauge building pairs well with a Bow that gives you Constitution for dodging.`,
    imageUrl: "",
    order: 9,
  },
  {
    title: "Which Weapon Should You Choose?",
    content: `Here's the honest beginner recommendation:\n\n**Start with Sword and Shield.** It has the lowest barrier to entry, lets you focus on learning monster patterns and the hunt loop without worrying about complex combo systems. You can use items without sheathing, meaning you're never helpless while repositioning.\n\n**Runner-up: Long Sword.** If you want something that feels more powerful and exciting, the Long Sword is a great second choice. It's more complex but the spirit gauge system is deeply satisfying once it clicks.\n\n**Avoid for your first 20 hours:** Charge Blade (extremely complex), Insect Glaive (dual resource management), Heavy Bowgun (ammo management is punishing at close range).\n\n**Key insight — you can test everything:** The Training Area at camp lets you use every weapon, including ones you haven't crafted yet. Spend 30 minutes there trying the movesets before committing. This is the single best use of early game time.\n\n**On the dual-weapon system for beginners:** Don't feel pressured to optimize dual-weapon builds early. Start with one weapon, learn the hunt flow, then add a second weapon for specific matchups once you're comfortable.\n\n**Final tip:** Monster Hunter is a game about **observation and adaptation**, not raw stats. No matter which weapon you choose, the key to improvement is watching monster behavior, learning attack telegraphs, and knowing when to attack versus when to back off. That's a skill that transfers across all 14 weapons.`,
    imageUrl: "",
    order: 10,
  },
];

async function main() {
  // Find the admin user
  const admin = await prisma.user.findFirst({
    where: { email: "admin@indexstep.com", role: "ADMIN" },
  });

  if (!admin) {
    console.error("Admin user not found!");
    process.exit(1);
  }

  console.log("Using admin:", admin.name, admin.email);

  // Delete any existing MH Wilds tutorials to avoid duplicates
  const existing = await prisma.tutorial.findMany({
    where: { title: { contains: "Monster Hunter Wilds" } },
  });
  for (const t of existing) {
    await prisma.tutorial.delete({ where: { id: t.id } });
    console.log("Deleted existing tutorial:", t.id);
  }

  const created = await prisma.tutorial.create({
    data: {
      ...tutorial,
      authorId: admin.id,
      tools: {
        create: tools.map((t) => ({
          name: t.name,
          quantity: t.quantity,
          kind: t.kind,
          notes: t.notes,
          category: t.category,
          size: "",
        })),
      },
      steps: {
        create: steps.map((s) => ({
          order: s.order,
          title: s.title,
          content: s.content,
          imageUrl: s.imageUrl || null,
        })),
      },
    },
  });

  console.log("\n✅ Created tutorial!");
  console.log("ID:", created.id);
  console.log("URL: http://localhost:3000/tutorial/" + created.id);
  console.log("Title:", created.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
