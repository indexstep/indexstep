/**
 * Cleanup script:
 * 1. Removes all tutorials (user wants nothing for sale/posted)
 * 2. Deduplicates users — keeps one admin, one mod, one user
 * 3. Fixes FK cascade by re-creating constraints
 *
 * Run: npx tsx prisma/cleanup-duplicates.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🧹 Starting cleanup...\n");

  // ── Step 1: Wipe all tutorials, tools, steps, comments, reports, purchases ──
  console.log("Step 1: Removing all tutorials, comments, reports, purchases...");
  await prisma.comment.deleteMany();
  await prisma.report.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.step.deleteMany();
  await prisma.tool.deleteMany();
  await prisma.tutorial.deleteMany();
  console.log("  ✅ Cleared\n");

  // ── Step 2: Add ON DELETE CASCADE to all FK constraints pointing to User ──
  // SQLite doesn't let you ALTER FK constraints, so recreate each table
  console.log("Step 2: Fixing all foreign key constraints with cascade...");
  await prisma.$executeRawUnsafe(`PRAGMA foreign_keys=OFF;`);

  // Helper to recreate a table with cascade FK
  const recreateWithCascade = async (table: string, fkColumn: string, extraCols = "") => {
    const cols = extraCols ? `, ${extraCols}` : "";
    await prisma.$executeRawUnsafe(`
      CREATE TABLE _backup AS SELECT * FROM ${table};
      DROP TABLE ${table};
      CREATE TABLE ${table} (
        id TEXT NOT NULL PRIMARY KEY,
        ${fkColumn} TEXT NOT NULL,
        createdAt TEXT NOT NULL
        ${cols},
        FOREIGN KEY (${fkColumn}) REFERENCES User(id) ON DELETE CASCADE
      );
      INSERT INTO ${table} SELECT * FROM _backup;
      DROP TABLE _backup;
    `);
    console.log(`  ✅ ${table}.${fkColumn} cascades`);
  };

  // Tutorial (extra cols)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE _tut_bak AS SELECT * FROM Tutorial;
    DROP TABLE Tutorial;
    CREATE TABLE Tutorial (
      id TEXT NOT NULL PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
      category TEXT NOT NULL, difficulty INTEGER NOT NULL, timeMinutes INTEGER NOT NULL,
      coverImage TEXT, viewCount INTEGER NOT NULL DEFAULT 0, published INTEGER NOT NULL DEFAULT 0,
      locked INTEGER NOT NULL DEFAULT 0, lockContent INTEGER NOT NULL DEFAULT 0,
      price INTEGER NOT NULL DEFAULT 0, customToolConfigs TEXT,
      authorId TEXT NOT NULL, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL,
      FOREIGN KEY (authorId) REFERENCES User(id) ON DELETE CASCADE
    );
    INSERT INTO Tutorial SELECT * FROM _tut_bak;
    DROP TABLE _tut_bak;
  `);
  console.log("  ✅ Tutorial.authorId cascades");

  // Step
  await prisma.$executeRawUnsafe(`
    CREATE TABLE _step_bak AS SELECT * FROM Step;
    DROP TABLE Step;
    CREATE TABLE Step (
      id TEXT NOT NULL PRIMARY KEY, "[order]" INTEGER NOT NULL, title TEXT NOT NULL,
      content TEXT NOT NULL, imageUrl TEXT, tutorialId TEXT NOT NULL,
      FOREIGN KEY (tutorialId) REFERENCES Tutorial(id) ON DELETE CASCADE
    );
    INSERT INTO Step SELECT * FROM _step_bak;
    DROP TABLE _step_bak;
  `);
  console.log("  ✅ Step.tutorialId cascades");

  // Tool
  await prisma.$executeRawUnsafe(`
    CREATE TABLE _tool_bak AS SELECT * FROM Tool;
    DROP TABLE Tool;
    CREATE TABLE Tool (
      id TEXT NOT NULL PRIMARY KEY, name TEXT NOT NULL, quantity TEXT,
      size TEXT, kind TEXT, notes TEXT, tutorialId TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'DIY',
      FOREIGN KEY (tutorialId) REFERENCES Tutorial(id) ON DELETE CASCADE
    );
    INSERT INTO Tool SELECT * FROM _tool_bak;
    DROP TABLE _tool_bak;
  `);
  console.log("  ✅ Tool.tutorialId cascades");

  // SystemLog
  await prisma.$executeRawUnsafe(`
    CREATE TABLE _log_bak AS SELECT * FROM SystemLog;
    DROP TABLE SystemLog;
    CREATE TABLE SystemLog (
      id TEXT NOT NULL PRIMARY KEY, action TEXT NOT NULL, target TEXT,
      actorId TEXT NOT NULL, ipAddress TEXT, createdAt TEXT NOT NULL,
      FOREIGN KEY (actorId) REFERENCES User(id) ON DELETE CASCADE
    );
    INSERT INTO SystemLog SELECT * FROM _log_bak;
    DROP TABLE _log_bak;
  `);
  console.log("  ✅ SystemLog.actorId cascades");

  // Report
  await prisma.$executeRawUnsafe(`
    CREATE TABLE _rep_bak AS SELECT * FROM Report;
    DROP TABLE Report;
    CREATE TABLE Report (
      id TEXT NOT NULL PRIMARY KEY, type TEXT NOT NULL, reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING', reporterId TEXT NOT NULL,
      reportedUserId TEXT, tutorialId TEXT, adminNote TEXT, resolvedAt TEXT, createdAt TEXT NOT NULL,
      FOREIGN KEY (reporterId) REFERENCES User(id) ON DELETE CASCADE,
      FOREIGN KEY (reportedUserId) REFERENCES User(id) ON DELETE SET NULL,
      FOREIGN KEY (tutorialId) REFERENCES Tutorial(id) ON DELETE SET NULL
    );
    INSERT INTO Report SELECT * FROM _rep_bak;
    DROP TABLE _rep_bak;
  `);
  console.log("  ✅ Report FKs fixed");

  // Comment
  await prisma.$executeRawUnsafe(`
    CREATE TABLE _com_bak AS SELECT * FROM Comment;
    DROP TABLE Comment;
    CREATE TABLE Comment (
      id TEXT NOT NULL PRIMARY KEY, content TEXT NOT NULL,
      likeCount INTEGER NOT NULL DEFAULT 0, likedBy TEXT NOT NULL DEFAULT '',
      authorId TEXT NOT NULL, tutorialId TEXT NOT NULL,
      parentId TEXT, createdAt TEXT NOT NULL,
      FOREIGN KEY (authorId) REFERENCES User(id) ON DELETE CASCADE,
      FOREIGN KEY (tutorialId) REFERENCES Tutorial(id) ON DELETE CASCADE,
      FOREIGN KEY (parentId) REFERENCES Comment(id) ON DELETE SET NULL
    );
    INSERT INTO Comment SELECT * FROM _com_bak;
    DROP TABLE _com_bak;
  `);
  console.log("  ✅ Comment FKs fixed");

  // Purchase
  await prisma.$executeRawUnsafe(`
    CREATE TABLE _pur_bak AS SELECT * FROM Purchase;
    DROP TABLE Purchase;
    CREATE TABLE Purchase (
      id TEXT NOT NULL PRIMARY KEY, userId TEXT NOT NULL,
      tutorialId TEXT NOT NULL, createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
      FOREIGN KEY (tutorialId) REFERENCES Tutorial(id) ON DELETE CASCADE,
      UNIQUE(userId, tutorialId)
    );
    INSERT INTO Purchase SELECT * FROM _pur_bak;
    DROP TABLE _pur_bak;
  `);
  console.log("  ✅ Purchase FKs fixed");

  await prisma.$executeRawUnsafe(`PRAGMA foreign_keys=ON;`);
  console.log("  ✅ All FK constraints now cascade\n");

  // ── Step 3: Deduplicate users ──
  // Keep priority: ADMIN > MODERATOR > USER
  // Within same role: keep oldest (first created)
  console.log("Step 3: Deduplicating users...");

  const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Role priority
  const rolePriority = (r: string) => (r === "ADMIN" ? 0 : r === "MODERATOR" ? 1 : 2);

  const groups = new Map<string, typeof allUsers>();
  for (const u of allUsers) {
    const key = u.email.toLowerCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(u);
  }

  const toDelete: string[] = [];

  for (const [email, users] of groups) {
    if (users.length === 1) {
      console.log(`  ${email}: 1 account, keep`);
      continue;
    }

    // Sort by role priority, then by createdAt
    users.sort((a, b) => {
      const rp = rolePriority(a.role) - rolePriority(b.role);
      if (rp !== 0) return rp;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const [keep, ...remove] = users;
    console.log(`  ${email}: ${users.length} accounts`);
    console.log(`    → KEEP: ${keep.email} (${keep.role}) [${keep.id}]`);
    remove.forEach((u) => {
      console.log(`    → DELETE: ${u.email} (${u.role}) [${u.id}]`);
      toDelete.push(u.id);
    });
  }

  // Delete duplicates (cascade will handle logs via Prisma, Tutorial already cleared)
  for (const id of toDelete) {
    try {
      await prisma.user.delete({ where: { id } });
      console.log(`  ✅ Deleted ${id}`);
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error(`  ❌ Failed to delete ${id}: ${e.message}`);
    }
  }

  // ── Step 4: Clear system logs ──
  console.log("\nStep 4: Clearing system logs...");
  await prisma.systemLog.deleteMany();
  console.log("  ✅ Cleared\n");

  // ── Summary ──
  const remaining = await prisma.user.findMany({ select: { email: true, name: true, role: true } });
  console.log("✅ Cleanup complete!");
  console.log("\nRemaining users:");
  for (const u of remaining) {
    console.log(`  - ${u.email} | ${u.name} | ${u.role}`);
  }
}

main()
  .catch((e) => {
    console.error("Fatal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
