import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    // Get all non-admin users for analytics
    const users = await prisma.user.findMany({
      where: { role: "USER" },
      select: { age: true, gender: true, country: true, createdAt: true },
    });

    // Total users
    const totalUsers = users.length;

    // Age distribution
    const ageGroups = {
      "Under 18": 0,
      "18-24": 0,
      "25-34": 0,
      "35-44": 0,
      "45-54": 0,
      "55-64": 0,
      "65+": 0,
      "Unknown": 0,
    };
    users.forEach((u) => {
      if (u.age === null || u.age === undefined) {
        ageGroups["Unknown"]++;
      } else if (u.age < 18) {
        ageGroups["Under 18"]++;
      } else if (u.age <= 24) {
        ageGroups["18-24"]++;
      } else if (u.age <= 34) {
        ageGroups["25-34"]++;
      } else if (u.age <= 44) {
        ageGroups["35-44"]++;
      } else if (u.age <= 54) {
        ageGroups["45-54"]++;
      } else if (u.age <= 64) {
        ageGroups["55-64"]++;
      } else {
        ageGroups["65+"]++;
      }
    });

    // Gender distribution
    const genderCounts: Record<string, number> = {
      Male: 0,
      Female: 0,
      "Non-binary": 0,
      Other: 0,
      Unknown: 0,
    };
    users.forEach((u) => {
      if (!u.gender) {
        genderCounts["Unknown"]++;
      } else {
        const normalized = u.gender.trim();
        if (normalized === "Male" || normalized === "male" || normalized === "M") {
          genderCounts["Male"]++;
        } else if (normalized === "Female" || normalized === "female" || normalized === "F") {
          genderCounts["Female"]++;
        } else if (normalized === "Non-binary" || normalized === "non-binary" || normalized === "Nonbinary") {
          genderCounts["Non-binary"]++;
        } else {
          genderCounts["Other"]++;
        }
      }
    });

    // Country distribution
    const countryCounts: Record<string, number> = {};
    users.forEach((u) => {
      if (u.country) {
        countryCounts[u.country] = (countryCounts[u.country] || 0) + 1;
      } else {
        countryCounts["Unknown"] = (countryCounts["Unknown"] || 0) + 1;
      }
    });

    // Sort countries by count
    const topCountries = Object.entries(countryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([country, count]) => ({ country, count, percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0 }));

    // User growth over time (last 12 months)
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const monthlySignups: { month: string; count: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const monthLabel = monthDate.toLocaleString("default", { month: "short", year: "numeric" });
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
      const count = users.filter((u) => {
        const created = new Date(u.createdAt);
        return created >= monthStart && created < monthEnd;
      }).length;
      monthlySignups.push({ month: monthLabel, count });
    }

    return NextResponse.json({
      totalUsers,
      ageDistribution: ageGroups,
      genderDistribution: genderCounts,
      topCountries,
      monthlySignups,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
