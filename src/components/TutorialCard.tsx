"use client";

import Link from "next/link";
import { Clock, User, LayoutGrid, Lock, Calendar } from "lucide-react";

interface TutorialCardProps {
  tutorial: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: number;
    timeMinutes: number;
    coverImage: string | null;
    locked: boolean;
    lockContent: boolean;
    price: number;
    password?: string | null;
    author: { name: string };
    _count: { steps: number };
    createdAt: string;
  };
  purchased?: boolean;
// NOTE: purchased prop is deprecated — kept for compat but no longer used (unlock is ad-supported now)
};

const difficultyColors = {
  1: "bg-[#aad94c]/20 text-[#aad94c]",
  2: "bg-[#aad94c]/20 text-[#aad94c]",
  3: "bg-[#e6c866]/20 text-[#e6c866]",
  4: "bg-[var(--accent)]/20 text-[var(--accent)]",
  5: "bg-[var(--red)]/20 text-[var(--red)]",
};

const categoryColors: Record<string, string> = {
  DIY: "bg-[var(--accent)]/20 text-[var(--accent)]",
  Cooking: "bg-[var(--red)]/20 text-[var(--red)]",
  Tech: "bg-[var(--cyan)]/20 text-[var(--cyan)]",
  Crafts: "bg-[var(--purple)]/20 text-[var(--purple)]",
  "Home Improvement": "bg-[#e6c866]/20 text-[#e6c866]",
  Gardening: "bg-[#aad94c]/20 text-[#aad94c]",
  Electronics: "bg-[var(--cyan)]/20 text-[var(--cyan)]",
  Woodworking: "bg-[#e6c866]/20 text-[#e6c866]",
  Sewing: "bg-[var(--purple)]/20 text-[var(--purple)]",
  Other: "bg-[#8b8e96]/20 text-[var(--text-secondary)]",
};

export default function TutorialCard({ tutorial }: TutorialCardProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Link href={`/tutorial/${tutorial.id}`}>
      <article className="group bg-[var(--bg-secondary)] rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all duration-200 hover:shadow-lg hover:shadow-[var(--accent)]/20 hover:-translate-y-1">
        <div className="aspect-video bg-[var(--bg-highlight)] relative overflow-hidden">
          {tutorial.coverImage ? (
            <img
              src={tutorial.coverImage}
              alt={tutorial.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <img
              src="/images/logo.png"
              alt=""
              className="w-full h-full object-contain opacity-30"
            />
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[tutorial.difficulty as keyof typeof difficultyColors]}`}>
              Difficulty {tutorial.difficulty}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium uppercase tracking-wider ${categoryColors[tutorial.category] || categoryColors.Other}`}>
              {tutorial.category}
            </span>
            {tutorial.password && (
              <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <Lock className="w-3 h-3" />Private
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-2">
            {tutorial.title}
          </h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2">{tutorial.description}</p>

          <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{tutorial.author.name}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />
                {new Date(tutorial.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatTime(tutorial.timeMinutes)}</span>
              <span>{tutorial._count.steps} steps</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

