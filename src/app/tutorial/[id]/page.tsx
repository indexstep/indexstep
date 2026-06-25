import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import TutorialView from "./TutorialView";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tutorial = await prisma.tutorial.findUnique({
    where: { id },
    select: {
      title: true,
      description: true,
      coverImage: true,
      category: true,
      author: { select: { name: true } },
      customToolConfigs: true,
    },
  });

  if (!tutorial) return { title: "Tutorial Not Found" };

  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const url = `${baseUrl}/tutorial/${id}`;

  return {
    title: `${tutorial.title} | stephud`,
    description: tutorial.description,
    authors: [{ name: tutorial.author.name }],
    openGraph: {
      title: tutorial.title,
      description: tutorial.description,
      url,
      type: "article",
      images: tutorial.coverImage ? [{ url: tutorial.coverImage, width: 1280, height: 720 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: tutorial.title,
      description: tutorial.description,
      images: tutorial.coverImage ? [tutorial.coverImage] : [],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function TutorialPage({ params }: Props) {
  const { id } = await params;

  let tutorial;
  try {
    tutorial = await prisma.tutorial.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        tools: true,
        steps: { orderBy: { order: "asc" } },
      },
    });
  } catch (e: any) {
    return <div className="min-h-screen flex items-center justify-center text-white">Database error: {e.message}</div>;
  }

  if (!tutorial) notFound();
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      tools: true,
      steps: { orderBy: { order: "asc" } },
    },
  });

  if (!tutorial) notFound();

  // Get current user
  const user = await getCurrentUser();
  const isAdminOrAuthor = user && (user.role === "ADMIN" || user.role === "MODERATOR" || user.id === tutorial.authorId);

  // Check password protection — non-admins/authors get minimal data
  const tutorialPassword = await prisma.$queryRaw<{ password: string | null; linkOnly: boolean }[]>`SELECT password, "linkOnly" FROM tutorial WHERE id = ${id}`;
  const hasPassword = tutorialPassword[0]?.password || null;
  const hasLinkOnly = tutorialPassword[0]?.linkOnly || false;
  const requiresPassword = !!hasPassword && !isAdminOrAuthor;

  // Check if tutorial is accessible — "linkOnly" means accessible via direct link even if not published
  const isAccessible = tutorial.published || hasLinkOnly || isAdminOrAuthor;
  if (!isAccessible) notFound();

  // Increment view count (fire and forget) — only for unlocked tutorials
  if (!requiresPassword) {
    prisma.tutorial.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});
  }

  // Build tutorialData — strip steps/tools if password-protected
  const tutorialData = {
    ...tutorial,
    linkOnly: hasLinkOnly,
    viewCount: tutorial.viewCount + 1,
    requiresPassword,
    isUnlocked: !requiresPassword,
    steps: requiresPassword ? [] : tutorial.steps,
    tools: requiresPassword ? [] : tutorial.tools,
  };

  // Build HowTo JSON-LD schema (only for unlocked tutorials)
  const howToSchema = !requiresPassword ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: tutorial.title,
    description: tutorial.description,
    image: tutorial.coverImage ? [tutorial.coverImage] : [],
    author: {
      "@type": "Person",
      name: tutorial.author.name,
    },
    datePublished: tutorial.createdAt.toISOString(),
    dateModified: tutorial.updatedAt.toISOString(),
    totalTime: `PT${tutorial.timeMinutes}M`,
    category: tutorial.category,
    keywords: `${tutorial.category}, ${tutorial.title}, how to, guide, tutorial`,
    step: tutorial.steps.map((step) => ({
      "@type": "HowToStep",
      name: step.title,
      text: step.content,
      ...(step.imageUrl ? { image: step.imageUrl } : {}),
    })),
    supply: tutorial.tools.map((tool) => ({
      "@type": "HowToSupply",
      name: tool.name,
      ...(tool.quantity ? { quantity: tool.quantity } : {}),
      ...(tool.size ? { size: tool.size } : {}),
      ...(tool.kind ? { kind: tool.kind } : {}),
      ...(tool.notes ? { notes: tool.notes } : {}),
    })),
  } : null;

  return (
    <>
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      <TutorialView initialTutorial={tutorialData} />
    </>
  );
}
