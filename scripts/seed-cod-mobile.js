#!/usr/bin/env node
/**
 * Seed script: COD Mobile Type 19 Best Kill Gun Spec
 * Run: node scripts/seed-cod-mobile.js
 */
const crypto = require('crypto');

function uid() {
  return crypto.randomUUID();
}

function spec(id, name, details, color, icon, authorId, parentId) {
  const published = true;
  const locked = false;
  const lockContent = false;
  const price = 0;
  const linkOnly = false;
  const viewCount = 0;
  const likeCount = 0;
  const followCount = 0;
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;

  return `INSERT INTO "Spec" (id, name, details, color, icon, "authorId", "parentId", "published", "locked", "lockContent", "price", "linkOnly", "viewCount", "likeCount", "followCount", "createdAt", "updatedAt", "editCount") VALUES ('${id}', E'${name.replace(/'/g, "''")}', E'${(details||'').replace(/'/g, "''")}', '${color}', ${icon ? `'${icon}'` : 'NULL'}, '${authorId}', ${parentId ? `'${parentId}'` : 'NULL'}, ${published}, ${locked}, ${lockContent}, ${price}, ${linkOnly}, ${viewCount}, ${likeCount}, ${followCount}, '${createdAt}', '${updatedAt}', 0);`;
}

const authorId = 'cmr8h3gji0000gej17cz8rsl5';
const rootId   = uid();  // Type 19 root

const sStats   = uid();  // Base Weapon Stats
const sDmg     = uid();  // Damage Profiles
const sAttach  = uid();  // Optimal Attachments
const sModes   = uid();  // Per-Mode Builds
const sClass   = uid();  // Class Synergies

// Stat leaf IDs
const sPeak    = uid(); const sRange   = uid(); const sFireRate = uid();
const sMobility = uid(); const sAccuracy = uid(); const sRecoil  = uid();
const sHeadshot = uid();

// Damage leaf IDs
const dChest = uid(); const dLimb  = uid(); const dHead  = uid(); const dDPS = uid();

// Attachment leaf IDs
const aMuzzle = uid(); const aBarrel = uid(); const aLaser = uid(); const aOptic = uid();
const aStock  = uid(); const aGrip   = uid(); const aMag   = uid(); const aAmmo  = uid();
const aPerk   = uid();

// Mode leaf IDs
const mBR     = uid(); const mHsens = uid(); const mMP    = uid(); const mHP    = uid();
const mGround = uid();

// Class leaf IDs
const cOA     = uid(); const cGhost = uid(); const cHR    = uid(); const cDT    = uid();

