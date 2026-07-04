"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart, Eye, Users, ChevronRight, ArrowLeft, Edit2,
  MessageCircle, Image, Paperclip, X, Upload, Plus, ChevronDown, ChevronRight as ThreadRight
} from "lucide-react";
import Button from "@/components/Button";
import { RedditThreadItem } from "@/components/RedditThread";
import { useAuth } from "@/contexts/AuthContext";
import type { SpecChild } from "@/lib/types";

interface SpecAttachment {
  id: string;
  name: string;
  fileUrl: string;
  fileType: string;
  mimeType: string | null;
  size: number;
  createdAt: string;
}

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
  attachments: SpecAttachment[];
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function AttachmentGallery({ attachments, specId, canEdit }: { attachments: SpecAttachment[]; specId: string; canEdit: boolean }) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);
      const res = await fetch(`/api/specs/${specId}/attachments`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      // Trigger parent refresh — just reload
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (attachmentId: string) => {
    if (!confirm("Delete this attachment?")) return;
    setDeleting(attachmentId);
    try {
      const res = await fetch(`/api/specs/${specId}/attachments/${attachmentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const imageAttachments = attachments.filter((a) => a.fileType === "image");
  const fileAttachments = attachments.filter((a) => a.fileType !== "image");

  return (
    <div className="space-y-4">
      {/* Image Gallery — Reddit-style grid */}
      {imageAttachments.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Image className="w-4 h-4" style={{ color: "var(--accent)" }} />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              Media ({imageAttachments.length})
            </h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {imageAttachments.map((att) => (
              <div key={att.id} className="relative group aspect-square rounded-lg overflow-hidden border"
                style={{ borderColor: "var(--border)" }}>
                <img
                  src={att.fileUrl}
                  alt={att.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => window.open(att.fileUrl, "_blank")}
                />
                {canEdit && (
                  <button
                    onClick={() => deleteFile(att.id)}
                    disabled={deleting === att.id}
                    className="absolute top-1 right-1 p-1 rounded-full bg-[var(--bg)]/80 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--error)]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Attachments list */}
      {fileAttachments.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Paperclip className="w-4 h-4" style={{ color: "var(--accent)" }} />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              Attachments ({fileAttachments.length})
            </h3>
          </div>
          <div className="space-y-1.5">
            {fileAttachments.map((att) => (
              <div key={att.id} className="flex items-center gap-3 p-2.5 rounded-lg border group"
                style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}>
                <Paperclip className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                <div className="flex-1 min-w-0">
                  <a href={att.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline truncate block" style={{ color: "var(--accent)" }}>
                    {att.name}
                  </a>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatBytes(att.size)}</span>
                </div>
                {canEdit && (
                  <button
                    onClick={() => deleteFile(att.id)}
                    disabled={deleting === att.id}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-[var(--error)] hover:bg-[var(--bg-highlight)]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload area */}
      {canEdit && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) uploadFile(file);
          }}
          className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-[var(--accent)] transition-colors"
          style={{ borderColor: "var(--border)" }}
        >
          <input ref={inputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Uploading...</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>Add attachment</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
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
  const [threadExpanded, setThreadExpanded] = useState(true);
  const [expandedThreadIds, setExpandedThreadIds] = useState<Set<string>>(new Set());

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

      // Auto-expand top-level children
      const topLevel = new Set<string>();
      (data.spec.children || []).forEach((c: { id: string }) => topLevel.add(c.id));
      setExpandedThreadIds(topLevel);
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
    } catch {}
  }, [id]);

  useEffect(() => { fetchSpec(); }, [fetchSpec]);
  useEffect(() => { if (spec) trackView(); }, [spec?.id]);

  const handleLike = async () => {
    if (!spec) return;
    setLikeLoading(true);
    try {
      const res = await fetch(`/api/specs/${id}/like`, { method: "POST" });
      if (res.status === 401) { router.push(`/login?redirect=/specs/${id}`); return; }
      const data = await res.json();
      setSpec({ ...spec, likeCount: data.likeCount });
      setLikedByMe(data.liked);
    } finally { setLikeLoading(false); }
  };

  const handleFollow = async () => {
    if (!spec) return;
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/specs/${id}/follow`, { method: "POST" });
      if (res.status === 401) { router.push(`/login?redirect=/specs/${id}`); return; }
      const data = await res.json();
      setSpec({ ...spec, followCount: data.followCount });
      setFollowedByMe(data.following);
    } finally { setFollowLoading(false); }
  };

  const toggleThreadExpand = (specId: string) => {
    setExpandedThreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(specId)) next.delete(specId);
      else next.add(specId);
      return next;
    });
  };

  const canEdit = !!(user && spec && (user.id === spec.author.id || user.role === "ADMIN"));

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
          <Button variant="secondary"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Specs</Button>
        </Link>
      </div>
    );
  }

  const totalChildren = spec.children.length;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/specs" className="inline-flex items-center gap-1 text-sm hover:underline" style={{ color: "var(--text-muted)" }}>
            <ArrowLeft className="w-4 h-4" /> Specifications
          </Link>
          {spec.parent && (
            <>
              <span className="mx-2" style={{ color: "var(--text-muted)" }}>/</span>
              <Link href={`/specs/${spec.parent.id}`} className="text-sm hover:underline" style={{ color: "var(--text-muted)" }}>{spec.parent.name}</Link>
            </>
          )}
          <span className="mx-2" style={{ color: "var(--text-muted)" }}>/</span>
          <span className="text-sm" style={{ color: "var(--text)" }}>{spec.name}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Reddit-style main spec card */}
        <div className="rounded-xl border mb-8 overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          {/* Reddit header: dot + expand + icon + name + meta */}
          <div className="p-5">
            <div className="flex items-start gap-3">
              {/* Status dot */}
              <span className="w-3 h-3 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: spec.color || "#3b82f6" }} />

              {/* Thread expand/collapse */}
              <button
                onClick={() => setThreadExpanded(!threadExpanded)}
                className="p-0.5 rounded hover:bg-[var(--bg-highlight)] transition-colors flex-shrink-0 mt-0.5"
              >
                {threadExpanded
                  ? <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  : <ThreadRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                }
              </button>

              <div className="flex-1 min-w-0">
                {/* Title row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {spec.icon && <span className="text-2xl">{spec.icon}</span>}
                  <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>{spec.name}</h1>
                </div>

                {/* Author + meta */}
                <div className="flex items-center gap-3 mt-1.5 text-xs flex-wrap" style={{ color: "var(--text-muted)" }}>
                  <span>by</span>
                  <Link href={`/user/${spec.author.id}`} className="font-semibold hover:underline" style={{ color: "var(--accent)" }}>
                    {spec.author.name}
                  </Link>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{spec.viewCount.toLocaleString()}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" />{spec.likeCount.toLocaleString()}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{spec.followCount.toLocaleString()}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><MessageCircle className="w-3 h-3" />{spec.attachments.length + totalChildren}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-shrink-0">
                {(user?.role === "ADMIN" || user?.role === "MODERATOR") && (
                  <Button variant="secondary" size="sm" onClick={() => router.push(`/specs?edit=${id}`)}>
                    <Edit2 className="w-4 h-4 mr-1" /> Edit
                  </Button>
                )}
                <Button
                  variant={likedByMe ? "primary" : "secondary"} size="sm" loading={likeLoading} onClick={handleLike}
                >
                  <Heart className={`w-4 h-4 mr-1 ${likedByMe ? "fill-current" : ""}`} />
                  {likedByMe ? "Liked" : "Like"}
                </Button>
                <Button
                  variant={followedByMe ? "primary" : "secondary"} size="sm" loading={followLoading} onClick={handleFollow}
                >
                  <Users className="w-4 h-4 mr-1" />
                  {followedByMe ? "Following" : "Follow"}
                </Button>
              </div>
            </div>

            {/* Expanded content */}
            {threadExpanded && (
              <>
                {/* Description */}
                {spec.details && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                    <div className="grid gap-2">
                      {spec.details.split("\n").map((line, i) => {
                        const colonIdx = line.indexOf(":");
                        if (colonIdx > 0) {
                          const label = line.slice(0, colonIdx + 1).trim();
                          const value = line.slice(colonIdx + 1).trim();
                          return (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 p-3 rounded-lg"
                              style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
                              <span className="text-xs font-semibold uppercase tracking-wide shrink-0 pt-0.5" style={{ color: "var(--accent)", minWidth: "120px" }}>{label}</span>
                              <span className="text-sm" style={{ color: "var(--text)" }}>{value}</span>
                            </div>
                          );
                        }
                        if (line.trim()) {
                          return (
                            <div key={i} className="flex items-start gap-3 p-3 pl-6 rounded-lg"
                              style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", borderLeft: "3px solid var(--accent)" }}>
                              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{line}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}

                {/* Attachments section */}
                {(spec.attachments.length > 0 || canEdit) && (
                  <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                    <AttachmentGallery
                      attachments={spec.attachments}
                      specId={spec.id}
                      canEdit={canEdit}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Reddit-style children thread section */}
          {spec.children.length > 0 && (
            <div className="border-t" style={{ borderColor: "var(--border)" }}>
              <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
                <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text)" }}>
                  <ChevronRight className="w-4 h-4" style={{ color: "var(--accent)" }} />
                  Sub-specs ({spec.children.length})
                </h2>
              </div>
              <div className="p-3">
                <RedditThreadItem
                  spec={spec as any}
                  dotColor={spec.color || "#3b82f6"}
                  expandedIds={expandedThreadIds}
                  onNavigate={(sid) => router.push(`/specs/${sid}`)}
                  onToggleExpand={toggleThreadExpand}
                />
              </div>
            </div>
          )}
        </div>

        {/* Empty children state */}
        {spec.children.length === 0 && (
          <div className="text-center py-10 rounded-xl border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No sub-specs yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
