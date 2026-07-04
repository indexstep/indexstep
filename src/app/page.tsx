"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Filter, Plus, GitBranch } from "lucide-react";
import TutorialCard from "@/components/TutorialCard";
import Button from "@/components/Button";
import { CATEGORIES } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

interface Tutorial {
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
  published: boolean;
  author: { name: string };
  _count: { steps: number };
  createdAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  useEffect(() => { fetchTutorials(); }, [category, difficulty, sortBy]);

  const fetchTutorials = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (difficulty) params.set("difficulty", difficulty);
      params.set("sort", sortBy);
      const res = await fetch(`/api/tutorials?${params}`);
      if (res.ok) {
        const data = await res.json();
        let list = data.tutorials;
        if (sortBy === "oldest") list = list.reverse();
        setTutorials(list);
      }
    } catch (error) {
      console.error("Failed to fetch tutorials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <img src="/images/logo.png" alt="stephud" className="w-40 h-40 object-contain mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4 leading-tight">
              Step-by-Step Guides,{" "}
              <span className="text-[var(--accent)]">Beautifully Organized</span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)] mb-6 max-w-xl mx-auto leading-relaxed">
              Create and follow visual tutorials with progress tracking, tool lists, and clear step-by-step instructions.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <Link href="/specs">
                <Button variant="secondary" size="sm" className="gap-2">
                  <GitBranch className="w-4 h-4" /> Browse Specs
                </Button>
              </Link>
              <Link href="/specs">
                <Button variant="ghost" size="sm" className="gap-2">
                  <GitBranch className="w-4 h-4" /> Create Spec
                </Button>
              </Link>
            </div>
            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search guides..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent shadow-sm"
                />
              </div>
              <Button type="submit" className="px-6">Search</Button>
            </form>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer">
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer">
              <option value="">All Difficulties</option>
              <option value="1">Easy</option><option value="2">Medium</option><option value="3">Hard</option><option value="4">Expert</option><option value="5">Master</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer">
              <option value="popular">🔥 Most Popular</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            {(category || difficulty || search) && (
              <button onClick={() => { setCategory(""); setDifficulty(""); setSearch(""); fetchTutorials(); }} className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium underline-offset-auto hover:underline">
                Clear all
              </button>
            )}
            <div className="ml-auto flex items-center gap-2">
              <div className="flex bg-[var(--bg)] border border-[var(--border)] rounded-lg overflow-hidden">
                <button onClick={() => setViewMode("grid")} className={`px-3 py-2 text-sm transition-colors ${viewMode === "grid" ? "bg-[var(--accent)] text-[#0f0f14]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`} title="Grid view">▦</button>
                <button onClick={() => setViewMode("list")} className={`px-3 py-2 text-sm transition-colors ${viewMode === "list" ? "bg-[var(--accent)] text-[#0f0f14]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`} title="List view">☰</button>
              </div>
              {user && (
              <div className="flex items-center gap-2">
                <Link href="/create"><Button size="sm"><Plus className="w-4 h-4 mr-1" />Create Guide</Button></Link>
                <Link href="/specs"><Button size="sm" variant="secondary"><GitBranch className="w-4 h-4 mr-1" />Create Spec</Button></Link>
              </div>
            )}
            </div>
          </div>
        </div>
      </section>

      {/* Tutorial Grid/List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {tutorials.length > 0 && !loading && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--text)]">
              {category ? <span>{category} <span className="text-[var(--text-muted)] font-normal">— {tutorials.length} {tutorials.length === 1 ? "guide" : "guides"}</span></span> : <span>All Guides <span className="text-[var(--text-muted)] font-normal">— {tutorials.length} {tutorials.length === 1 ? "guide" : "guides"}</span></span>}
            </h2>
          </div>
        )}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <img src="/images/logo.png" alt="" className="w-24 h-24 object-contain animate-pulse" />
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        ) : tutorials.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center">
              <Search className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text)] mb-2">No guides found</h3>
            <p className="text-[var(--text-secondary)] mb-8 max-w-sm mx-auto">{search || category || difficulty ? "Try adjusting your filters or search terms." : "Be the first to create a guide!"}</p>
            <div className="flex items-center justify-center gap-3">
              {(search || category || difficulty) && (
                <Button variant="secondary" onClick={() => { setCategory(""); setDifficulty(""); setSearch(""); fetchTutorials(); }}>Clear Filters</Button>
              )}
              <Link href="/create"><Button>Create a Guide</Button></Link>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
            {tutorials.map((tutorial) => <TutorialCard key={tutorial.id} tutorial={tutorial} />)}
          </div>
        ) : (
          <div className="space-y-4 stagger-children">
            {tutorials.map((tutorial) => (
              <Link key={tutorial.id} href={`/tutorial/${tutorial.id}`}>
                <div className="flex gap-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/50 p-4 transition-all hover:-translate-y-0.5">
                  <div className="w-48 h-28 bg-[var(--bg-highlight)] rounded-lg overflow-hidden flex-shrink-0">
                    {tutorial.coverImage && (
                      <img
                        src={tutorial.coverImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-[var(--accent)] uppercase">{tutorial.category}</span>
                      <span className="text-xs text-[var(--text-muted)]">• Difficulty {tutorial.difficulty}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--text)] hover:text-[var(--accent)] transition-colors truncate">{tutorial.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mt-1">{tutorial.description}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      <Link href={`/user/${tutorial.author.id}`} className="hover:underline" style={{ color: "var(--accent)" }}>
                        {tutorial.author.name}
                      </Link>
                      <span>·</span>
                      <span>{tutorial._count.steps} steps</span>
                      <span>·</span>
                      <span>{tutorial.timeMinutes < 60 ? `${tutorial.timeMinutes}m` : `${Math.floor(tutorial.timeMinutes / 60)}h`}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
