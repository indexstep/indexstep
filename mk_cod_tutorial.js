
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'codguru@stephud.com' } })
  if (!user) { console.log('User not found'); return }
  console.log('Using user:', user.email, user.id)

  const existing = await prisma.tutorial.findFirst({ where: { title: { contains: 'Best Call of Duty Mobile Weapon Class' } } })
  if (existing) {
    console.log('Tutorial already exists, ID:', existing.id)
    return
  }

  const tutorial = await prisma.tutorial.create({
    data: {
      title: "Best Call of Duty Mobile Weapon Class Loadouts for Ranked Play",
      description: "A breakdown of the strongest weapon class setups in CoD Mobile Ranked, covering the meta weapons, attachments, perks, and tactical choices that give you the best chance of climbing ranks. Updated for the current season.",
      category: "Gaming",
      difficulty: 2,
      timeMinutes: 20,
      published: true,
      authorId: user.id,
      tools: {
        create: [
          { name: "Call of Duty Mobile", quantity: "1", category: "Game" },
          { name: "Preferred platform (mobile/controller)", quantity: "1", category: "Device" },
        ]
      },
      steps: {
        create: [
          {
            order: 1,
            title: "Understanding the Current Meta in Ranked Play",
            content: "The CoD Mobile ranked meta shifts every season as the developers balance weapons and introduce new content. Right now, the strongest weapon classes in high-rank lobbies are SMGs for aggressive rush plays and ARs for more controlled, mid-range engagement. Shotguns see occasional use on specific map types, while snipers are situational picks on larger maps.\n\nThe key to climbing is choosing ONE weapon class and mastering it completely. Trying to learn multiple classes at once dilutes your skill development and makes it harder to read opponents. Pick based on your playstyle: if you like to push objectives and flank, go SMG. If you prefer holding angles and picking people off, go AR or sniper.\n\nThis guide focuses on loadouts that perform consistently across most ranked maps, not cheese builds that only work in specific scenarios."
          },
          {
            order: 2,
            title: "Best SMG Class: The Rush Meta",
            content: "The PPSh and the Switchblade X9 are currently the top SMG picks for aggressive ranked play. Both offer the mobility and fire rate needed to close distance fast and melt opponents before they can react.\n\nFor the Switchblade X9, use these key attachments: extended barrel for better range, folded stock for faster ADS, and a fast mag to keep the pressure on. Perk setup should include Agile for faster movement, Ghost or Tracker depending on the map, and either a Trophy System or Smoke Grenade for self-preservation.\n\nThe PPSh is slightly more forgiving at close range and handles better in tight corridors. Prioritize the grip tape and lightweight barrel. Its higher recoil is manageable with practice. Run Lightweight Boots and the appropriate operator skill — the War Machine or the Transform Shield both work well in ranked.\n\nTacticals: Concussion Grenade to blind enemies before pushing.\nLethal: Frag Grenade for post-plant situations or room clearing.\nField Upgrade: Trophy System is the safest choice for objective modes."
          },
          {
            order: 3,
            title: "Best AR Class: Controlled Aggression",
            content: "The M13 and the Manua Oren are the strongest AR choices for ranked right now. They both offer solid damage at range without the extreme mobility penalty of heavier setups.\n\nM13 loadout: Use the OWC Ranger barrel for range, stippled grip tape for faster ADS, and no stock to keep mobility high. This build lets you play aggressive angles while still winning at medium range. The fire rate is high enough that you can challenge SMGs if you get the first shot.\n\nManua Oren is the better pick if you want raw damage output. It has higher damage per bullet and manageable recoil with the right attachments. Use the compensator and extended barrel to push its effective range even further. This gun rewards precision over spray-and-pray.\n\nPerks: Vulture for self-revives, Agile for repositioning, and Tracker or Ghost depending on whether enemy movement is visible. In high-rank lobbies, Ghost is more consistent since most players run Tracker or Dark Sight.\n\nTacticals: Stun Grenade to lock down corners.\nLethal: Molotov for area denial around objectives."
          },
          {
            order: 4,
            title: "Sniper Class: High-Risk, High-Reward",
            content: "The DL Q33 and the Arctic .50 are the top sniper picks. They one-shot most weapons at range and can completely shut down lanes in ranked. The tradeoff is a high skill ceiling and vulnerability up close.\n\nDL Q33 setup: Use the extended barrel for maximum range, a red dot scope for faster ADS than a high-magnification optic, and the lightweight chassis to improve mobility between shots. The fast bolt action speed means you canquickscope more effectively than with the Arctic.\n\nThe Arctic .50 hits harder and has more stopping power on moving targets, but the slower cycle time makes it harder to double-tap fast enemies. It is better on larger maps where you have time to line up shots.\n\nPerks: Agile to relocate after a shot, Ghost to stay hidden between lanes, and Vulture for the self-revive in objective modes. Run the Trap Master or Shadow Clone operator skill to round out the class.\n\nTip: Do not hard-scope lanes for more than 5 seconds. Good players will pre-aim your position. Pop in and out, or relocate after every 2-3 shots."
          },
          {
            order: 5,
            title: "Perk Combination Reference",
            content: "The three perk slots in CoD Mobile give you the most customization flexibility in your class setup. Here are the strongest combinations depending on your role:\n\n**Aggressive entry fragger:** Agile (fast sprint + ADS movement) + Ghost (hide from enemy killstreaks and UAVs) + Vulture (self-revive after a trade). This setup assumes you are pushing first and need to survive getting traded.\n\n**Objective player:** Tracker (see enemy footsteps and corpse markers) + Agile + Vulture. Tracker helps you find enemies planting or defending objectives. Vulture is critical for staying in the fight after a trade.\n\n**Support/sniper:** Ghost + Agile + either Tracker or a second mobility perk. You need to stay off enemy radar when holding still for a sniper.\n\nAvoid stacking two defensive perks in the same loadout unless you are playing very conservatively. Mobility is king in CoD Mobile ranked because positioning determines most gunfights."
          },
          {
            order: 6,
            title: "Seasonal Meta Shifts and How to Adapt",
            content: "Every season the weapon meta changes. New weapons get added, existing weapons get buffed or nerfed, and map rotations shift. Here is how to stay ahead of those changes:\n\nAfter a major patch: Wait 24-48 hours before committing to a new loadout. The community will quickly identify which weapons are overtuned or underperforming. Pro players and content creators will publish updated tier lists within that window.\n\nTrack your personal stats: If your K/D suddenly drops on a weapon that has not changed, it might be a personal skill issue with the current meta, not the weapon. Review your heatmaps and see if you are dying in situations the weapon should handle.\n\nDo not chase the meta blindly: If a weapon has a 3% higher win rate in the meta but you have 200 hours on your current main, the switch is not worth it unless you are in the top 500. Mastery beats meta in most ranks.\n\nTest new weapons in unranked first: Get 20-30 games of feel for a new weapon before bringing it into ranked. You need to know the recoil pattern, effective range, and ADS timing before it matters."
          },
          {
            order: 7,
            title: "Common Mistakes That Keep Players in Low Ranks",
            content: "Running the wrong sensitivity: High sensitivity helps with fast flick shots but destroys consistency for tracking. Find a sensitivity that lets you make small adjustments smoothly. If you are constantly over-shooting or under-shooting, your sens is wrong for your playstyle.\n\nIgnoring the minimap: A huge percentage of players never look at the minimap during firefights. You are giving up free intel on enemy positions. Check it every 3-4 seconds during downtime.\n\nOver-relying on auto-aim: Auto-aim carries players in low ranks but becomes a liability in high-rank lobbies where players know how to break it. Practice manual aim in bots and unranked until your manual accuracy is above 30%.\n\nBad class swap timing: Switching classes mid-session while tilted is one of the fastest ways to lose rank. If you are on a 3+ game losing streak, take a 10-minute break before switching anything.\n\nPoor audio discipline: Running without headphones, or playing with music on, means you miss audio cues like enemy footsteps, reloads, and ability sounds. Good audio awareness gives you free information that eyes cannot provide."
          },
          {
            order: 8,
            title: "Final Class Setup Summary",
            content: "For most players climbing ranked in the current season, the best all-around pick is the M13 AR with the following build:\n\n**Primary Weapon:** M13 with OWC Ranger barrel, stippled grip tape, no stock, fast mag, and a red dot sight.\n\n**Secondary:** Use a short-range sidearm like the J358 for close-quarter backup.\n\n**Perk 1:** Agile\n**Perk 2:** Ghost\n**Perk 3:** Vulture\n\n**Tactical:** Stun Grenade\n**Lethal:** Molotov or Frag\n**Field Upgrade:** Trophy System\n\nThis setup gives you the flexibility to play mid-range and challenge aggressive pushers. It is not the hardest-hitting class, but it has the most consistent TTK across engagement ranges. Once you hit a wall where this build is not working, identify the specific gap (usually positioning or map awareness) before switching weapons.\n\nThe goal is not to copy a pro loadout. It is to build a setup that fits how YOU play and then sharpen that craft until it exceeds what a better weapon could offer."
          }
        ]
      }
    }
  })

  console.log('Created tutorial ID:', tutorial.id)
  console.log('URL: https://stephud.com/tutorial/' + tutorial.id)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
