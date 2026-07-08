// Update ENGINE section of the S15 Spec R Drift Build spec
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = "postgresql://stephud:stephud123@2.24.211.197:5432/stephud";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const root = await prisma.spec.findFirst({ 
    where: { name: "NISSAN S15 SPEC R DRIFT BUILD", parentId: null }
  });
  if (!root) { console.log("Root not found"); return; }
  console.log("Root found:", root.id);

  const engine = await prisma.spec.findFirst({ 
    where: { name: "ENGINE", parentId: root.id }
  });
  if (!engine) { console.log("ENGINE not found"); return; }
  console.log("ENGINE found:", engine.id);

  const updates = [
    {
      name: "FULL ENGINE SWAP",
      details: `Stock Engine: SR20DET (250 PS / 203 lb-ft torque)

The S15 Spec R comes with the SR20DET — a reliable, responsive turbocharged 4-cylinder. For drift, keep it and upgrade the turbo. It responds extremely well to bolt-ons and tuning.

━━━ DRIFT BUILD PATH ━━━

PATH A — Stock Block (Recommended)
Stage 1 Turbo + tune = ~350 HP
Stage 2 Turbo + intake/exhaust = ~420-450 HP
Stage 3 Turbo + intercooler = ~500-550 HP
• Stay on stock internals up to ~450 HP
• Forged internals needed above 500 HP

PATH B — Built Block
Forged pistons + rods + Stage 3 Turbo = 600-800+ HP
• Strong enough for serious competition

━━━ ENGINE SWAP OPTIONS ━━━
(If you want more power or a different character)

• LS-SERIES V8 — Most popular drift swap. Easy 600-800+ HP, cheap parts, massive torque. The easy answer.
• RB26DETT — Iconic JDM twin-turbo straight-six from GT-R. 400-600+ HP. Expensive but legendary.
• 2JZ-GTE — Toyota inline-six. Nearly indestructible bottom end. 500-800+ HP. Great for sustained high-power drift.
• VR38DETT — Nissan V8 from GT-R. Modern, powerful, expensive. 500-700+ HP.`
    },
    {
      name: "INTAKE",
      details: `Race Intake — cold air intake that improves airflow to the engine.

Stock intake is restrictive on the SR20DET, especially when upgraded. A race intake:
• Improves throttle response
• Reduces turbo spool time slightly
• Adds 10-20 HP on a tuned car

PI TIP: Intake gives a solid power increase for minimal PI cost. Install early in your upgrade path.`
    },
    {
      name: "EXHAUST",
      details: `Race Exhaust — headers + full exhaust system.

The stock exhaust is a major restriction on the SR20DET. A full race exhaust:
• Reduces backpressure = more power
• Adds 15-25 HP on a tuned car
• Saves ~15-20 lbs of weight
• Sounds significantly better

Must have if you are going above Stage 1 turbo.`
    },
    {
      name: "TURBO",
      details: `━━━ TURBO STAGES ━━━

STAGE 1 — Stock turbo, ~350 HP
• Safe, reliable, no significant lag
• Good for beginners or PI-class-limited builds

STAGE 2 — Mild upgrade turbo, ~420-450 HP
• Slight increase in spool lag
• Best balance of power + drivability for drift
• Needs supporting mods (intake, exhaust, intercooler)

STAGE 3 — Large turbo, ~500-600+ HP
• Noticeable spool lag (takes time to build boost)
• Needs forged internals, upgraded fuel system, stronger clutch
• For competition-level drift builds only

━━━ FOR DRIFT ━━━
Stage 2 is the sweet spot — fast power delivery, manageable lag, easy to balance for both initiation and sustained slide.

Stage 3 if you are competing at high levels and want to stand out.`
    },
    {
      name: "INTERCOOLER",
      details: `Race Intercooler — lowers intake air temperature after the turbo.

Why it matters for drift:
• The SR20DET generates a lot of heat under sustained high RPM / high boost
• Hot intake air = less dense air = less power = potential detonation
• A race intercooler keeps intake temps consistent lap after lap

Without a proper intercooler, you will notice power dropping after a few seconds of sustained full throttle.

Must have for Stage 2+ turbo builds. Optional but recommended for Stage 1 if you drive aggressively.`
    },
    {
      name: "PISTONS & RODS",
      details: `Forged Internals — replace stock cast components with forged pistons and connecting rods.

━━━ WHEN YOU NEED THEM ━━━

Stock internals (cast): Safe to ~450 HP on the SR20DET
Forged internals: Required at 500+ HP

For drift specifically: the engine sees a lot of high-RPM load, clutch kicks, and sudden throttle cuts — all of which stress the bottom end. If you are doing any serious drifting, forged is worth the cost.

━━━ WHAT YOU GET ━━━
• Forged pistons — lighter, stronger, handle higher cylinder pressures
• Forged rods — can take more abuse without bending
• Can support 600-800+ HP reliably

Upgrade to forged when you install your Stage 3 turbo.`
    }
  ];

  for (const u of updates) {
    const spec = await prisma.spec.findFirst({ where: { name: u.name, parentId: engine.id } });
    if (spec) {
      await prisma.spec.update({ where: { id: spec.id }, data: { details: u.details } });
      console.log(`Updated: ${u.name}`);
    } else {
      console.log(`NOT FOUND: ${u.name}`);
    }
  }

  console.log("\nENGINE section updated!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
