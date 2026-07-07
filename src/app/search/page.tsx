"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, BookOpen, GitBranch, LayoutGrid } from "lucide-react";
import TutorialCard from "@/components/TutorialCard";
import Button from "@/components/Button";
import { CATEGORIES } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

interface TutorialListItem {
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
  author: { id: string; name: string };
  _count: { steps: number };
  createdAt: string;
}

interface SpecListItem {
  id: string;
  name: string;
  details: string;
  color: string;
  icon: string | null;
  imageUrl: string | null;
  viewCount: number;
  likeCount: number;
  author: { id: string; name: string };
  _count: { children: number };
  createdAt: string;
}

type TabType = "all" | "guides" | "specs";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialDifficulty = searchParams.get("difficulty") || "";
  const initialTimeMin = searchParams.get("timeMin") || "";
  const initialTimeMax = searchParams.get("timeMax") || "";
  const initialSort = searchParams.get("sort") || "newest";
  const initialPage = parseInt(searchParams.get("page") || "1");
  const initialTab = (searchParams.get("tab") as TabType) || "all";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [timeMin, setTimeMin] = useState(initialTimeMin);
  const [timeMax, setTimeMax] = useState(initialTimeMax);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);
  const [tab, setTab] = useState<TabType>(initialTab);

  const [tutorials, setTutorials] = useState<TutorialListItem[]>([]);
  const [specs, setSpecs] = useState<SpecListItem[]>([]);
  const [totalTutorials, setTotalTutorials] = useState(0);
  const [totalSpecs, setTotalSpecs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const LIMIT = 12;

  useEffect(() => {
    fetchResults();
  }, [page, tab]);

  const buildParams = (extraPage?: number) => {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (category) params.set("category", category);
    if (difficulty) params.set("difficulty", difficulty);
    if (timeMin) params.set("timeMin", timeMin);
    if (timeMax) params.set("timeMax", timeMax);
    if (sort) params.set("sort", sort);
    if (tab !== "all") params.set("tab", tab);
    const p = extraPage ?? page;
    if (p > 1) params.set("page", String(p));
    return params.toString();
  };

  const fetchResults = async (p = page) => {
    setLoading(true);
    try {
      if (tab === "all" || tab === "guides") {
        const params = new URLSearchParams();
        if (query) params.set("search", query);
        if (category) params.set("category", category);
        if (difficulty) params.set("difficulty", difficulty);
        if (timeMin) params.set("timeMin", timeMin);
        if (timeMax) params.set("timeMax", timeMax);
        if (sort) params.set("sort", sort);
        params.set("flat", "true");
        params.set("limit", String(LIMIT));
        if (p > 1) params.set("page", String(p));
        const res = await fetch(`/api/tutorials?${params}`);
        if (res.ok) {
          const data = await res.json();
          setTutorials(data.tutorials || []);
          setTotalTutorials(data.pagination?.total || 0);
          setTotalPages(data.pagination?.pages || 0);
        }
      } else {
        setTutorials([]);
        setTotalTutorials(0);
        setTotalPages(0);
      }

      if (tab === "all" || tab === "specs") {
        const params = new URLSearchParams();
        if (query) params.set("search", query);
        if (sort === "popular") params.set("sort", "popular");
        params.set("flat", "true");
        params.set("limit", String(LIMIT));
        if (p > 1) params.set("page", String(p));
        const res = await fetch(`/api/specs?${params}`);
        if (res.ok) {
          const data = await res.json();
          setSpecs(data.specs || []);
          setTotalSpecs(data.specs?.length || 0);
        }
      } else {
        setSpecs([]);
        setTotalSpecs(0);
      }

      setPage(p);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    router.push(`/search?${buildParams(1)}`);
    fetchResults(1);
  };

  const handleFilterChange = () => {
    setPage(1);
    router.push(`/search?${buildParams(1)}`);
    fetchResults(1);
  };

  const handleTabChange = (newTab: TabType) => {
    setTab(newTab);
    setPage(1);
    const params = buildParams(1).replace(/tab=[^&]*&?/g, "").replace(/page=[^&]*&?/g, "");
    const base = params ? `?${params}&tab=${newTab}` : `?tab=${newTab}`;
    router.push(`/search${base}`);
    fetchResults(1);
  };

  const clearFilters = () => {
    setCategory(""); setDifficulty(""); setTimeMin(""); setTimeMax(""); setSort("newest");
    router.push(`/search?q=${encodeURIComponent(query)}`);
    fetchResults(1);
  };

  const hasActiveFilters = category || difficulty || timeMin || timeMax || sort !== "newest";

  const Filters = () => (
    <aside className="space-y-6">
      {/* Category — only show for guides tab */}
      {tab !== "specs" && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)] mb-3 uppercase tracking-wider">Category</h3>
          <div className="space-y-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(category === cat ? "" : cat); handleFilterChange(); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  category === cat
                    ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-highlight)] hover:text-[var(--text)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Difficulty — only show for guides tab */}
      {tab !== "specs" && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)] mb-3 uppercase tracking-wider">Difficulty</h3>
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map((d) => {
              const labels = ["", "Easy", "Medium", "Hard", "Expert", "Master"];
              const colors = ["", "text-[#aad94c]", "text-[#aad94c]", "text-[#e6c866]", "text-[var(--accent)]", "text-[var(--red)]"];
              return (
                <button
                  key={d}
                  onClick={() => { setDifficulty(difficulty === String(d) ? "" : String(d)); handleFilterChange(); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    difficulty === String(d)
                      ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-highlight)] hover:text-[var(--text)]"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${colors[d]}`} />
                  {labels[d]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Time — only show for guides tab */}
      {tab !== "specs" && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)] mb-3 uppercase tracking-wider">Time</h3>
          <div className="space-y-2">
            {[
              { label: "Under 15 min", timeMin: "", timeMax: "15" },
              { label: "15–30 min", timeMin: "15", timeMax: "30" },
              { label: "30–60 min", timeMin: "30", timeMax: "60" },
              { label: "1–2 hours", timeMin: "60", timeMax: "120" },
              { label: "2+ hours", timeMin: "120", timeMax: "" },
            ].map(({ label, timeMin: tm, timeMax: tx }) => {
              const active = timeMin === tm && timeMax === tx;
              return (
                <button
                  key={label}
                  onClick={() => {
                    setTimeMin(tm); setTimeMax(tx);
                    handleFilterChange();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-highlight)] hover:text-[var(--text)]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sort */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text)] mb-3 uppercase tracking-wider">Sort By</h3>
        <div className="space-y-1">
          {[
            { value: "newest", label: "Newest First" },
            { value: "oldest", label: "Oldest First" },
            { value: "popular", label: "Most Popular" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setSort(value); handleFilterChange(); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                sort === value
                  ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-highlight)] hover:text-[var(--text)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button onClick={clearFilters} className="w-full text-sm text-[var(--red)] hover:text-[#ff6b7a] py-2 text-left transition-colors">
          Clear all filters
        </button>
      )}
    </aside>
  );

  const SpecCard = ({ spec }: { spec: SpecListItem }) => (
    <Link href={`/specs/${spec.id}`}>
      <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/50 p-4 transition-all hover:-translate-y-0.5 cursor-pointer">
        {spec.imageUrl && (
          <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-[var(--bg-highlight)]">
            <img src={spec.imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: spec.color || "#ff9940" }}
          />
          <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">Spec</span>
          {spec.icon && <span className="text-sm">{spec.icon}</span>}
        </div>
        <h3 className="text-base font-semibold text-[var(--text)] hover:text-[var(--accent)] transition-colors line-clamp-2 mb-1">
          {spec.name}
        </h3>
        {spec.details && (
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2">{spec.details}</p>
        )}
        <div className="flex items-center gap-x-3 gap-y-1 text-xs" style={{ color: "var(--text-muted)" }}>
          <span>{spec.author.name}</span>
          <span>·</span>
          <span>{spec._count.children} children</span>
          <span>·</span>
          <span>{spec.viewCount} views</span>
        </div>
      </div>
    </Link>
  );

  const totalResults = (tab === "all" ? totalTutorials + totalSpecs : tab === "guides" ? totalTutorials : totalSpecs);
  const showGuides = tab === "all" || tab === "guides";
  const showSpecs = tab === "all" || tab === "specs";

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Search Header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border)] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search guides and specs..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                autoFocus
              />
            </div>
            <Button type="submit">Search</Button>
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`lg:hidden p-3 rounded-lg border transition-colors ${
                filtersOpen ? "bg-[var(--accent)] border-[var(--accent)] text-[#0f0f14]" : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-secondary)]"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </form>

          {/* Tab Bar */}
          <div className="flex items-center gap-1 mt-3 border-t border-[var(--border)] pt-3">
            <button
              onClick={() => handleTabChange("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "all"
                  ? "bg-[var(--accent)] text-[#0f0f14]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-highlight)] hover:text-[var(--text)]"
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> All
              {totalTutorials + totalSpecs > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === "all" ? "bg-[#0f0f14]/20 text-[#0f0f14]" : "bg-[var(--bg-highlight)] text-[var(--text-muted)]"
                }`}>
                  {totalTutorials + totalSpecs}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("guides")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "guides"
                  ? "bg-[var(--accent)] text-[#0f0f14]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-highlight)] hover:text-[var(--text)]"
              }`}
            >
              <BookOpen className="w-4 h-4" /> Guides
              {totalTutorials > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === "guides" ? "bg-[#0f0f14]/20 text-[#0f0f14]" : "bg-[var(--bg-highlight)] text-[var(--text-muted)]"
                }`}>
                  {totalTutorials}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("specs")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "specs"
                  ? "bg-[var(--accent)] text-[#0f0f14]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-highlight)] hover:text-[var(--text)]"
              }`}
            >
              <GitBranch className="w-4 h-4" /> Specs
              {totalSpecs > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === "specs" ? "bg-[#0f0f14]/20 text-[#0f0f14]" : "bg-[var(--bg-highlight)] text-[var(--text-muted)]"
                }`}>
                  {totalSpecs}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wider">Filters</h2>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-[var(--red)] hover:text-[#ff6b7a] font-medium transition-colors">Clear all</button>
                )}
              </div>
              <Filters />
            </div>
          </aside>

          {/* Mobile Filters Drawer */}
          {filtersOpen && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/70" onClick={() => setFiltersOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--bg-secondary)] p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[var(--text)]">Filters</h2>
                  <button onClick={() => setFiltersOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text)]">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <Filters />
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results meta */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[var(--text-secondary)]">
                {loading ? (
                  <span className="text-[var(--text-muted)]">Searching...</span>
                ) : (
                  <>
                    <span className="text-[var(--text)] font-semibold text-base">{totalResults}</span>
                    <span className="ml-1">{totalResults === 1 ? "result" : "results"}{query && <> for <span className="text-[var(--text)] font-medium">&ldquo;{query}&rdquo;</span></>}</span>
                    {hasActiveFilters && <span className="ml-1 text-[var(--text-muted)]">(filtered)</span>}
                  </>
                )}
              </p>
              <button
                type="button"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-highlight)] transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />Filters
                {hasActiveFilters && <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-[#0f0f14] text-xs flex items-center justify-center">!</span>}
              </button>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden animate-pulse">
                    <div className="aspect-video bg-[var(--bg-highlight)] flex items-center justify-center">
                      <img src="/images/logo.png" alt="" className="w-20 h-20 object-contain opacity-30" />
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-[var(--bg-highlight)] rounded w-1/3" />
                      <div className="h-5 bg-[var(--bg-highlight)] rounded" />
                      <div className="h-3 bg-[var(--bg-highlight)] rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : totalResults === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center">
                  <Search className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">No results found</h3>
                <p className="text-[var(--text-secondary)] mb-8 max-w-sm mx-auto">
                  {query ? `No results for "${query}". Try different keywords or filters.` : "Adjust your filters to find what you're looking for."}
                </p>
                {hasActiveFilters && (
                  <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>
                )}
              </div>
            ) : (
              <>
                {/* Guides Section */}
                {showGuides && tutorials.length > 0 && (
                  <div className="mb-8">
                    {tab === "all" && (
                      <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[var(--accent)]" /> Guides
                        <span className="text-sm font-normal text-[var(--text-muted)]">({totalTutorials})</span>
                      </h2>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {(tab === "guides" ? tutorials : tutorials.slice(0, 3)).map((tutorial) => (
                        <TutorialCard key={tutorial.id} tutorial={tutorial} />
                      ))}
                    </div>
                    {tab === "all" && totalTutorials > 3 && (
                      <div className="mt-4 text-center">
                        <Button variant="ghost" size="sm" onClick={() => handleTabChange("guides")}>
                          View all {totalTutorials} guides →
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Specs Section */}
                {showSpecs && specs.length > 0 && (
                  <div className="mb-8">
                    {tab === "all" && (
                      <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                        <GitBranch className="w-5 h-5 text-[var(--accent)]" /> Specs
                        <span className="text-sm font-normal text-[var(--text-muted)]">({totalSpecs})</span>
                      </h2>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {(tab === "specs" ? specs : specs.slice(0, 3)).map((spec) => (
                        <SpecCard key={spec.id} spec={spec} />
                      ))}
                    </div>
                    {tab === "all" && totalSpecs > 3 && (
                      <div className="mt-4 text-center">
                        <Button variant="ghost" size="sm" onClick={() => handleTabChange("specs")}>
                          View all {totalSpecs} specs →
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Pagination — only for filtered tab views */}
                {tab !== "all" && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => { const p = page - 1; setPage(p); fetchResults(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={page <= 1}
                      className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-highlight)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                        .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                          if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) =>
                          p === "..." ? (
                            <span key={`ellipsis-${i}`} className="px-2 text-[var(--text-muted)]">…</span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => { setPage(p as number); fetchResults(p as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                                page === p
                                  ? "bg-[var(--accent)] text-[#0f0f14]"
                                  : "border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-highlight)]"
                              }`}
                            >
                              {p}
                            </button>
                          )
                        )}
                    </div>
                    <button
                      onClick={() => { const p = page + 1; setPage(p); fetchResults(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={page >= totalPages}
                      className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-highlight)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