const lines = [
  spec(rootId,  'Type 19 — Best Kill Gun Build', 'S-Rank Meta | Warzone BR | BR Quads | Top 1% K/D Weapon. The Type 19 is the dominant AR in the current meta — fastest TTK in class, exceptional mobility, and manageable recoil that rewards precision at range.', '#FF4444', '🎯', authorId, null),

  spec(sStats,  'Base Weapon Stats', 'All stats at base level, no attachments. Fully tuned build reaches 99/99 accuracy in Warzone.', '#FF6B35', '📊', authorId, rootId),
  spec(sPeak,   'Peak Damage',         '28-32 damage per bullet depending on range', '#2C5FE6', '📈', authorId, sStats),
  spec(sRange,  'Effective Range',     '28m before damage drop-off begins', '#2C5FE6', '📈', authorId, sStats),
  spec(sFireRate,'Fire Rate',          '821 RPM — fastest in the AR class', '#2C5FE6', '📈', authorId, sStats),
  spec(sMobility,'Mobility',          'Movement Speed: 6.8m/s | ADS Speed: 232ms', '#2C5FE6', '📈', authorId, sStats),
  spec(sAccuracy,'Accuracy',          'Base accuracy: 72% | First shot recoil: Low', '#2C5FE6', '📈', authorId, sStats),
  spec(sRecoil, 'Recoil Control',     'Vertical dominant — easy to control with minor left pull', '#2C5FE6', '📈', authorId, sStats),
  spec(sHeadshot,'Headshot Multiplier','1.42x — combined with fire rate = devastating', '#2C5FE6', '📈', authorId, sStats),

  spec(sDmg,    'Damage Profiles', 'TTK breakdown at each range bracket. Type 19 kills faster than any other AR at all ranges.', '#9B59B6', '💀', authorId, rootId),
  spec(dChest,  'Base Damage (Chest)',  '32 HP up close — 4 shots to kill | 28 HP at range — 5 shots', '#2C5FE6', '💥', authorId, sDmg),
  spec(dLimb,   'Base Damage (Limb)',   '23 HP — limb shots add one additional bullet to kill', '#2C5FE6', '💥', authorId, sDmg),
  spec(dHead,   'Base Damage (Head)',   '45 HP — headshots reduce TTK by ~30%', '#2C5FE6', '💥', authorId, sDmg),
  spec(dDPS,    'Damage Per Second',    '439 DPS — highest of any AR in Warzone BR', '#2C5FE6', '💥', authorId, sDmg),

  spec(sAttach, 'Optimal Attachments', 'Ranked Warzone BR build — maximizes TTK while keeping mobility high enough for aggressive plays.', '#16A085', '🔧', authorId, rootId),
  spec(aMuzzle, 'Corvus Dash Hauser 16',    '7% recoil control, 3% range | Best in slot for vertical recoil', '#2C5FE6', '🔩', authorId, sAttach),
  spec(aBarrel, 'FSS R9S Thunderbolt',       '+30% range, +10% velocity, -3% mobility | Extended AR barrel', '#2C5FE6', '🔩', authorId, sAttach),
  spec(aLaser,  'Vlk LZR 7mw',               '0 ADS spread, +15% hip-fire accuracy | Swap for OWC laser in HC modes', '#2C5FE6', '🔩', authorId, sAttach),
  spec(aOptic, 'A30 Tactical Reflex (Factory)','Clean optic, no ADS penalty | Remove for iron sight build', '#2C5FE6', '🔩', authorId, sAttach),
  spec(aStock,  'No Stock',                   '+15% movement speed, +10% ADS speed | Most impactful mobility attachment', '#2C5FE6', '🔩', authorId, sAttach),
  spec(aGrip,   'Phantom-V Grip',             '+12% recoil control, +6% accuracy | Tightens first shot grouping', '#2C5FE6', '🔩', authorId, sAttach),
  spec(aMag,    '45 Round Extended Mag',       '45 rounds, +0 ADS penalty | Never run 60-round — too slow', '#2C5FE6', '🔩', authorId, sAttach),
  spec(aAmmo,   'Temperature Mag',             '+20% fire rate, +15% reload | Overkill compatible without ammo penalty', '#2C5FE6', '🔩', authorId, sAttach),
  spec(aPerk,   'Dispatch Runner / Agile',     '15% faster tactical sprint to tactical sprint | Essential for rushing', '#2C5FE6', '🔩', authorId, sAttach),

  spec(sModes,  'Per-Mode Builds', 'Different loadouts for different game modes. Swap 1-2 attachments per mode.', '#E67E22', '🎮', authorId, rootId),
  spec(mBR,     'Warzone BR (Quads/Solos)',    'Standard ranked build above. Best paired with: Cargo Truck / Pellet Drop / LTV. Use: Overkill -> Amped after 1st loadout.', '#2C5FE6', '🏁', authorId, sModes),
  spec(mHsens,  'High Sensitivity BR Build',  'Replace Stock with: FORGE TAC Ultralight | Replace Optic with: MIL-SCOPE 8x | ADS: 289ms | Used by top ranked preds', '#2C5FE6', '🏁', authorId, sModes),
  spec(mMP,     'MP: Team Deathmatch',         'Swap Barrel for: FSS R9S Fury | Swap Laser for: Tac Laser | More aggressive in small maps, less range needed', '#2C5FE6', '🏁', authorId, sModes),
  spec(mHP,     'Hardpoint / Headquarters',   'Stock: No Stock | Laser: Tac Laser | Mobility maxed for rotating hill fast | Aggressive AR flashlight meta', '#2C5FE6', '🏁', authorId, sModes),
  spec(mGround, 'Ground War / Invasion',       'Keep FSS R9S Thunderbolt barrel | Add: 45 Round Mag | Range build for 50+ meter fights common in large maps', '#2C5FE6', '🏁', authorId, sModes),

  spec(sClass,  'Best Class Synergies', 'Type 19 pairs best with these loadouts for maximum effectiveness.', '#8E44AD', '🛡️', authorId, rootId),
  spec(cOA,     'Primary: Type 19 / Secondary: JAK Threshold',  'Overkill + Amped = fastest AR + fastest smg swap. Best overall meta loadout in Warzone. Primary: Type 19, Secondary: JAK Threshold shotgun.', '#2C5FE6', '⚡', authorId, sClass),
  spec(cGhost,  'Ghost + Vtol / Heli',  'Ghost + Cargo Truck or Little Bird | Stay off radar while flanking | Type 19 excels at medium range from ghosted positions', '#2C5FE6', '⚡', authorId, sClass),
  spec(cHR,     'High Alert + Restock', 'Restock gives infinite grenades | High Alert gives early warning | Type 19 + Semtex + Heartbeat = complete loadout for aggressive plays', '#2C5FE6', '⚡', authorId, sClass),
  spec(cDT,     'Double Time + Fast Hands', 'Triple sprint duration + instant reload swap | Pairs with: JAK Threshold | Most mobile class in Warzone — best for flag plays', '#2C5FE6', '⚡', authorId, sClass),
];

process.stdout.write(lines.join('\n') + '\n');
