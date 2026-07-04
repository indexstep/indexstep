"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Eye, Users, ChevronRight, ArrowLeft, Edit2, GitBranch } from "lucide-react";
import Button from "@/components/Button";
import SpecTree from "@/components/SpecTree";
import { useAuth } from "@/contexts/AuthContext";
import type { SpecChild } from "@/lib/types";

interface SpecData {
  id: string;
  name: string;
  details: string;
  color: string;
  icon: string | null;
  imageUrl: string | null;
  viewCount: number;
  likeCount: number;
  followCount: number;
  author: { id: string; name: string };
  parent: { id: string; name: string } | null;
  children: (SpecChild & { viewCount: number; likeCount: number; followCount: number; details: string })[];
}

export default function SpecDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [spec, setSpec] = useState<SpecData | null>(null);
  const [likedByMe, setLikedByMe] = useState(false);
  const [followedByMe, setFollowedByMe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likeLoading, setLikeLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchSpec = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/specs/${id}`);
      if (!res.ok) {
        if (res.status === 404) setError("Spec not found");
        else setError(`Error ${res.status}`);
        return;
      }
      const data = await res.json();
      setSpec(data.spec);
      setLikedByMe(data.likedByMe);
      setFollowedByMe(data.followedByMe);
    } catch (err) {
      console.error(err);
      setError("Failed to load spec");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const trackView = useCallback(async () => {
    try {
      await fetch(`/api/specs/${id}/view`, { method: "POST" });
    } catch (err) {
      // Silently fail
    }
  }, [id]);

  useEffect(() => {
    fetchSpec();
  }, [fetchSpec]);

  useEffect(() => {
    if (spec) {
      trackView();
    }
  }, [spec?.id]);

  const handleLike = async () => {
    if (!spec) return;
    setLikeLoading(true);
    try {
      const res = await fetch(`/api/specs/${id}/like`, { method: "POST" });
      if (res.status === 401) {
        router.push(`/login?redirect=/specs/${id}`);
        return;
      }
      const data = await res.json();
      setSpec({ ...spec, likeCount: data.likeCount });
      setLikedByMe(data.liked);
    } catch (err) {
      console.error(err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!spec) return;
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/specs/${id}/follow`, { method: "POST" });
      if (res.status === 401) {
        router.push(`/login?redirect=/specs/${id}`);
        return;
      }
      const data = await res.json();
      setSpec({ ...spec, followCount: data.followCount });
      setFollowedByMe(data.following);
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  if (error || !spec) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p style={{ color: "var(--error)" }}>{error || "Spec not found"}</p>
        <Link href="/specs">
          <Button variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Specs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/specs" className="inline-flex items-center gap-1 text-sm hover:underline" style={{ color: "var(--text-muted)" }}>
            <ArrowLeft className="w-4 h-4" />
            Specifications
          </Link>
          {spec.parent && (
            <>
              <span className="mx-2" style={{ color: "var(--text-muted)" }}>/</span>
              <Link href={`/specs/${spec.parent.id}`} className="text-sm hover:underline" style={{ color: "var(--text-muted)" }}>
                {spec.parent.name}
              </Link>
            </>
          )}
          <span className="mx-2" style={{ color: "var(--text-muted)" }}>/</span>
          <span className="text-sm" style={{ color: "var(--text)" }}>{spec.name}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Spec Header Card */}
        <div className="rounded-xl border p-6 mb-8" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          <div className="flex items-start gap-4">
            {spec.imageUrl ? (
              <img src={spec.imageUrl} alt="" className="w-20 h-20 rounded-xl object-cover" style={{ borderColor: spec.color, borderWidth: "3px", borderStyle: "solid" }} />
            ) : (
              <div className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl" style={{ backgroundColor: spec.color }}>
                {spec.icon || "📋"}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>{spec.name}</h1>
                {spec.icon && !spec.imageUrl && <span className="text-2xl">{spec.icon}</span>}
              </div>
              <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
                by{" "}
                <Link href={`/user/${spec.author.id}`} className="font-medium hover:underline" style={{ color: "var(--accent)" }}>
                  {spec.author.name}
                </Link>
              </p>
              
              {/* Stats row */}
              <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                <Link href={`/user/${spec.author.id}`} className="hover:underline" style={{ color: "var(--accent)" }}>
                  {spec.author.name}
                </Link>
                <span>·</span>
                <div className="flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                  <Eye className="w-3.5 h-3.5" />
                  <span>{spec.viewCount.toLocaleString()} views</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                  <Heart className="w-3.5 h-3.5" />
                  <span>{spec.likeCount.toLocaleString()} likes</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                  <Users className="w-3.5 h-3.5" />
                  <span>{spec.followCount.toLocaleString()} follows</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {(user?.role === "ADMIN" || user?.role === "MODERATOR") && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push(`/specs?edit=${id}`)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
              <Button
                variant={likedByMe ? "primary" : "secondary"}
                size="sm"
                loading={likeLoading}
                onClick={handleLike}
              >
                <Heart className={`w-4 h-4 mr-1 ${likedByMe ? "fill-current" : ""}`} />
                {likedByMe ? "Liked" : "Like"}
              </Button>
              <Button
                variant={followedByMe ? "primary" : "secondary"}
                size="sm"
                loading={followLoading}
                onClick={handleFollow}
              >
                <Users className="w-4 h-4 mr-1" />
                {followedByMe ? "Following" : "Follow"}
              </Button>
            </div>
          </div>

          {/* Description */}
          {spec.details && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>{spec.details}</p>
            </div>
          )}
        </div>

        {/* Children Section */}
        {spec.children.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}>
              <ChevronRight className="w-5 h-5" style={{ color: "var(--accent)" }} />
              Sub-specs ({spec.children.length})
            </h2>
            <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
              <SpecTree
                specs={spec.children as any}
                onEdit={() => {}}
                onDelete={() => {}}
                onAddChild={() => {}}
              />
            </div>
          </div>
        )}

        {/* Empty children state */}
        {spec.children.length === 0 && (
          <div className="text-center py-12 rounded-xl border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
            <GitBranch className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No sub-specs yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
