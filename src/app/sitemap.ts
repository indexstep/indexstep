import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tutorials = await prisma.tutorial.findMany({
    where: { published: true },
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const tutorialUrls: MetadataRoute.Sitemap = tutorials.map((t) => ({
    url: `${BASE_URL}/tutorial/${t.id}`,
    lastModified: t.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    ...tutorialUrls,
  ];
}
