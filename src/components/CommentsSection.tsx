"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/Button";
import Link from "next/link";
import { MessageCircle, Send, Heart, User, Edit2, Trash2, CornerDownRight, X } from "lucide-react";

interface CommentAuthor {
  id: string;
  name: string;
  profilePicture: string | null;
}

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  likeCount: number;
  likedBy: string;
  author: CommentAuthor;
  replies?: CommentData[];
}

interface CommentsSectionProps {
  targetType: "tutorial" | "spec";
  targetId: string;
}

export default function CommentsSection({ targetType, targetId }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const apiBase = targetType === "tutorial" ? `/api/tutorials/${targetId}/comments` : `/api/specs/${targetId}/comments`;

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiBase);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [targetId]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments([...comments, comment]);
        setNewComment("");
      } else if (res.status === 401) {
        window.location.href = `/login?redirect=/${targetType === "tutorial" ? "tutorial" : "specs"}/${targetId}`;
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent, parentId }),
      });
      if (res.ok) {
        const reply = await res.json();
        setComments(comments.map(c =>
          c.id === parentId ? { ...c, replies: [...(c.replies || []), reply] } : c
        ));
        setReplyContent("");
        setReplyingTo(null);
      }
    } catch (err) {
      console.error("Failed to post reply:", err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      if (res.ok) {
        const updated = await res.json();
        setComments(comments.map(c => c.id === commentId ? { ...c, content: updated.content } : c));
        setEditingId(null);
      }
    } catch (err) {
      console.error("Failed to edit comment:", err);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (res.ok) {
        const removeFromComments = (list: CommentData[]): CommentData[] =>
          list.filter(c => {
            if (c.id === commentId) return false;
            if (c.replies) c.replies = removeFromComments(c.replies);
            return true;
          });
        setComments(removeFromComments(comments));
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        const updateLike = (list: CommentData[]): CommentData[] =>
          list.map(c => {
            if (c.id === commentId) return { ...c, likeCount: data.likeCount, likedBy: data.likedBy };
            if (c.replies) c.replies = updateLike(c.replies);
            return c;
          });
        setComments(updateLike(comments));
      }
    } catch (err) {
      console.error("Failed to like comment:", err);
    }
  };

  const renderComment = (comment: CommentData, isReply = false) => {
    const likedByMe = user ? comment.likedBy.split(",").filter(Boolean).includes(user.id) : false;
    const isEditing = editingId === comment.id;
    const isReplying = replyingTo === comment.id;

    return (
      <div key={comment.id} className={isReply ? "ml-8 mt-3" : ""}>
        <div className={`rounded-lg border p-4 ${isReply ? "" : "mb-3"}`} style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          {/* Author row */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ backgroundColor: "var(--accent)" }}>
              {comment.author.profilePicture ? (
                <img src={comment.author.profilePicture} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4" style={{ color: "#0f0f14" }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm" style={{ color: "var(--text)" }}>{comment.author.name}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>

              {/* Content or edit form */}
              {isEditing ? (
                <div className="mt-2">
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    className="w-full px-3 py-2 rounded-lg border text-sm resize-none"
                    style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={() => handleEdit(comment.id)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>{comment.content}</p>
              )}

              {/* Actions */}
              {!isEditing && (
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className="flex items-center gap-1 text-xs transition-colors"
                    style={{ color: likedByMe ? "var(--accent)" : "var(--text-muted)" }}
                  >
                    <Heart className={`w-3.5 h-3.5 ${likedByMe ? "fill-current" : ""}`} />
                    {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
                  </button>

                  {!isReply && (
                    <button
                      onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                      className="flex items-center gap-1 text-xs transition-colors"
                      style={{ color: isReplying ? "var(--accent)" : "var(--text-muted)" }}
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      Reply
                    </button>
                  )}

                  {(user?.id === comment.author.id || user?.role === "ADMIN" || user?.role === "MODERATOR") && (
                    <>
                      <button
                        onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}
                        className="flex items-center gap-1 text-xs transition-colors"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="flex items-center gap-1 text-xs transition-colors"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Reply form */}
              {isReplying && (
                <div className="mt-3 flex gap-2">
                  <CornerDownRight className="w-4 h-4 flex-shrink-0 mt-2" style={{ color: "var(--text-muted)" }} />
                  <div className="flex-1">
                    <textarea
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      placeholder={`Reply to ${comment.author.name}...`}
                      rows={2}
                      maxLength={2000}
                      className="w-full px-3 py-2 rounded-lg border text-sm resize-none"
                      style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => handleReply(comment.id)} loading={submittingReply} disabled={!replyContent.trim()}>Post Reply</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyContent(""); }}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nested replies */}
        {comment.replies && comment.replies.map(reply => renderComment(reply, true))}
      </div>
    );
  };

  return (
    <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
      <h2 className="text-lg font-semibold mb-5 flex items-center gap-2" style={{ color: "var(--text)" }}>
        <MessageCircle className="w-5 h-5" style={{ color: "var(--accent)" }} />
        Comments {comments.length > 0 && <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>({comments.length})</span>}
      </h2>

      {/* Post comment form */}
      {user ? (
        <form onSubmit={handlePost} className="mb-6">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ backgroundColor: "var(--accent)" }}>
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4" style={{ color: "#0f0f14" }} />
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Share your thoughts, tips, or questions..."
                rows={3}
                maxLength={2000}
                className="w-full px-4 py-3 rounded-lg border text-sm resize-none"
                style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{newComment.length}/2000</span>
                <Button type="submit" size="sm" loading={submitting} disabled={!newComment.trim()}>
                  <Send className="w-4 h-4 mr-1" /> Post
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 rounded-lg border text-center" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>Sign in to join the conversation</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login"><Button variant="secondary" size="sm">Log In</Button></Link>
            <Link href="/signup"><Button size="sm">Sign Up</Button></Link>
          </div>
        </div>
      )}

      {/* Comment list */}
      {loading ? (
        <div className="flex items-center justify-center py-8 gap-2">
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--accent)" }} />
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--accent)", animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--accent)", animationDelay: "300ms" }} />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div>{comments.map(comment => renderComment(comment))}</div>
      )}
    </div>
  );
}
