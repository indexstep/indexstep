import { NextResponse } from 'next/server';
import { Client } from 'pg';
import bcrypt from 'bcryptjs';

export async function POST() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 });
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();

    // Create all tables
    await client.query(`
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
    `);

    await client.query(`
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
    `);

    await client.query(`
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
    `);

    await client.query(`
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
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "Step" (
        id TEXT PRIMARY KEY DEFAULT '',
        "order" INT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        "imageUrl" TEXT,
        "tutorialId" TEXT REFERENCES "Tutorial"(id) ON DELETE CASCADE
      );
    `);

    await client.query(`
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
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "Purchase" (
        id TEXT PRIMARY KEY DEFAULT '',
        "userId" TEXT REFERENCES "User"(id),
        "tutorialId" TEXT REFERENCES "Tutorial"(id),
        "createdAt" TIMESTAMPTZ DEFAULT now(),
        UNIQUE("userId", "tutorialId")
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "SystemLog" (
        id TEXT PRIMARY KEY DEFAULT '',
        action TEXT NOT NULL,
        target TEXT,
        "actorId" TEXT REFERENCES "User"(id),
        "ipAddress" TEXT,
        "createdAt" TIMESTAMPTZ DEFAULT now()
      );
    `);

    await client.query(`
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
    `);

    // Create admin account
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const { v4: uuidv4 } = require('uuid');

    await client.query(`
      INSERT INTO "User" (id, email, password, name, role, "createdAt")
      VALUES ($1, $2, $3, $4, $5, now())
      ON CONFLICT (email) DO UPDATE SET role = 'ADMIN', password = $3
    `, [uuidv4(), 'admin@stephud.com', hashedPassword, 'Admin', 'ADMIN']);

    await client.end();
    return NextResponse.json({ success: true, message: 'Tables created and admin account ready' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
