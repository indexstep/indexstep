const { Client } = require('pg');
const dns = require('dns');
const bcrypt = require('bcryptjs');

async function resolveIPv4(hostname) {
  return new Promise((resolve) => {
    dns.lookup(hostname, { family: 4 }, (err, address, family) => {
      if (err) {
        console.error('DNS lookup failed:', err.message);
        resolve(hostname); // fallback to hostname
      } else {
        console.log(`Resolved ${hostname} to IPv4: ${address}`);
        resolve(address);
      }
    });
  });
}

async function main() {
  const hostname = 'db.ahzkorykrxctsywhnyxz.supabase.co';
  const ip = await resolveIPv4(hostname);

  const client = new Client({
    host: ip,
    port: 5432,
    database: 'postgres',
    user: 'postgres.ahzkorykrxctsywhnyxz',
    password: 'St3phudPass1',
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected!');

  const tables = `
    CREATE TABLE IF NOT EXISTS "User" (
      id TEXT PRIMARY KEY DEFAULT '',
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'USER',
      banned BOOLEAN DEFAULT false,
      banReason TEXT,
      "profilePicture" TEXT,
      "backgroundImage" TEXT,
      "createdAt" TIMESTAMPTZ DEFAULT now(),
      "ipAddress" TEXT,
      "termsAcceptedAt" TIMESTAMPTZ,
      age INT,
      gender TEXT,
      country TEXT
    );

    CREATE TABLE IF NOT EXISTS "Tutorial" (
      id TEXT PRIMARY KEY DEFAULT '',
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty INT NOT NULL,
      "timeMinutes" INT NOT NULL,
      "coverImage" TEXT,
      "viewCount" INT DEFAULT 0,
      published BOOLEAN DEFAULT false,
      locked BOOLEAN DEFAULT false,
      "lockContent" BOOLEAN DEFAULT false,
      price INT DEFAULT 0,
      password TEXT,
      "linkOnly" BOOLEAN DEFAULT false,
      "customToolConfigs" JSONB,
      "authorId" TEXT REFERENCES "User"(id),
      "createdAt" TIMESTAMPTZ DEFAULT now(),
      "updatedAt" TIMESTAMPTZ DEFAULT now(),
      "editCount" INT DEFAULT 0,
      "lastEditAt" TIMESTAMPTZ,
      "isFlagged" BOOLEAN DEFAULT false,
      "flagReason" TEXT
    );

    CREATE TABLE IF NOT EXISTS "TutorialVersion" (
      id TEXT PRIMARY KEY DEFAULT '',
      "tutorialId" TEXT REFERENCES "Tutorial"(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty INT NOT NULL,
      "timeMinutes" INT NOT NULL,
      "coverImage" TEXT,
      published BOOLEAN DEFAULT false,
      locked BOOLEAN DEFAULT false,
      "lockContent" BOOLEAN DEFAULT false,
      price INT DEFAULT 0,
      "linkOnly" BOOLEAN DEFAULT false,
      "customToolConfigs" JSONB,
      steps JSONB NOT NULL,
      tools JSONB NOT NULL,
      "editedAt" TIMESTAMPTZ DEFAULT now(),
      "editReason" TEXT,
      "isFlagged" BOOLEAN DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS "Tool" (
      id TEXT PRIMARY KEY DEFAULT '',
      name TEXT NOT NULL,
      quantity TEXT,
      size TEXT,
      kind TEXT,
      notes TEXT,
      "tutorialId" TEXT REFERENCES "Tutorial"(id) ON DELETE CASCADE,
      category TEXT DEFAULT 'DIY'
    );

    CREATE TABLE IF NOT EXISTS "Step" (
      id TEXT PRIMARY KEY DEFAULT '',
      "order" INT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      "imageUrl" TEXT,
      "tutorialId" TEXT REFERENCES "Tutorial"(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "Comment" (
      id TEXT PRIMARY KEY DEFAULT '',
      content TEXT NOT NULL,
      "likeCount" INT DEFAULT 0,
      "likedBy" TEXT DEFAULT '',
      "authorId" TEXT REFERENCES "User"(id),
      "tutorialId" TEXT REFERENCES "Tutorial"(id) ON DELETE CASCADE,
      "parentId" TEXT,
      "createdAt" TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS "Purchase" (
      id TEXT PRIMARY KEY DEFAULT '',
      "userId" TEXT REFERENCES "User"(id),
      "tutorialId" TEXT REFERENCES "Tutorial"(id),
      "createdAt" TIMESTAMPTZ DEFAULT now(),
      UNIQUE("userId", "tutorialId")
    );

    CREATE TABLE IF NOT EXISTS "SystemLog" (
      id TEXT PRIMARY KEY DEFAULT '',
      action TEXT NOT NULL,
      target TEXT,
      "actorId" TEXT REFERENCES "User"(id),
      "ipAddress" TEXT,
      "createdAt" TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS "Report" (
      id TEXT PRIMARY KEY DEFAULT '',
      type TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      "reporterId" TEXT REFERENCES "User"(id),
      "reportedUserId" TEXT REFERENCES "User"(id),
      "tutorialId" TEXT REFERENCES "Tutorial"(id),
      "adminNote" TEXT,
      "resolvedAt" TIMESTAMPTZ,
      "createdAt" TIMESTAMPTZ DEFAULT now()
    );
  `;

  await client.query(tables);
  console.log('Tables created!');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const { v4: uuidv4 } = require('uuid');

  try {
    await client.query(`
      INSERT INTO "User" (id, email, password, name, role, "createdAt")
      VALUES ($1, $2, $3, $4, $5, now())
      ON CONFLICT (email) DO UPDATE SET role = 'ADMIN', password = $3
    `, [uuidv4(), 'admin@stephud.com', hashedPassword, 'Admin', 'ADMIN']);
    console.log('Admin account created: admin@stephud.com / admin123');
  } catch (e) {
    console.error('Error creating admin:', e.message);
  }

  await client.end();
  console.log('Done!');
}

main().catch(e => { console.error(e); process.exit(1); });
