"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, ArrowLeft, Lock } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  badgeType: string;
  tier: string;
  criteria: Record<string, unknown>;
  imageUrl: string | null;
  imageData: string | null;
  isActive: boolean;
  createdAt: string;
}

interface UserBadge {
  id: string;
  badgeId: string;
  awardedAt: string;
  note: string | null;
  badge: Badge;
}

const TIER_ORDER = ["common", "rare", "epic", "legendary"];
const TIER_LABELS: Record<string, string> = { common: "Common", rare: "Rare", epic: "Epic", legendary: "Legendary" };
const TIER_COLORS: Record<string, string> = { common: "#94a3b8", rare: "#3b82f6", epic: "#a855f7", legendary: "#f59e0b" };
const TYPE_LABELS: Record<string, string> = { custom: "Custom", milestone: "Milestone", system: "System" };

export default function BadgesPage() {
  const { user } = useAuth();
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<Map<string, UserBadge>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterEarned, setFilterEarned] = useState<"all" | "earned" | "unearned">("all");
  const [detailBadge, setDetailBadge] = useState<Badge | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/badges?isActive=true&pageSize=100");
        if (!res.ok) throw new Error("Failed to load badges");
        const data = await res.json();
        setAllBadges(data.badges);

        if (user) {
          const ubRes = await fetch(`/api/badges/users/${user.id}`);
          if (ubRes.ok) {
            const ubData = await ubRes.json();
            const map = new Map<string, UserBadge>();
            ubData.badges.forEach((ub: UserBadge) => map.set(ub.badgeId, ub));
            setUserBadges(map);
          }
        }
      } catch (err) {
        console.error("Failed to load badges:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const filtered = allBadges.filter((b) => {
    if (filterTier && b.tier !== filterTier) return false;
    if (filterType && b.badgeType !== filterType) return false;
    if (filterEarned === "earned" && !userBadges.has(b.id)) return false;
    if (filterEarned === "unearned" && userBadges.has(b.id)) return false;
    return true;
  });

  const byTier = TIER_ORDER.reduce((acc, tier) => {
    acc[tier] = filtered.filter((b) => b.tier === tier);
    return acc;
  }, {} as Record<string, Badge[]>);

  const earnedCount = allBadges.filter((b) => userBadges.has(b.id)).length;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href="/" className="text-[var(--text-secondary)]400 hover:text-[var(--text)] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-2xl">🏆</span>
            <h1 className="text-xl font-bold text-[var(--text)]">Badges</h1>
            {!loading && (
              <span className="text-sm text-[var(--text-secondary)]400">
                {earnedCount} / {allBadges.length} earned
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        {!loading && allBadges.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--text-secondary)]">Collection Progress</span>
              <span className="text-[var(--text)] font-semibold">
                {Math.round((earnedCount / allBadges.length) * 100)}%
              </span>
            </div>
            <div className="h-2.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(earnedCount / allBadges.length) * 100}%`,
                  background: "linear-gradient(90deg, #3b82f6, #a855f7)",
                }}
              />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 flex-wrap mb-8">
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500"
          >
            <option value="">All Tiers</option>
            {TIER_ORDER.map((t) => (
              <option key={t} value={t}>{TIER_LABELS[t]}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500"
          >
            <option value="">All Types</option>
            <option value="custom">Custom</option>
            <option value="milestone">Milestone</option>
            <option value="system">System</option>
          </select>
          <select
            value={filterEarned}
            onChange={(e) => setFilterEarned(e.target.value as "all" | "earned" | "unearned")}
            className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500"
          >
            <option value="all">All Badges</option>
            <option value="earned">Earned</option>
            <option value="unearned">Not Earned</option>
          </select>
        </div>

        {/* Badge grid by tier */}
        {loading ? (
          <div className="text-center py-16 text-[var(--text-secondary)]">Loading...</div>
        ) : (
          <>
            {TIER_ORDER.map((tier) => {
              const tierBadges = byTier[tier];
              if (tierBadges.length === 0) return null;
              const color = TIER_COLORS[tier];

              return (
                <div key={tier} className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 style={{ color, margin: 0, fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {TIER_LABELS[tier]}
                    </h2>
                    <div style={{ flex: 1, height: 1, background: color + "30" }} />
                    <span className="text-xs text-[var(--text-secondary)]400">
                      {tierBadges.filter((b) => userBadges.has(b.id)).length} / {tierBadges.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {tierBadges.map((badge) => {
                      const earned = userBadges.has(badge.id);
                      const ub = userBadges.get(badge.id);
                      const hasImage = !!(badge.imageData || badge.imageUrl);

                      return (
                        <div
                          key={badge.id}
                          onClick={() => setDetailBadge(badge)}
                          className="cursor-pointer transition-all duration-150 hover:scale-[1.02]"
                          style={{
                            background: earned ? color + "12" : "var(--bg-secondary)",
                            border: `1px solid ${earned ? color + "50" : "var(--border)"}`,
                            borderRadius: 14,
                            padding: "20px 16px",
                            opacity: earned ? 1 : 0.65,
                          }}
                          onMouseOver={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = color + "80";
                            (e.currentTarget as HTMLElement).style.opacity = "1";
                            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                          }}
                          onMouseOut={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = earned ? color + "50" : "var(--border)";
                            (e.currentTarget as HTMLElement).style.opacity = earned ? "1" : "0.65";
                            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                          }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                background: hasImage
                                  ? `center/cover no-repeat url(${badge.imageData || badge.imageUrl})`
                                  : badge.color,
                                border: `2px solid ${color}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 24,
                                flexShrink: 0,
                                boxShadow: `0 0 12px ${color}30`,
                                ...(hasImage ? {} : { background: badge.color }),
                              }}
                            >
                              {!hasImage && badge.icon && <span>{badge.icon}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[var(--text)] truncate">{badge.name}</p>
                              {earned && (
                                <p className="text-xs mt-0.5" style={{ color }}>
                                  ✓ Earned
                                </p>
                              )}
                            </div>
                          </div>
                          {badge.description && (
                            <p
                              className="text-xs text-[var(--text-secondary)]400 line-clamp-2"
                              style={{ lineHeight: 1.5 }}
                            >
                              {badge.description}
                            </p>
                          )}
                          {ub?.awardedAt && (
                            <p className="text-xs text-[var(--text-secondary)]500 mt-2">
                              {new Date(ub.awardedAt).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", year: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-[var(--text-secondary)]400">
                No badges match your filters.
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {detailBadge && (
        <BadgeDetailModal
          badge={detailBadge}
          userBadge={userBadges.get(detailBadge.id) || null}
          onClose={() => setDetailBadge(null)}
        />
      )}
    </div>
  );
}

function BadgeDetailModal({
  badge,
  userBadge,
  onClose,
}: {
  badge: Badge;
  userBadge: UserBadge | null;
  onClose: () => void;
}) {
  const color = TIER_COLORS[badge.tier] || "#94a3b8";
  const hasImage = !!(badge.imageData || badge.imageUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--bg-secondary)",
          border: `1px solid ${color}50`,
          borderRadius: 20,
          padding: 32,
          width: 420,
          maxWidth: "90vw",
          textAlign: "center",
          boxShadow: `0 0 40px ${color}20`,
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: hasImage
              ? `center/cover no-repeat url(${badge.imageData || badge.imageUrl})`
              : badge.color,
            border: `3px solid ${color}`,
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 44,
            boxShadow: `0 0 24px ${color}50`,
            ...(hasImage ? {} : { background: badge.color }),
          }}
        >
          {!hasImage && badge.icon && <span>{badge.icon}</span>}
        </div>

        <h2 style={{ color: "var(--text)", margin: "0 0 8px 0", fontSize: 22, fontWeight: 700 }}>{badge.name}</h2>

        <div className="flex gap-2 justify-center mb-4">
          <span
            style={{
              padding: "3px 10px",
              background: `${color}20`,
              color,
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {TIER_LABELS[badge.tier]}
          </span>
          <span
            style={{
              padding: "3px 10px",
              background: "var(--bg)",
              color: "var(--text-secondary)",
              borderRadius: 20,
              fontSize: 12,
              textTransform: "capitalize",
            }}
          >
            {TYPE_LABELS[badge.badgeType]}
          </span>
        </div>

        {badge.description && (
          <p style={{ color: "var(--text-secondary)", margin: "0 0 20px 0", fontSize: 14, lineHeight: 1.6 }}>
            {badge.description}
          </p>
        )}

        {userBadge?.awardedAt && (
          <p style={{ color: "var(--text-secondary)", fontSize: 12, margin: "0 0 16px 0" }}>
            Earned on{" "}
            {new Date(userBadge.awardedAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        )}

        {userBadge?.note && (
          <p style={{ color: "var(--text-secondary)", fontSize: 13, fontStyle: "italic", margin: "0 0 16px 0" }}>
            &ldquo;{userBadge.note}&rdquo;
          </p>
        )}

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px",
            background: "var(--bg)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
