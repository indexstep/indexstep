"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, User, CheckCircle, Circle, Wrench, X, ArrowLeft, Flag, AlertTriangle, Eye, Share2, MessageCircle, Send, Trash2, Copy, Check, CornerDownRight, Pencil, Settings2, ChefHat, Cpu, Hammer, Flower2, Scissors, Monitor, Lock, KeyRound } from "lucide-react";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import { getMergedToolConfig, TOOL_CATEGORY_CONFIG, type CustomToolFieldConfig } from "@/lib/toolCategories";
import { CATEGORIES } from "@/lib/types";

interface Tool { id: string; name: string; quantity: string | null; size: string | null; kind: string | null; notes: string | null; category: string; }
interface Step { id: string; order: number; title: string; content: string; imageUrl: string | null; }
interface CommentData {
  id: string; content: string; createdAt: string; likeCount: number; likedBy: string;
  author: { id: string; name: string; profilePicture: string | null };
  replies?: CommentData[];
}
interface TutorialDetailData {
  id: string; title: string; description: string; category: string;
  difficulty: number; timeMinutes: number; coverImage: string | null; viewCount?: number;
  locked: boolean; lockContent: boolean; price: number; password?: string | null;
  requiresPassword?: boolean; isUnlocked?: boolean;
  author: { id: string; name: string }; tools: Tool[]; steps: Step[];
  customConfigs?: CustomToolFieldConfig[];
}

const difficultyLabels = ["", "Easy", "Medium", "Hard", "Expert", "Master"];
const difficultyColors = ["", "text-[#aad94c]", "text-[#aad94c]", "text-[#e6c866]", "text-[var(--accent)]", "text-[var(--red)]"];

interface TutorialViewProps {
  initialTutorial?: TutorialDetailData | null;
}

