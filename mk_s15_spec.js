// Script to create the Nissan S15 Spec R Drift Build spec tree in stephud
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL || "postgresql://stephud:stephud123@2.24.211.197:5432/stephud";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const RED = "#C8102E";
const BLUE = "#2C5FE6";

async function main() {
  // Find or create admin user
  let user = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!user) {
    user = await prisma.user.findFirst();
  }
  if (!user) {
    console.error("No users found in database!");
    process.exit(1);
  }
  console.log("Using user:", user.email, user.role);

  // Create root spec: Nissan S15 Spec R Drift Build
  const root = await prisma.spec.create({
    data: {
      name: "NISSAN S15 SPEC R DRIFT BUILD",
      details: "Forza Horizon 5 — Fast Grippy Drift Build\n\nA balanced build for the S15 Spec R that prioritizes both initial drift angle (snap/snap-style initiation) and sustained high-speed slides. Built around a race transmission, drift tires, and carefully tuned suspension.",
      color: RED,
      icon: null,
      authorId: user.id,
      published: true,
      locked: false,
      lockContent: false,
      price: 0,
      linkOnly: false,
    },
  });
  console.log("Created root:", root.name, root.id);

  // Helper to create a child spec
  const child = async (parentId, name, details, color) => {
    return prisma.spec.create({
      data: {
        name,
        details: details || "",
        color: color || BLUE,
        icon: null,
        parentId,
        authorId: user.id,
        published: true,
        locked: false,
        lockContent: false,
        price: 0,
        linkOnly: false,
      },
    });
  };

  // ── ENGINE ──
  const engine = await child(root.id, "ENGINE", "", RED);
  await child(engine.id, "FULL ENGINE SWAP", "Keep stock SR20DET or use Turbo Upgrade stage 3 for more power.", BLUE);
  await child(engine.id, "INTAKE", "Race intake for better airflow and throttle response.", BLUE);
  await child(engine.id, "EXHAUST", "Race exhaust — less restriction, more sound, slight weight reduction.", BLUE);
  await child(engine.id, "TURBO", "Large/High Boost — big power but watch for spool lag. Stage 3 recommended for 500+ HP.", BLUE);
  await child(engine.id, "INTERCOOLER", "Race intercooler — reduces intake temps and keeps power consistent.", BLUE);
  await child(engine.id, "PISTONS & RODS", "Forged internals — adds torque and reliability for high-power builds.", BLUE);
  console.log("Created ENGINE children");

  // ── DRIVETRAIN ──
  const drivetrain = await child(root.id, "DRIVETRAIN", "", RED);
  await child(drivetrain.id, "TRANSMISSION", "Race transmission — close-ratio gears, full tuning control over individual gear ratios. Essential for drift.", BLUE);
  await child(drivetrain.id, "DIFFERENTIAL", "Race differential — tune lock % to balance grip and slide. 70-85% for grippy drift.", BLUE);
  console.log("Created DRIVETRAIN children");

  // ── HANDLING ──
  const handling = await child(root.id, "HANDLING", "", RED);
  await child(handling.id, "SPRINGS", "Race springs — lower the car, reduce body roll. Front: 350-450 lb/in | Rear: 250-350 lb/in.", BLUE);
  await child(handling.id, "ROLL BARS (ARB)", "Front stiff for crisp turn-in. Rear medium to let the rear rotate without snapping.", BLUE);
  await child(handling.id, "SHOCKS", "Race shocks — firm but not harsh. Keeps contact patch through corners.", BLUE);
  await child(handling.id, "CAMBER", "Front: -2.0° to -2.5° | Rear: -1.5° to -2.0°. More negative = more grip at the cost of straight-line wear.", BLUE);
  await child(handling.id, "TOE", "Front: +0.05° to +0.1° (slight positive) | Rear: -0.1° to -0.2° (negative = easier rotation).", BLUE);
  await child(handling.id, "BRAKES", "Race brakes (carbon or ceramic if PI allows). Brake bias at 57-60% front for brake-initiated drifts.", BLUE);
  console.log("Created HANDLING children");

  // ── TIRES ──
  const tires = await child(root.id, "TIRES", "", RED);
  await child(tires.id, "COMPOUND", "DRIFT compound — less grip = easier to break traction and initiate slides. Sport = more grip = hybrid driving.", BLUE);
  await child(tires.id, "WIDTH", "Wide-body front & rear if PI allows. Otherwise max width on both ends.", BLUE);
  await child(tires.id, "TIRE PRESSURE", "Lower rear (26-28 PSI cold) = more sidewall flex = more slide. Front moderate (30-32 PSI cold).", BLUE);
  console.log("Created TIRES children");

  // ── AERO (OPTIONAL) ──
  const aero = await child(root.id, "AERO (OPTIONAL)", "", RED);
  await child(aero.id, "WIDE BODY KIT", "Yes if running big power (500+ HP). Adds stability at speed for high-speed sustained drifts.", BLUE);
  await child(aero.id, "FRONT BUMPER", "Stock or Aero — adds downforce. Aero recommended for high-speed stability.", BLUE);
  await child(aero.id, "REAR WING", "Race wing — high-speed stability. Can push PI rating up so check class limits.", BLUE);
  console.log("Created AERO children");

  // ── TUNING ──
  const tuning = await child(root.id, "TUNING SETTINGS", "", RED);

  const tireTuning = await child(tuning.id, "TIRE PRESSURES", "", BLUE);
  await child(tireTuning.id, "FRONT COLD PSI", "30-32 PSI (hot: 33-35 PSI)", BLUE);
  await child(tireTuning.id, "REAR COLD PSI", "26-28 PSI (hot: 28-30 PSI) — lower = more slide.", BLUE);

  const camberTuning = await child(tuning.id, "CAMBER", "", BLUE);
  await child(camberTuning.id, "FRONT CAMBER", "-2.0° to -2.5° — more grip in corners but more tire wear on straights.", BLUE);
  await child(camberTuning.id, "REAR CAMBER", "-1.5° to -2.0° — balanced rear grip and drift capability.", BLUE);

  const springTuning = await child(tuning.id, "SPRINGS", "", BLUE);
  await child(springTuning.id, "FRONT SPRINGS", "350-450 lb/in — stiffer front = sharper turn-in but can push understeer.", BLUE);
  await child(springTuning.id, "REAR SPRINGS", "250-350 lb/in — softer rear = more weight transfer to rear = easier slide.", BLUE);

  const arbTuning = await child(tuning.id, "ROLL BARS (ARB)", "", BLUE);
  await child(arbTuning.id, "FRONT ARB", "Medium-Stiff — crisp turn-in without being twitchy.", BLUE);
  await child(arbTuning.id, "REAR ARB", "Medium — lets rear rotate without snapping. If car loops → soften rear.", BLUE);

  const diffTuning = await child(tuning.id, "DIFFERENTIAL", "", BLUE);
  await child(diffTuning.id, "ACCELERATION LOCK", "80-100% for grippy drift. If too grippy → lower to 60-70%.", BLUE);
  await child(diffTuning.id, "DECELERATION LOCK", "40-60% — controls how the car behaves when you lift off mid-drift.", BLUE);

  const gearTuning = await child(tuning.id, "GEAR RATIOS", "", BLUE);
  await child(gearTuning.id, "1ST GEAR", "Short (3.5-3.8) — clutch kick initiation in 2nd is standard, but shorter 1st helps low-speed slides.", BLUE);
  await child(gearTuning.id, "2ND GEAR", "Short-Medium (2.2-2.5) — primary drift gear. Tune so RPM stays in power window.", BLUE);
  await child(gearTuning.id, "3RD GEAR", "Medium (1.5-1.7) — sustained mid-speed drift gear.", BLUE);
  await child(gearTuning.id, "4TH GEAR", "Medium-Tall (1.2-1.4) — high-speed runs.", BLUE);
  await child(gearTuning.id, "5TH GEAR", "Tall (1.0-1.1) — highway / top speed.", BLUE);
  await child(gearTuning.id, "6TH GEAR", "Tall (0.7-0.8) — final drive / cruise.", BLUE);
  await child(gearTuning.id, "DIFF RATIO", "4.3 to 4.9 recommended — shorter = more tire spin, easier slide initiation.", BLUE);

  const brakeTuning = await child(tuning.id, "BRAKE BIAS", "", BLUE);
  await child(brakeTuning.id, "BRAKE PRESSURE", "100% — full braking force.", BLUE);
  await child(brakeTuning.id, "BRAKE BIAS", "55-60% Front / 40-45% Rear — more rear bias = ability to brake into drifts.", BLUE);

  const drivingTips = await child(tuning.id, "DRIVING TIPS", "", BLUE);
  await child(drivingTips.id, "INITIATION", "Clutch kick in 2nd gear, then countersteer into the slide.", BLUE);
  await child(drivingTips.id, "HOLDING", "Feed throttle progressively. Don't floor it then lift — that snaps the car.", BLUE);
  await child(drivingTips.id, "CATCHING", "Countersteer opposite to slide direction with smooth inputs.", BLUE);
  await child(drivingTips.id, "EASING OFF", "Feather throttle to slow the drift, don't stab brakes mid-slide.", BLUE);
  await child(drivingTips.id, "SPEED", "Higher speed = more stable drift but harder to control. Find your car's sweet spot.", BLUE);
  console.log("Created TUNING children");

  // ── PI TARGET ──
  const pi = await child(root.id, "PI TARGET", "", RED);
  await child(pi.id, "CLASS", "A-Class (A 800) or S1-Class (S1 900) depending on power level.", BLUE);
  await child(pi.id, "BALLAST", "Use ballast and weight reduction to fine-tune PI without losing performance.", BLUE);
  await child(pi.id, "WEIGHT REDUCTION", "Stage 2 or 3 recommended. Keep ballast for PI tuning.", BLUE);
  console.log("Created PI TARGET children");

  console.log("\n✅ S15 Spec R Drift Build spec tree created successfully!");
  console.log("Root spec ID:", root.id);
  console.log("View at: http://localhost:3000/specs/" + root.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
