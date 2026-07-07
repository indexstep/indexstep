"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useTheme } from "@/contexts/ThemeContext";

const CATEGORIES = ["All", "Gaming", "Tech", "DIY", "Cars", "Music", "Art", "Other"];
const DIFFICULTY = ["", "Beginner", "Intermediate", "Advanced"];

function TutorialCard({ tutorial }: { tutorial: any }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isWin11 = theme === "win11";

  const cardBg = isWin11 ? "#ffffff" : isDark ? "var(--card-bg)" : "#ffffff";
  const border = isWin11 ? "rgba(0,0,0,0.08)" : "var(--border)";
  const text = isWin11 ? "#1a1a1a" : "var(--text)";
  const textMuted = isWin11 ? "#666666" : "var(--text-muted)";

  return (
    <Link href={`/tutorial/${tutorial.id}`}>
      <div
        className="rounded-xl border overflow-hidden cursor-pointer transition-all hover:scale-[1.01]"
        style={{
          backgroundColor: cardBg,
          borderColor: border,
          boxShadow: isWin11 ? "0 2px 8px rgba(0,0,0,0.08)" : undefined,
        }}
      >
        {tutorial.coverImage && (
          <img
            src={tutorial.coverImage}
            alt={tutorial.title}
            className="w-full h-40 object-cover"
          />
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: isWin11 ? "#f3f3f3" : "var(--bg-highlight)",
                color: textMuted,
              }}
            >
              {tutorial.category}
            </span>
            <span className="text-xs" style={{ color: textMuted }}>
              {DIFFICULTY[tutorial.difficulty] || "Beginner"}
            </span>
            <span className="text-xs" style={{ color: textMuted }}>
              {tutorial.timeMinutes} min
            </span>
          </div>
          <h3 className="font-semibold mb-1 line-clamp-2" style={{ color: text }}>
            {tutorial.title}
          </h3>
          <p className="text-sm line-clamp-2" style={{ color: textMuted }}>
            {tutorial.description}
          </p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: border }}>
            <span className="text-xs" style={{ color: textMuted }}>
              by {tutorial.author?.name || "stephud"}
            </span>
            <div className="flex items-center gap-3 text-xs" style={{ color: textMuted }}>
              <span>👁 {tutorial.viewCount || 0}</span>
              <span>❤️ {tutorial.likeCount || 0}</span>
              <span>📝 {tutorial._count?.comments || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function TutorialsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isWin11 = theme === "win11";

  const [tutorials, setTutorials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const bg = isWin11 ? "#f3f3f3" : isDark ? "var(--bg)" : "#f9fafb";
  const text = isWin11 ? "#1a1a1a" : "var(--text)";
  const textMuted = isWin11 ? "#666666" : "var(--text-muted)";
  const border = isWin11 ? "rgba(0,0,0,0.08)" : "var(--border)";

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "12",
      sort: "newest",
    });
    if (search) params.set("search", search);
    if (category !== "All") params.set("category", category);

    fetch(`/api/tutorials?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setTutorials(data.tutorials || []);
        setTotalPages(data.pagination?.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [search, category, page]);

  return (
    <div style={{ backgroundColor: bg, minHeight: "100vh" }}>
      <Navbar />

      {/* ── WIN11 TOOLBAR ── */}
      {isWin11 && (
        <div
          className="flex items-center gap-1 px-3 py-1.5 text-xs"
          style={{
            backgroundColor: "#ffffff",
            borderBottom: `1px solid ${border}`,
            color: textMuted,
          }}
        >
          <span>Computer</span>
          <span>›</span>
          <span style={{ color: text }}>Guides</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: text }}>Guides</h1>
            <p className="text-sm mt-1" style={{ color: textMuted }}>
              Step-by-step tutorials for building specs, setups, and more.
            </p>
          </div>
          <Link
            href="/create"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: "#0078d4" }}
          >
            + New Guide
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search guides..."
            className="flex-1 px-4 py-2 rounded-lg border text-sm"
            style={{
              backgroundColor: isWin11 ? "#ffffff" : isDark ? "var(--bg)" : "#ffffff",
              borderColor: border,
              color: text,
            }}
          />
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: category === cat
                    ? (isWin11 ? "#0078d4" : "var(--accent)")
                    : (isWin11 ? "#f3f3f3" : "var(--bg-highlight)"),
                  color: category === cat ? "#ffffff" : textMuted,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border overflow-hidden">
                <div className="h-40 bg-[var(--bg-highlight)] animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-[var(--bg-highlight)] rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-[var(--bg-highlight)] rounded animate-pulse w-full" />
                  <div className="h-3 bg-[var(--bg-highlight)] rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : tutorials.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-medium mb-2" style={{ color: text }}>No guides found</p>
            <p className="text-sm" style={{ color: textMuted }}>
              {search ? "Try a different search term" : "Be the first to create a guide!"}
            </p>
            <Link
              href="/create"
              className="inline-block mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: isWin11 ? "#0078d4" : "var(--accent)" }}
            >
              Create First Guide
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tutorials.map((t) => (
                <TutorialCard key={t.id} tutorial={t} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-sm"
                  style={{
                    backgroundColor: isWin11 ? "#f3f3f3" : "var(--bg-highlight)",
                    color: text,
                    opacity: page === 1 ? 0.5 : 1,
                  }}
                >
                  ‹ Prev
                </button>
                <span className="px-3 py-1.5 text-sm" style={{ color: textMuted }}>
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm"
                  style={{
                    backgroundColor: isWin11 ? "#f3f3f3" : "var(--bg-highlight)",
                    color: text,
                    opacity: page === totalPages ? 0.5 : 1,
                  }}
                >
                  Next ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