export default function TutorialView({ initialTutorial }: TutorialViewProps) {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [tutorial, setTutorial] = useState<TutorialDetailData | null>(initialTutorial ?? null);
  const [customConfigs, setCustomConfigs] = useState<CustomToolFieldConfig[]>(initialTutorial?.customConfigs ?? []);
  const [loading, setLoading] = useState(!initialTutorial);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toolChecklist, setToolChecklist] = useState<Set<string>>(new Set());
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetail, setReportDetail] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [toolTab, setToolTab] = useState<string>(tutorial?.category || "DIY");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const handlePasswordVerify = async () => {
    if (!passwordInput.trim() || !tutorial) return;
    setVerifyingPassword(true);
    setPasswordError(false);
    try {
      const res = await fetch(`/api/tutorials/${tutorial.id}/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      if (res.ok) {
        setUnlocked(true);
        // Get full tutorial content from verify response
        res.json().then((data) => {
          if (data.tutorial) {
            setTutorial(data.tutorial);
            if (data.tutorial.customConfigs) setCustomConfigs(data.tutorial.customConfigs);
            // Cache full content in sessionStorage for page refresh
            try {
              sessionStorage.setItem(`unlocked_${tutorial.id}`, "true");
              sessionStorage.setItem(`tutorial_${tutorial.id}`, JSON.stringify(data.tutorial));
            } catch(e) {}
          } else {
            sessionStorage.setItem(`unlocked_${tutorial.id}`, "true");
          }
        }).catch(() => {
          sessionStorage.setItem(`unlocked_${tutorial.id}`, "true");
        });
      } else {
        setPasswordError(true);
        setPasswordInput("");
      }
    } catch {
      setPasswordError(true);
    } finally {
      setVerifyingPassword(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      // Check if we have cached full content from a previous unlock
      const cachedTutorial = sessionStorage.getItem(`tutorial_${params.id}`);
      const wasUnlocked = sessionStorage.getItem(`unlocked_${params.id}`) === "true";

      if (cachedTutorial && wasUnlocked) {
        try {
          const data = JSON.parse(cachedTutorial);
          setTutorial(data);
          setUnlocked(true);
          if (data.customConfigs) setCustomConfigs(data.customConfigs);
          setLoading(false);
          return;
        } catch(e) {}
      }

      fetch(`/api/tutorials/${params.id}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) {
            setTutorial(data);
            if (data.customConfigs) setCustomConfigs(data.customConfigs);
            // Check if already unlocked in this session (only if requires password)
            if (data.requiresPassword) {
              const unlocked = sessionStorage.getItem(`unlocked_${params.id}`);
              if (unlocked === "true") setUnlocked(true);
            }
          } else {
            router.push("/");
          }
        })
        .catch(() => router.push("/"))
        .finally(() => setLoading(false));
    } else if (initialTutorial) {
      setTutorial(initialTutorial);
      setLoading(false);
    }
  }, [params.id, initialTutorial, router]);

  useEffect(() => {
    if (commentsOpen && tutorial) {
      fetch(`/api/tutorials/${tutorial.id}/comments`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => { if (data) setComments(data); })
        .catch(() => {});
    }
  }, [commentsOpen, tutorial]);

  // Reading progress bar
  useEffect(() => {
    const updateProgress = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setReadProgress(scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0);
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  useEffect(() => {
    if (tutorial) {
      const saved = localStorage.getItem(`progress_${tutorial.id}`);
      if (saved) setCompletedSteps(new Set(JSON.parse(saved)));
      const savedTools = localStorage.getItem(`tools_${tutorial.id}`);
      if (savedTools) setToolChecklist(new Set(JSON.parse(savedTools)));
    }
  }, [tutorial]);

  const toggleStep = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.has(stepId) ? newCompleted.delete(stepId) : newCompleted.add(stepId);
    setCompletedSteps(newCompleted);
    localStorage.setItem(`progress_${tutorial!.id}`, JSON.stringify([...newCompleted]));
  };

  const toggleTool = (toolId: string) => {
    const newTools = new Set(toolChecklist);
    newTools.has(toolId) ? newTools.delete(toolId) : newTools.add(toolId);
    setToolChecklist(newTools);
    localStorage.setItem(`tools_${tutorial!.id}`, JSON.stringify([...newTools]));
  };

  const formatTime = (minutes: number) => minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60 > 0 ? minutes % 60 + "m" : ""}`;
  const progressPercent = tutorial ? Math.round((completedSteps.size / tutorial.steps.length) * 100) : 0;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!tutorial) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--text-secondary)]">Tutorial not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Mobile Progress */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)]/95 backdrop-blur-sm border-t border-[var(--border)] z-50 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--text-secondary)]">{completedSteps.size} of {tutorial.steps.length} steps</span>
          <span className="text-sm font-medium text-[var(--accent)]">{progressPercent}%</span>
        </div>
        <div className="h-2 bg-[var(--bg-highlight)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--accent)] transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[var(--bg-highlight)]">
        <div
          className="h-full bg-[var(--accent)] transition-all duration-150 ease-out"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Mobile Tool Toggle */}
      <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed top-20 right-4 z-40 p-3 bg-[var(--accent)] rounded-full shadow-lg">
        <Wrench className="w-5 h-5 text-[#0f0f14]" />
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to guides
        </Link>

        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-[var(--accent)]/20 text-[var(--accent)]">{tutorial.category}</span>
            
            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-[var(--bg-highlight)] ${difficultyColors[tutorial.difficulty]}`}>{difficultyLabels[tutorial.difficulty]}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4 leading-tight">{tutorial.title}</h1>
          <p className="text-lg text-[var(--text-secondary)] mb-6 leading-relaxed max-w-3xl">{tutorial.description}</p>
          <div className="flex flex-wrap items-center gap-6 text-[var(--text-secondary)]">
            <div className="flex items-center gap-2"><User className="w-5 h-5" /><span>{tutorial.author.name}</span></div>
            <div className="flex items-center gap-2"><Clock className="w-5 h-5" /><span>{formatTime(tutorial.timeMinutes)}</span></div>
            <div className="flex items-center gap-2"><Circle className="w-5 h-5" /><span>{tutorial.steps.length} steps</span></div>
            {tutorial.viewCount !== undefined && (
              <div className="flex items-center gap-2"><Eye className="w-5 h-5" /><span>{tutorial.viewCount.toLocaleString()} views</span></div>
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-highlight)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[#3a3a4d] transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-[#aad94c]" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
            </button>
            <button
              onClick={() => setCommentsOpen(!commentsOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${commentsOpen ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "bg-[var(--bg-highlight)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[#3a3a4d]"}`}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Comments</span>
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--red)]/10 text-[var(--red)] hover:bg-[var(--red)]/20 transition-colors"
            >
              <Flag className="w-4 h-4" />
              <span className="hidden sm:inline">Report</span>
            </button>
            {(user?.id === tutorial.author.id || user?.role === "ADMIN" || user?.role === "MODERATOR") && (
              <>
                <Link
                  href={`/edit/${tutorial.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-highlight)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[#3a3a4d] transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--red)]/10 text-[var(--red)] hover:bg-[var(--red)]/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Password Gate */}
        {(tutorial.requiresPassword && !unlocked) && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-full max-w-sm bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--accent)]/20 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-[var(--accent)]" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text)] mb-2">Private Guide</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                This guide is password protected. Enter the password to access it.
              </p>
              <div className="space-y-3">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handlePasswordVerify(); }}
                  placeholder="Enter password"
                  className={`w-full px-4 py-3 bg-[var(--bg)] border rounded-lg text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-center ${passwordError ? "border-[var(--red)] ring-[var(--red)]" : "border-[var(--border)]"}`}
                />
                {passwordError && (
                  <p className="text-sm text-[var(--red)]">Incorrect password. Please try again.</p>
                )}
                <Button onClick={handlePasswordVerify} loading={verifyingPassword} className="w-full">
                  <KeyRound className="w-4 h-4 mr-2" />Unlock Guide
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content — only show if unlocked */}
        {!(tutorial.requiresPassword && !unlocked) && (
        <div className="flex gap-8">
          {/* Tools Sidebar - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
              {/* Category tabs */}
              {/* @ts-ignore */}
              {(() => {
                const catsWithTools = CATEGORIES.filter((cat) =>
                  tutorial.tools.some((t) => t.category === cat)
                );
                const cfg = getMergedToolConfig(toolTab, customConfigs);
                const tabTools = tutorial.tools.filter((t) => t.category === toolTab);
                const categoryIcon = (cat: string) => {
                  switch (cat) {
                    case "Cooking": return <ChefHat className="w-4 h-4" />;
                    case "Tech": return <Cpu className="w-4 h-4" />;
                    case "DIY": case "Home Improvement": case "Woodworking": return <Hammer className="w-4 h-4" />;
                    case "Gardening": return <Flower2 className="w-4 h-4" />;
                    case "Crafts": case "Sewing": return <Scissors className="w-4 h-4" />;
                    case "Electronics": return <Cpu className="w-4 h-4" />;
                    default: return <Wrench className="w-4 h-4" />;
                  }
                };
                return (
                  <>
                    <h2 className="text-lg font-semibold text-[var(--text)] mb-1 flex items-center gap-2">
                      {categoryIcon(toolTab)}
                      {cfg.sectionTitle}
                    </h2>
                    {catsWithTools.length > 1 && (
                      <div className="flex items-center gap-1 mb-4 flex-wrap pb-3 border-b" style={{ borderColor: "var(--border)" }}>
                        {catsWithTools.map((cat) => {
                          const count = tutorial.tools.filter((t) => t.category === cat).length;
                          const isActive = toolTab === cat;
                          return (
                            <button
                              key={cat}
                              onClick={() => setToolTab(cat)}
                              className="px-2.5 py-1 text-xs font-medium rounded-md border transition-colors"
                              style={{
                                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                                backgroundColor: isActive ? "var(--accent-muted)" : "transparent",
                                borderColor: isActive ? "var(--accent)" : "var(--border)",
                              }}
                            >
                              {getMergedToolConfig(cat, customConfigs).sectionTitle} ({count})
                            </button>
                          );
                        })}
                      </div>
                    )}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[var(--text-secondary)]">Prep progress</span>
                  <span className="text-[var(--accent)]">{tabTools.filter((t) => toolChecklist.has(t.id)).length}/{tabTools.length}</span>
                </div>
                <div className="h-2 bg-[var(--bg-highlight)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${tabTools.length ? (tabTools.filter((t) => toolChecklist.has(t.id)).length / tabTools.length) * 100 : 0}%` }} />
                </div>
              </div>
              <ul className="space-y-2">
                {tabTools.map((tool) => (
                  <li key={tool.id}>
                    <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--bg-highlight)]/50 cursor-pointer transition-colors">
                      <input type="checkbox" checked={toolChecklist.has(tool.id)} onChange={() => toggleTool(tool.id)} className="w-5 h-5 mt-0.5 rounded border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--accent)] focus:ring-[var(--accent)] focus:ring-offset-[var(--bg)]" />
                      <div className="flex-1">
                        <span className={`block ${toolChecklist.has(tool.id) ? "text-[var(--text-muted)] line-through" : "text-[var(--text)]"}`}>{tool.name}</span>
                        {cfg.fields.filter((f) => {
                          if (f.key === "name") return false;
                          const val = tool[f.key === "amount" ? "quantity" : f.key];
                          return val !== undefined && val !== null && String(val).trim() !== "";
                        }).length > 0 && (
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs text-[var(--text-muted)]">
                            {cfg.fields.filter((f) => f.key !== "name").map((field) => {
                              const val = tool[field.key === "amount" ? "quantity" : field.key];
                              if (!val || String(val).trim() === "") return null;
                              const separator = field.key === "notes" ? " " : " · ";
                              return <span key={field.key}>{field.label}: {val}{field.key === "notes" ? "" : ""}</span>;
                            })}
                          </div>
                        )}
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
              {tabTools.length === 0 && (
                  <p className="text-[var(--text-muted)] text-sm italic">No {cfg.sectionTitle.toLowerCase()} listed</p>
                )}
                {/* Guide Progress */}
                <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Guide Progress</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-[var(--bg-highlight)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <span className="text-sm font-medium text-[var(--accent)]">{progressPercent}%</span>
                  </div>
                </div>
              </>
            );
          })}
          </div>
        </aside>

        {/* Steps */}
          <div className="flex-1 min-w-0 pb-24 lg:pb-0">
            <div className="space-y-8">
              {tutorial.steps.map((step) => (
                <article key={step.id} className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] overflow-hidden">
                  <div className="flex items-center gap-4 p-6 border-b border-[var(--border)]">
                    <button onClick={() => toggleStep(step.id)} className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${completedSteps.has(step.id) ? "bg-[#aad94c] text-[#0f0f14]" : "bg-[var(--bg-highlight)] text-[var(--text-secondary)] hover:bg-[#3a3a4d]"}`}>
                      {completedSteps.has(step.id) ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm font-medium">{step.order}</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg font-semibold ${completedSteps.has(step.id) ? "text-[var(--text-muted)] line-through" : "text-[var(--text)]"}`}>{step.title}</h3>
                      <p className="text-sm text-[var(--text-muted)]">Step {step.order} of {tutorial.steps.length}</p>
                    </div>
                  </div>
                  {step.imageUrl && <div className="aspect-video bg-[var(--bg-highlight)]"><img src={step.imageUrl} alt={step.title} className="w-full h-full object-cover" /></div>}
                  <div className="p-6">
                    {step.content.includes("\n") ? (
                      <ul className="text-base text-[var(--text-secondary)] leading-8 max-w-2xl space-y-2 list-disc list-inside">
                        {step.content.split("\n").filter((line) => line.trim()).map((line, i) => (
                          <li key={i}>{line.replace(/^[-*]\s*/, "")}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-base text-[var(--text-secondary)] leading-8 max-w-2xl">{step.content}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
            {progressPercent === 100 && (
              <div className="mt-8 p-6 bg-[#aad94c]/10 border border-[#aad94c]/30 rounded-xl text-center">
                <CheckCircle className="w-12 h-12 text-[#aad94c] mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-[var(--text)] mb-2">Guide Complete!</h3>
                <p className="text-[var(--text-secondary)]">Great job! You&apos;ve finished all the steps.</p>
              </div>
            )}

            {/* Comments Section */}
            {commentsOpen && (
              <div className="mt-12 pt-8 border-t border-[var(--border)]">
                <h2 className="text-xl font-semibold text-[var(--text)] mb-6 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[var(--accent)]" />
                  Comments ({comments.length})
                </h2>

                {user ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newComment.trim()) return;
                      setSubmittingComment(true);
                      try {
                        const res = await fetch(`/api/tutorials/${tutorial.id}/comments`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ content: newComment }),
                        });
                        if (res.ok) {
                          const comment = await res.json();
                          setComments([...comments, comment]);
                          setNewComment("");
                        }
                      } catch (err) {
                        console.error("Failed to post comment:", err);
                      } finally {
                        setSubmittingComment(false);
                      }
                    }}
                    className="mb-8"
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-[#0f0f14]" />
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Share your thoughts, tips, or questions..."
                          rows={3}
                          maxLength={2000}
                          className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] resize-none"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-[var(--text-muted)]">{newComment.length}/2000</span>
                          <Button type="submit" size="sm" loading={submittingComment} disabled={!newComment.trim()}>
                            <Send className="w-4 h-4 mr-1" />Post Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="mb-8 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] text-center">
                    <p className="text-[var(--text-secondary)] mb-3">Sign in to join the conversation</p>
                    <div className="flex gap-3 justify-center">
                      <Link href="/login"><Button variant="secondary" size="sm">Log In</Button></Link>
                      <Link href="/signup"><Button size="sm">Sign Up</Button></Link>
                    </div>
                  </div>
                )}

                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-10 h-10 text-[#3a3a4d] mx-auto mb-3" />
                    <p className="text-[var(--text-muted)]">No comments yet. Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => {
                      const likedByMe = user ? comment.likedBy.split(",").filter(Boolean).includes(user.id) : false;
                      return (
                        <div key={comment.id}>
                          <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                                {comment.author.profilePicture ? (
                                  <img src={comment.author.profilePicture} alt={comment.author.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <User className="w-5 h-5 text-[#0f0f14]" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="font-medium text-[var(--text)]">{comment.author.name}</span>
                                  <span className="text-xs text-[var(--text-muted)]">
                                    {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </span>
                                  <button
                                    onClick={async () => {
                                      if (!user) return;
                                      try {
                                        const res = await fetch(`/api/comments/${comment.id}/like`, { method: "POST" });
                                        if (res.ok) {
                                          const data = await res.json();
                                          setComments(comments.map((c) =>
                                            c.id === comment.id ? { ...c, likeCount: data.likeCount, likedBy: data.likedBy } : c
                                          ));
                                        }
                                      } catch (err) {
                                        console.error("Failed to like comment:", err);
                                      }
                                    }}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors ${likedByMe ? "text-[var(--accent)] bg-[var(--accent)]/10" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-highlight)]"}`}
                                  >
                                    <span>♥</span>
                                    <span>{comment.likeCount}</span>
                                  </button>
                                  {user && (
                                    <button
                                      onClick={() => { setReplyingTo(replyingTo === comment.id ? null : comment.id); setReplyContent(""); }}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors ${replyingTo === comment.id ? "text-[var(--accent)] bg-[var(--accent)]/10" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-highlight)]"}`}
                                    >
                                      <CornerDownRight className="w-3 h-3" />Reply
                                    </button>
                                  )}
                                  {(user?.id === comment.author.id || user?.role === "ADMIN" || user?.role === "MODERATOR") && (
                                    <button
                                      onClick={() => { setEditingCommentId(comment.id); setEditContent(comment.content); }}
                                      className="text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors"
                                      title="Edit"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                  )}
                                  {(user?.id === comment.author.id || user?.role === "ADMIN" || user?.role === "MODERATOR") && (
                                    <button
                                      onClick={async () => {
                                        if (!confirm("Delete this comment?")) return;
                                        try {
                                          const res = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
                                          if (res.ok) setComments(comments.filter((c) => c.id !== comment.id));
                                        } catch (err) {
                                          console.error("Failed to delete comment:", err);
                                        }
                                      }}
                                      className="text-[var(--text-muted)] hover:text-[var(--red)] transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                                {editingCommentId === comment.id ? (
                                  <form
                                    onSubmit={async (e) => {
                                      e.preventDefault();
                                      if (!editContent.trim()) return;
                                      setSubmittingEdit(true);
                                      try {
                                        const res = await fetch(`/api/comments/${comment.id}`, {
                                          method: "PATCH",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ content: editContent }),
                                        });
                                        if (res.ok) {
                                          const updated = await res.json();
                                          setComments(comments.map((c) =>
                                            c.id === comment.id ? { ...c, content: updated.content } : c
                                          ));
                                          setEditingCommentId(null);
                                          setEditContent("");
                                        }
                                      } catch (err) {
                                        console.error("Failed to edit comment:", err);
                                      } finally {
                                        setSubmittingEdit(false);
                                      }
                                    }}
                                    className="mt-2"
                                  >
                                    <textarea
                                      value={editContent}
                                      onChange={(e) => setEditContent(e.target.value)}
                                      rows={3}
                                      maxLength={2000}
                                      className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] resize-none text-sm"
                                      autoFocus
                                    />
                                    <div className="flex items-center justify-between mt-2">
                                      <span className="text-xs text-[var(--text-muted)]">{editContent.length}/2000</span>
                                      <div className="flex gap-2">
                                        <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingCommentId(null); setEditContent(""); }}>Cancel</Button>
                                        <Button type="submit" size="sm" loading={submittingEdit} disabled={!editContent.trim()}>Save</Button>
                                      </div>
                                    </div>
                                  </form>
                                ) : (
                                  <p className="text-[var(--text-secondary)] whitespace-pre-wrap">{comment.content}</p>
                                )}
                              </div>
                            </div>

                            {/* Reply form */}
                            {replyingTo === comment.id && (
                              <div className="mt-3 ml-13">
                                <form
                                  onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!replyContent.trim()) return;
                                    setSubmittingReply(true);
                                    try {
                                      const res = await fetch(`/api/tutorials/${tutorial.id}/comments`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ content: replyContent, parentId: comment.id }),
                                      });
                                      if (res.ok) {
                                        const newReply = await res.json();
                                        setComments(comments.map((c) =>
                                          c.id === comment.id ? { ...c, replies: [...(c.replies || []), newReply] } : c
                                        ));
                                        setReplyingTo(null);
                                        setReplyContent("");
                                      }
                                    } catch (err) {
                                      console.error("Failed to post reply:", err);
                                    } finally {
                                      setSubmittingReply(false);
                                    }
                                  }}
                                >
                                  <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder={`Reply to ${comment.author.name}...`}
                                    rows={2}
                                    maxLength={2000}
                                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] resize-none text-sm"
                                    autoFocus
                                  />
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-[var(--text-muted)]">{replyContent.length}/2000</span>
                                    <div className="flex gap-2">
                                      <Button type="button" variant="ghost" size="sm" onClick={() => { setReplyingTo(null); setReplyContent(""); }}>Cancel</Button>
                                      <Button type="submit" size="sm" loading={submittingReply} disabled={!replyContent.trim()}>Reply</Button>
                                    </div>
                                  </div>
                                </form>
                              </div>
                            )}
                          </div>

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-2 ml-8 pl-4 border-l-2 border-[var(--border)] space-y-3">
                              {comment.replies.map((reply) => {
                                const replyLikedByMe = user ? reply.likedBy.split(",").filter(Boolean).includes(user.id) : false;
                                return (
                                  <div key={reply.id} className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-3">
                                    <div className="flex items-start gap-2">
                                      <div className="w-8 h-8 rounded-full bg-[var(--bg-highlight)] flex items-center justify-center flex-shrink-0">
                                        {reply.author.profilePicture ? (
                                          <img src={reply.author.profilePicture} alt={reply.author.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                          <User className="w-4 h-4 text-[var(--text-secondary)]" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                          <span className="font-medium text-[var(--text)] text-sm">{reply.author.name}</span>
                                          <span className="text-xs text-[var(--text-muted)]">
                                            {new Date(reply.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                          </span>
                                          <button
                                            onClick={async () => {
                                              if (!user) return;
                                              try {
                                                const res = await fetch(`/api/comments/${reply.id}/like`, { method: "POST" });
                                                if (res.ok) {
                                                  const data = await res.json();
                                                  setComments(comments.map((c) =>
                                                    c.id === comment.id ? {
                                                      ...c,
                                                      replies: c.replies?.map((r) =>
                                                        r.id === reply.id ? { ...r, likeCount: data.likeCount, likedBy: data.likedBy } : r
                                                      )
                                                    } : c
                                                  ));
                                                }
                                              } catch (err) {
                                                console.error("Failed to like reply:", err);
                                              }
                                            }}
                                            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs transition-colors ${replyLikedByMe ? "text-[var(--accent)] bg-[var(--accent)]/10" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-highlight)]"}`}
                                          >
                                            <span>♥</span>
                                            <span>{reply.likeCount}</span>
                                          </button>
                                          {(user?.id === reply.author.id || user?.role === "ADMIN" || user?.role === "MODERATOR") && (
                                            <button
                                              onClick={() => { setEditingCommentId(reply.id); setEditContent(reply.content); }}
                                              className="text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors"
                                              title="Edit"
                                            >
                                              <Pencil className="w-3 h-3" />
                                            </button>
                                          )}
                                          {(user?.id === reply.author.id || user?.role === "ADMIN" || user?.role === "MODERATOR") && (
                                            <button
                                              onClick={async () => {
                                                if (!confirm("Delete this reply?")) return;
                                                try {
                                                  const res = await fetch(`/api/comments/${reply.id}`, { method: "DELETE" });
                                                  if (res.ok) {
                                                    setComments(comments.map((c) =>
                                                      c.id === comment.id ? { ...c, replies: c.replies?.filter((r) => r.id !== reply.id) } : c
                                                    ));
                                                  }
                                                } catch (err) {
                                                  console.error("Failed to delete reply:", err);
                                                }
                                              }}
                                              className="text-[var(--text-muted)] hover:text-[var(--red)] transition-colors ml-auto"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                        {editingCommentId === reply.id ? (
                                          <form
                                            onSubmit={async (e) => {
                                              e.preventDefault();
                                              if (!editContent.trim()) return;
                                              setSubmittingEdit(true);
                                              try {
                                                const res = await fetch(`/api/comments/${reply.id}`, {
                                                  method: "PATCH",
                                                  headers: { "Content-Type": "application/json" },
                                                  body: JSON.stringify({ content: editContent }),
                                                });
                                                if (res.ok) {
                                                  const updated = await res.json();
                                                  setComments(comments.map((c) =>
                                                    c.id === comment.id ? {
                                                      ...c,
                                                      replies: c.replies?.map((r) =>
                                                        r.id === reply.id ? { ...r, content: updated.content } : r
                                                      )
                                                    } : c
                                                  ));
                                                  setEditingCommentId(null);
                                                  setEditContent("");
                                                }
                                              } catch (err) {
                                                console.error("Failed to edit reply:", err);
                                              } finally {
                                                setSubmittingEdit(false);
                                              }
                                            }}
                                            className="mt-2"
                                          >
                                            <textarea
                                              value={editContent}
                                              onChange={(e) => setEditContent(e.target.value)}
                                              rows={2}
                                              maxLength={2000}
                                              className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] resize-none text-sm"
                                              autoFocus
                                            />
                                            <div className="flex items-center justify-between mt-2">
                                              <span className="text-xs text-[var(--text-muted)]">{editContent.length}/2000</span>
                                              <div className="flex gap-2">
                                                <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingCommentId(null); setEditContent(""); }}>Cancel</Button>
                                                <Button type="submit" size="sm" loading={submittingEdit} disabled={!editContent.trim()}>Save</Button>
                                              </div>
                                            </div>
                                          </form>
                                        ) : (
                                          <p className="text-[var(--text-secondary)] text-sm whitespace-pre-wrap">{reply.content}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-[var(--bg-secondary)] p-6 overflow-y-auto">
            {(() => {
              const catsWithTools = CATEGORIES.filter((cat) => tutorial.tools.some((t) => t.category === cat));
              const cfg = getMergedToolConfig(toolTab, customConfigs);
              const tabTools = tutorial.tools.filter((t) => t.category === toolTab);
              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-[var(--accent)]" />{cfg.sectionTitle}
                    </h2>
                    <button onClick={() => setSidebarOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text)]"><X className="w-6 h-6" /></button>
                  </div>
                  {catsWithTools.length > 1 && (
                    <div className="flex flex-wrap gap-1 mb-4 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
                      {catsWithTools.map((cat) => {
                        const count = tutorial.tools.filter((t) => t.category === cat).length;
                        const isActive = toolTab === cat;
                        return (
                          <button key={cat} onClick={() => setToolTab(cat)}
                            className="px-2 py-1 text-xs rounded-md border"
                            style={{
                              color: isActive ? "var(--accent)" : "var(--text-secondary)",
                              backgroundColor: isActive ? "var(--accent-muted)" : "transparent",
                              borderColor: isActive ? "var(--accent)" : "var(--border)",
                            }}
                          >
                            {getMergedToolConfig(cat, customConfigs).sectionTitle} ({count})
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <ul className="space-y-2">
                    {tabTools.map((tool) => (
                      <li key={tool.id}>
                        <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--bg-highlight)]/50 cursor-pointer">
                          <input type="checkbox" checked={toolChecklist.has(tool.id)} onChange={() => toggleTool(tool.id)} className="w-5 h-5 mt-0.5 rounded border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--accent)]" />
                          <div className="flex-1">
                            <span className={toolChecklist.has(tool.id) ? "text-[var(--text-muted)] line-through" : "text-[var(--text)]"}>{tool.name}</span>
                            {(() => {
                              const visibleFields = cfg.fields.filter((f) => {
                                if (f.key === "name") return false;
                                const val = tool[f.key === "amount" ? "quantity" : f.key];
                                return val !== undefined && val !== null && String(val).trim() !== "";
                              });
                              if (visibleFields.length === 0) return null;
                              return (
                                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-xs text-[var(--text-muted)]">
                                  {visibleFields.map((field) => {
                                    const val = tool[field.key === "amount" ? "quantity" : field.key];
                                    return <span key={field.key}>{field.label}: {val}</span>;
                                  })}
                                </div>
                              );
                            })()}
                        </div>
                        </label>
                      </li>
                    ))}
                    {tabTools.length === 0 && <p className="text-[var(--text-muted)] text-sm italic">No {cfg.sectionTitle.toLowerCase()} listed</p>}
                  </ul>
                </>
              );
            })() as unknown as React.ReactNode}
          </div>
        </div>
      )}

      {/* Delete Guide Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-[var(--bg-secondary)] rounded-xl border border-[var(--red)]/30 p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--red)]/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-[var(--red)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)]">Delete Guide</h3>
                <p className="text-sm text-[var(--text-secondary)]">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              Are you sure you want to delete <span className="text-[var(--text)] font-medium">{tutorial.title}</span>? All steps, tools, and comments will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button
                variant="danger"
                loading={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    const res = await fetch(`/api/tutorials/${tutorial.id}`, { method: "DELETE" });
                    if (res.ok) {
                      setShowDeleteModal(false);
                      router.push("/");
                    } else {
                      const data = await res.json();
                      alert(data.error || "Failed to delete guide");
                    }
                  } catch {
                    alert("Network error. Please try again.");
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-1" />Delete Guide
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => { setShowReportModal(false); setReportReason(""); }} />
          <div className="relative bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--red)]/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[var(--red)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)]">Report Tutorial</h3>
                <p className="text-sm text-[var(--text-secondary)]">Help us understand the issue</p>
              </div>
            </div>
            {reportSubmitted ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-[var(--accent)]/20 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <h4 className="text-lg font-semibold text-[var(--text)] mb-1">Report Submitted</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  A moderator will review this tutorial. If the guide is found to be misleading or false, it will be flagged and the author may be actioned.
                </p>
                <Button variant="ghost" onClick={() => { setShowReportModal(false); setReportSubmitted(false); setReportReason(""); setReportDetail(""); setSelectedPreset(""); }}>Close</Button>
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <p className="text-sm font-medium text-[var(--text)] mb-2">What is wrong with this tutorial?</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: "Misleading or false content", desc: "Steps are wrong, outdated, or do not work" },
                      { value: "Spam or duplicate", desc: "Copied from elsewhere or posted multiple times" },
                      { value: "Inappropriate content", desc: "Offensive, NSFW, or breaks community rules" },
                      { value: "Harassment or harm", desc: "Encourages harmful acts or targets individuals" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => { setSelectedPreset(option.value); setReportReason(option.value); }}
                        className={`flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-colors ${
                          selectedPreset === option.value
                            ? "border-[var(--red)] bg-[var(--red)]/10"
                            : "border-[var(--border)] hover:border-[var(--red)]/50 bg-[var(--bg)]"
                        }`}
                      >
                        <span className="text-sm font-medium text-[var(--text)]">{option.value}</span>
                        <span className="text-xs text-[var(--text-secondary)]">{option.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedPreset && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">
                      Add details <span className="text-[var(--text-secondary)]">(optional but helps moderators)</span>
                    </label>
                    <textarea
                      value={reportDetail}
                      onChange={(e) => setReportDetail(e.target.value)}
                      placeholder="Which step is wrong? What actually happens when you try it?"
                      rows={3}
                      className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--red)] resize-none"
                    />
                  </div>
                )}

                <div className="flex gap-3 justify-end">
                  <Button variant="ghost" onClick={() => { setShowReportModal(false); setReportReason(""); setReportDetail(""); setSelectedPreset(""); }}>Cancel</Button>
                  <Button
                    variant="danger"
                    loading={submittingReport}
                    disabled={!selectedPreset}
                    onClick={async () => {
                      if (!selectedPreset) return;
                      const fullReason = reportDetail ? `${reportReason} — ${reportDetail}` : reportReason;
                      setSubmittingReport(true);
                      try {
                        const res = await fetch("/api/reports", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ type: "TUTORIAL", reason: fullReason, tutorialId: tutorial.id }),
                        });
                        if (res.ok) {
                          setReportSubmitted(true);
                        } else {
                          alert("Failed to submit report. Please try again.");
                        }
                      } catch (err) {
                        console.error("Failed to submit report:", err);
                      } finally {
                        setSubmittingReport(false);
                      }
                    }}
                  >Submit Report</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
