"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  FileText,
  ScrollText,
  LayoutGrid,
  AlertTriangle,
  Shield,
  CheckCircle,
  Pencil,
  Trash2,
  Ban,
  ArrowLeft,
  Flag,
  UserPlus,
  X,
  Eye,
  EyeOff,
  Lock,
  KeyRound,
  BarChart3,
} from "lucide-react";
import AdminPostAsUser from "@/components/AdminPostAsUser";

interface Stats {
  totalUsers: number;
  totalTutorials: number;
  totalImages: number;
  recentLogs: Array<{
    id: string;
    action: string;
    target: string | null;
    createdAt: string;
    actor: { name: string; email: string };
  }>;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  banned: boolean;
  banReason: string | null;
  createdAt: string;
  ipAddress: string | null;
  _count: { tutorials: number };
}

interface Tutorial {
  id: string;
  title: string;
  author: { name: string; email: string };
  category: string;
  published: boolean;
  locked: boolean;
  lockContent: boolean;
  price: number;
  password: string | null;
  linkOnly: boolean;
  difficulty: number;
  timeMinutes: number;
  coverImage: string | null;
  viewCount: number;
  createdAt: string;
  _count: { steps: number; tools: number };
}

interface Log {
  id: string;
  action: string;
  target: string | null;
  createdAt: string;
  ipAddress: string | null;
  actor: { name: string; email: string };
}

interface Report {
  id: string;
  type: "USER" | "TUTORIAL";
  reason: string;
  status: "PENDING" | "REVIEWED" | "DISMISSED" | "ACTIONED";
  reporter: { id: string; name: string; email: string };
  reportedUser: { id: string; name: string; email: string } | null;
  tutorial: { id: string; title: string } | null;
  adminNote: string | null;
  createdAt: string;
}

type Tab = "dashboard" | "users" | "tutorials" | "logs" | "reports" | "postasuser" | "analytics";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [analytics, setAnalytics] = useState<{
    totalUsers: number;
    ageDistribution: Record<string, number>;
    genderDistribution: Record<string, number>;
    topCountries: { country: string; count: number; percentage: number }[];
    monthlySignups: { month: string; count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState<User | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR"))) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "ADMIN" || user?.role === "MODERATOR") {
      loadData();
    }
  }, [activeTab, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case "dashboard": {
          const res = await fetch("/api/admin/stats");
          if (res.ok) setStats(await res.json());
          break;
        }
        case "users": {
          const params = new URLSearchParams();
          if (searchQuery) params.set("search", searchQuery);
          const res = await fetch(`/api/admin/users?${params}`);
          if (res.ok) setUsers(await res.json());
          break;
        }
        case "tutorials": {
          const params = new URLSearchParams();
          if (searchQuery) params.set("search", searchQuery);
          const res = await fetch(`/api/admin/tutorials?${params}`);
          if (res.ok) setTutorials(await res.json());
          break;
        }
        case "logs": {
          const res = await fetch("/api/admin/logs?limit=50");
          if (res.ok) {
            const data = await res.json();
            setLogs(data.logs);
          }
          break;
        }
        case "reports": {
          const res = await fetch("/api/admin/reports");
          if (res.ok) {
            const data = await res.json();
            setReports(data.reports);
          }
          break;
        }
        case "analytics": {
          const res = await fetch("/api/admin/analytics");
          if (res.ok) setAnalytics(await res.json());
          break;
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: { role?: string; banned?: boolean; banReason?: string }) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    setActionLoading(userId);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        await loadData();
      } else {
        setDeleteError(data.error || "Failed to delete user.");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      setDeleteError("Network error. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteTutorial = async (tutorialId: string) => {
    if (!confirm("Are you sure you want to delete this tutorial?")) return;
    setActionLoading(tutorialId);
    try {
      const res = await fetch(`/api/admin/tutorials/${tutorialId}`, { method: "DELETE" });
      if (res.ok) await loadData();
    } catch (error) {
      console.error("Failed to delete tutorial:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const unlockTutorial = async (tutorialId: string) => {
    if (!confirm("Remove password protection from this guide? It will become public.")) return;
    setActionLoading(tutorialId);
    try {
      const res = await fetch(`/api/admin/tutorials/${tutorialId}/unlock`, { method: "POST" });
      if (res.ok) {
        await loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to unlock tutorial");
      }
    } catch (error) {
      console.error("Failed to unlock tutorial:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const resolveReport = async (reportId: string, status: "DISMISSED" | "ACTIONED", adminNote?: string) => {
    setActionLoading(reportId);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote }),
      });
      if (res.ok) await loadData();
    } catch (error) {
      console.error("Failed to resolve report:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const formatAction = (action: string) =>
    action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)]-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users, adminOnly: true },
    { id: "tutorials", label: "Content", icon: FileText },
    { id: "logs", label: "Logs", icon: ScrollText, adminOnly: true },
    { id: "reports", label: "Reports", icon: Flag, adminOnly: true },
    { id: "postasuser", label: "Post as User", icon: UserPlus, adminOnly: true },
    { id: "analytics", label: "Analytics", icon: BarChart3, adminOnly: true },
  ] as const;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Admin Header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href="/" className="text-[var(--text-secondary)]400 hover:text-[var(--text)] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Shield className="w-6 h-6 text-[var(--accent)]-400" />
            <h1 className="text-xl font-bold text-[var(--text)]">Admin Panel</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-48 flex-shrink-0">
            <nav className="space-y-1">
              {tabs
                .filter((tab) => !("adminOnly" in tab && tab.adminOnly && user.role !== "ADMIN"))
                .map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-[var(--accent)]-500/20 text-[var(--accent)]-400"
                        : "text-[var(--text-secondary)]400 hover:bg-[var(--bg-secondary)] hover:text-[var(--text)]"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[var(--text)]">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "accent" },
                    { label: "Total Tutorials", value: stats?.totalTutorials, icon: FileText, color: "cyan" },
                    { label: "Total Images", value: stats?.totalImages, icon: LayoutGrid, color: "purple" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg bg-[var(--${color})]-500/20 flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 text-[var(--${color})]-400`} />
                        </div>
                        <div>
                          <p className="text-sm text-[var(--text-secondary)]400">{label}</p>
                          <p className="text-2xl font-bold text-[var(--text)]">{value ?? "-"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
                  <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Recent Activity</h3>
                  {loading ? <p className="text-[var(--text-secondary)]400">Loading...</p>
                   : stats?.recentLogs.length === 0 ? <p className="text-[var(--text-secondary)]500 italic">No recent activity</p>
                   : (
                    <div className="space-y-3">
                      {stats?.recentLogs.map((log) => (
                        <div key={log.id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                          <div className="w-2 h-2 rounded-full bg-[var(--accent)]-500" />
                          <span className="flex-1 text-sm text-[var(--text-secondary)]300">
                            <span className="text-[var(--accent)]-400">{log.actor.name}</span>{" "}
                            {formatAction(log.action).toLowerCase()}
                            {log.target && <span className="text-[var(--text-secondary)]500"> (target: {log.target})</span>}
                          </span>
                          <span className="text-xs text-[var(--text-secondary)]500">{formatDate(log.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-[var(--text)]">User Management</h2>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && loadData()}
                      className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 placeholder:text-[var(--text-secondary)]500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500"
                    />
                    <button
                      onClick={() => { setShowAddModal(true); setModalError(""); }}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)]-500 hover:bg-[var(--accent)]-600 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
                    >
                      <UserPlus className="w-4 h-4" /> Add User
                    </button>
                  </div>
                </div>

                {deleteError && (
                  <div className="flex items-center gap-3 p-4 bg-[var(--red)]-500/10 border border-[var(--red)]-500/30 rounded-lg text-[var(--red)] text-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    {deleteError}
                    <button onClick={() => setDeleteError(null)} className="ml-auto text-[var(--red)]-400 hover:text-[var(--red)]-500"><X className="w-4 h-4" /></button>
                  </div>
                )}

                <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        {["User", "Role", "Status", "Tutorials", "Joined", "Signup IP", "Ban Reason", "Actions"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)]400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {loading ? (
                        <tr><td colSpan={8} className="px-4 py-8 text-center text-[var(--text-secondary)]400">Loading...</td></tr>
                      ) : users.length === 0 ? (
                        <tr><td colSpan={8} className="px-4 py-8 text-center text-[var(--text-secondary)]400">No users found</td></tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u.id} className="hover:bg-[var(--bg-highlight)]/30">
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-sm font-medium text-[var(--text)]">{u.name}</p>
                                <p className="text-xs text-[var(--text-secondary)]400 break-all">{u.email}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                u.role === "ADMIN" ? "bg-[var(--purple)]-500/20 text-[var(--purple)]-400"
                                : u.role === "MODERATOR" ? "bg-[var(--cyan)]-500/20 text-[var(--cyan)]-400"
                                : "bg-slate-600/50 text-[var(--text-secondary)]300"}`}>{u.role}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${u.banned ? "bg-[var(--red)]-500/20 text-[var(--red)]-400" : "bg-[var(--accent)]-500/20 text-[var(--accent)]-400"}`}>
                                {u.banned ? "Banned" : "Active"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-[var(--text-secondary)]300">{u._count.tutorials}</td>
                            <td className="px-4 py-3 text-sm text-[var(--text-secondary)]400">{formatDate(u.createdAt)}</td>
                            <td className="px-4 py-3 text-sm text-[var(--text-secondary)]400 font-mono">{u.ipAddress || "-"}</td>
                            <td className="px-4 py-3 text-sm text-[var(--text-secondary)]400">
                              {u.banReason ? <span className="text-[var(--red)] text-xs" title={u.banReason}>{u.banReason.length > 25 ? u.banReason.slice(0, 25) + "…" : u.banReason}</span> : <span className="text-[var(--text-muted)]">-</span>}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                {/* Edit */}
                                <button onClick={() => { setShowEditModal(u); setModalError(""); }}
                                  disabled={actionLoading === u.id}
                                  className="p-1.5 text-[var(--text-secondary)]400 hover:text-[var(--accent)]-400 transition-colors" title="Edit User">
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                {/* Reset Password */}
                                <button onClick={() => { setShowResetModal(u); setModalError(""); setResetSuccess(""); }}
                                  disabled={actionLoading === u.id}
                                  className="p-1.5 text-[var(--text-secondary)]400 hover:text-[#e6c866]-400 transition-colors" title="Reset Password">
                                  <Shield className="w-4 h-4" />
                                </button>
                                {/* Ban/Unban */}
                                <button
                                  onClick={() => u.banned ? updateUser(u.id, { banned: false }) : (() => {
                                    const reason = window.prompt("Reason for banning (optional):");
                                    updateUser(u.id, { banned: true, banReason: reason || undefined });
                                  })()}
                                  disabled={actionLoading === u.id}
                                  className={`p-1.5 transition-colors ${u.banned ? "text-[var(--text-secondary)]400 hover:text-[var(--accent)]-400" : "text-[var(--text-secondary)]400 hover:text-[#e6c866]-400"}`}
                                  title={u.banned ? "Unban" : "Ban"}>
                                  <Ban className="w-4 h-4" />
                                </button>
                                {/* Delete */}
                                <button onClick={() => deleteUser(u.id)}
                                  disabled={actionLoading === u.id || u.id === user.id}
                                  className="p-1.5 text-[var(--text-secondary)]400 hover:text-[var(--red)]-400 transition-colors disabled:opacity-30" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tutorials Tab */}
            {activeTab === "tutorials" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[var(--text)]">Content Moderation</h2>
                  <input
                    type="text" placeholder="Search tutorials..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadData()}
                    className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 placeholder:text-[var(--text-secondary)]500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500"
                  />
                </div>
                <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        {["Tutorial", "Author", "Category", "Status", "Created", "Actions"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)]400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--text-secondary)]400">Loading...</td></tr>
                       : tutorials.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--text-secondary)]400">No tutorials found</td></tr>
                       : tutorials.map((t) => (
                        <tr key={t.id} className="hover:bg-[var(--bg-highlight)]/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {t.password && <span title="Password protected"><Lock className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0" /></span>}
                              <p className="text-sm font-medium text-[var(--text)] truncate">{t.title}</p>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)]400">{t._count.steps} steps, {t._count.tools} tools</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--text-secondary)]300">{t.author.name}</td>
                          <td className="px-4 py-3"><span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-[var(--accent)]-500/20 text-[var(--accent)]-400">{t.category}</span></td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              {t.password ? (
                                t.linkOnly ? (
                                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-[var(--red)]-500/20 text-[var(--red)]-400">Link + Password</span>
                                ) : (
                                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-[var(--orange)]-500/20 text-[var(--orange)]-400">Password Only</span>
                                )
                              ) : t.linkOnly ? (
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-[var(--purple)]-500/20 text-[var(--purple)]-400">Link Only</span>
                              ) : (
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${t.published ? "bg-[var(--accent)]-500/20 text-[var(--accent)]-400" : "bg-[#e6c866]-500/20 text-[#e6c866]-400"}`}>
                                  {t.published ? "Public" : "Draft"}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--text-secondary)]400">{formatDate(t.createdAt)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {t.password && (
                                <button onClick={() => unlockTutorial(t.id)} disabled={actionLoading === t.id} className="p-1.5 text-[var(--text-secondary)]400 hover:text-[#aad94c]-400 transition-colors" title="Remove password (make public)">
                                  <KeyRound className="w-4 h-4" />
                                </button>
                              )}
                              <Link href={`/edit/${t.id}`} className="p-1.5 text-[var(--text-secondary)]400 hover:text-[var(--cyan)]-400 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></Link>
                              <Link href={`/tutorial/${t.id}`} className="p-1.5 text-[var(--text-secondary)]400 hover:text-[var(--accent)]-400 transition-colors" title="View"><Eye className="w-4 h-4" /></Link>
                              <button onClick={() => deleteTutorial(t.id)} disabled={actionLoading === t.id} className="p-1.5 text-[var(--text-secondary)]400 hover:text-[var(--red)]-400 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === "logs" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[var(--text)]">System Logs</h2>
                <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        {["Timestamp", "Action", "Actor", "Target", "IP Address"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)]400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {loading ? <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--text-secondary)]400">Loading...</td></tr>
                       : logs.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--text-secondary)]400">No logs recorded</td></tr>
                       : logs.map((log) => (
                        <tr key={log.id} className="hover:bg-[var(--bg-highlight)]/30">
                          <td className="px-4 py-3 text-sm text-[var(--text-secondary)]400">{formatDate(log.createdAt)}</td>
                          <td className="px-4 py-3"><span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-slate-600/50 text-[var(--text-secondary)]300">{formatAction(log.action)}</span></td>
                          <td className="px-4 py-3"><div><p className="text-sm text-[var(--text)]">{log.actor.name}</p><p className="text-xs text-[var(--text-secondary)]500">{log.actor.email}</p></div></td>
                          <td className="px-4 py-3 text-sm text-[var(--text-secondary)]400">{log.target || "-"}</td>
                          <td className="px-4 py-3 text-sm text-[var(--text-secondary)]400 font-mono">{log.ipAddress || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[var(--text)]">User Reports</h2>
                <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        {["Type", "Reason", "Reporter", "Reported", "Status", "Date", "Actions"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)]400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-[var(--text-secondary)]400">Loading...</td></tr>
                       : reports.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-[var(--text-secondary)]400">No reports filed</td></tr>
                       : reports.map((report) => (
                        <tr key={report.id} className={`hover:bg-[var(--bg-highlight)]/30 ${report.reason.includes("Misleading") && report.status === "PENDING" ? "bg-[var(--red)]/5" : ""}`}>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${report.type === "USER" ? "bg-[var(--red)]/20 text-[var(--red)]" : "bg-[var(--accent)]/20 text-[var(--accent)]"}`}>{report.type}</span>
                            {report.reason.includes("Misleading") && <span className="ml-1 inline-flex px-1.5 py-0.5 text-xs font-medium rounded bg-[var(--red)]/30 text-[var(--red)] border border-[var(--red)]/30">Misleading</span>}
                          </td>
                          <td className="px-4 py-3"><p className="text-sm text-[var(--text)] max-w-xs" title={report.reason}>{report.reason.length > 60 ? report.reason.slice(0, 60) + "…" : report.reason}</p></td>
                          <td className="px-4 py-3"><div><p className="text-sm text-[var(--text)]">{report.reporter.name}</p><p className="text-xs text-[var(--text-secondary)]500">{report.reporter.email}</p></div></td>
                          <td className="px-4 py-3">
                            {report.type === "USER" && report.reportedUser ? <div><p className="text-sm text-[var(--text)]">{report.reportedUser.name}</p><p className="text-xs text-[var(--text-secondary)]500">{report.reportedUser.email}</p></div>
                             : report.tutorial ? <div><p className="text-sm text-[var(--text)]">{report.tutorial.title}</p><a href={`/tutorial/${report.tutorial.id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent)] hover:underline">View →</a></div>
                             : <span className="text-[var(--text-secondary)]500">-</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              report.status === "PENDING" ? "bg-[#e6c866]/20 text-[#e6c866]"
                              : report.status === "REVIEWED" ? "bg-[var(--cyan)]/20 text-[var(--cyan)]"
                              : report.status === "DISMISSED" ? "bg-[#8b8e96]/20 text-[var(--text-secondary)]"
                              : "bg-[#aad94c]/20 text-[#aad94c]"}`}>{report.status}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--text-secondary)]400">{formatDate(report.createdAt)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {report.status === "PENDING" && (
                                <>
                                  <button onClick={() => resolveReport(report.id, "DISMISSED")} disabled={actionLoading === report.id}
                                    className="px-3 py-1 text-xs font-medium rounded-lg bg-[#8b8e96]/20 text-[var(--text-secondary)] hover:bg-[#8b8e96]/30 transition-colors">Dismiss</button>
                                  <button onClick={() => resolveReport(report.id, "ACTIONED")} disabled={actionLoading === report.id}
                                    className="px-3 py-1 text-xs font-medium rounded-lg bg-[var(--red)]/20 text-[var(--red)] hover:bg-[var(--red)]/30 transition-colors">Action</button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Post as User Tab */}
            {activeTab === "postasuser" && <AdminPostAsUser />}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--text)] mb-1">User Analytics</h2>
                  <p className="text-sm text-[var(--text-muted)]">Demographic data for all registered users</p>
                </div>

                {loading ? (
                  <div className="text-center py-12 text-[var(--text-secondary)]">Loading...</div>
                ) : analytics ? (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5">
                        <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">Total Users</p>
                        <p className="text-3xl font-bold text-[var(--text)]">{analytics.totalUsers.toLocaleString()}</p>
                      </div>
                      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5">
                        <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">Top Country</p>
                        <p className="text-3xl font-bold text-[var(--text)]">{analytics.topCountries[0]?.country || "N/A"}</p>
                        <p className="text-sm text-[var(--text-muted)]">{analytics.topCountries[0]?.percentage || 0}% of users</p>
                      </div>
                      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5">
                        <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">Top Gender</p>
                        <p className="text-3xl font-bold text-[var(--text)]">
                          {Object.entries(analytics.genderDistribution).sort(([,a],[,b]) => b-a)[0]?.[0] || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Monthly Signups Chart */}
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5">
                      <h3 className="text-base font-semibold text-[var(--text)] mb-4">Monthly Signups (Last 12 Months)</h3>
                      <div className="flex items-end gap-1 h-40">
                        {analytics.monthlySignups.map((m, i) => {
                          const max = Math.max(...analytics.monthlySignups.map(x => x.count), 1);
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <div className="w-full bg-[var(--accent)] rounded-t transition-all hover:opacity-80" style={{ height: `${Math.max((m.count / max) * 100, 4)}%` }} />
                              <span className="text-xs text-[var(--text-muted)] -rotate-45 origin-center whitespace-nowrap">{m.month}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Age Distribution */}
                      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5">
                        <h3 className="text-base font-semibold text-[var(--text)] mb-4">Age Distribution</h3>
                        <div className="space-y-3">
                          {Object.entries(analytics.ageDistribution).map(([group, count]) => {
                            const pct = analytics.totalUsers > 0 ? Math.round((count / analytics.totalUsers) * 100) : 0;
                            return (
                              <div key={group}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-[var(--text-secondary)]">{group}</span>
                                  <span className="text-[var(--text-muted)]">{count} ({pct}%)</span>
                                </div>
                                <div className="h-2 bg-[var(--bg)] rounded-full overflow-hidden">
                                  <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Gender Distribution */}
                      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5">
                        <h3 className="text-base font-semibold text-[var(--text)] mb-4">Gender Distribution</h3>
                        <div className="space-y-3">
                          {Object.entries(analytics.genderDistribution)
                            .sort(([,a],[,b]) => b - a)
                            .map(([gender, count]) => {
                              const pct = analytics.totalUsers > 0 ? Math.round((count / analytics.totalUsers) * 100) : 0;
                              return (
                                <div key={gender}>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-[var(--text-secondary)]">{gender}</span>
                                    <span className="text-[var(--text-muted)]">{count} ({pct}%)</span>
                                  </div>
                                  <div className="h-2 bg-[var(--bg)] rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--orange)] rounded-full transition-all" style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* Country Distribution */}
                      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5">
                        <h3 className="text-base font-semibold text-[var(--text)] mb-4">Top Countries</h3>
                        <div className="space-y-3">
                          {analytics.topCountries.slice(0, 10).map(({ country, count, percentage }) => (
                            <div key={country}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-[var(--text-secondary)]">{country}</span>
                                <span className="text-[var(--text-muted)]">{count} ({percentage}%)</span>
                              </div>
                              <div className="h-2 bg-[var(--bg)] rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--cyan)] rounded-full transition-all" style={{ width: `${percentage}%` }} />
                              </div>
                            </div>
                          ))}
                          {analytics.topCountries.length === 0 && (
                            <p className="text-sm text-[var(--text-muted)] text-center py-4">No country data yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-[var(--text-secondary)]">Failed to load analytics</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add User Modal ── */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={async (newUser) => {
            setShowAddModal(false);
            await loadData();
          }}
        />
      )}

      {/* ── Edit User Modal ── */}
      {showEditModal && (
        <EditUserModal
          user={showEditModal}
          onClose={() => setShowEditModal(null)}
          onSuccess={async () => {
            setShowEditModal(null);
            await loadData();
          }}
        />
      )}

      {/* ── Reset Password Modal ── */}
      {showResetModal && (
        <ResetPasswordModal
          user={showResetModal}
          onClose={() => setShowResetModal(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Add User Modal
// ─────────────────────────────────────────────
function AddUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (u: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) { setError("All fields are required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create user."); return; }
      onSuccess(data);
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--text)]">Add New User</h3>
          <button onClick={onClose} className="text-[var(--text-secondary)]400 hover:text-[var(--text)]"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-[var(--red)]-500/10 border border-[var(--red)]-500/30 rounded-lg text-[var(--red)] text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">Full Name <span className="text-[var(--red)]">*</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60}
              placeholder="Jane Doe" className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 placeholder:text-[var(--text-secondary)]500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">Email <span className="text-[var(--red)]">*</span></label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={120}
              placeholder="jane@example.com" className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 placeholder:text-[var(--text-secondary)]500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">Password <span className="text-[var(--red)]">*</span></label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                placeholder="Min 6 characters" className="w-full px-4 py-2 pr-10 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 placeholder:text-[var(--text-secondary)]500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]400 hover:text-[var(--text)]">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as "USER" | "MODERATOR" | "ADMIN")}
              className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500">
              <option value="USER">User</option>
              <option value="MODERATOR">Moderator</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[var(--text-secondary)]400 hover:text-[var(--text)] transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 bg-[var(--accent)]-500 hover:bg-[var(--accent)]-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Edit User Modal
// ─────────────────────────────────────────────
function EditUserModal({ user, onClose, onSuccess }: { user: User; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to update user."); return; }
      onSuccess();
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--text)]">Edit User</h3>
          <button onClick={onClose} className="text-[var(--text-secondary)]400 hover:text-[var(--text)]"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-[var(--red)]-500/10 border border-[var(--red)]-500/30 rounded-lg text-[var(--red)] text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60}
              className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={120}
              className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as "USER" | "MODERATOR" | "ADMIN")}
              className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500">
              <option value="USER">User</option>
              <option value="MODERATOR">Moderator</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[var(--text-secondary)]400 hover:text-[var(--text)] transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 bg-[var(--accent)]-500 hover:bg-[var(--accent)]-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Reset Password Modal
// ─────────────────────────────────────────────
function ResetPasswordModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to reset password."); return; }
      setSuccess(data.tempPassword);
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--text)]">Reset Password</h3>
          <button onClick={onClose} className="text-[var(--text-secondary)]400 hover:text-[var(--text)]"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-[var(--text-secondary)]300">
            Set a new temporary password for <strong className="text-[var(--text)]">{user.name}</strong>.
            Share the password with them — it will be shown below after reset.
          </p>
          {error && <div className="p-3 bg-[var(--red)]-500/10 border border-[var(--red)]-500/30 rounded-lg text-[var(--red)] text-sm">{error}</div>}
          {success ? (
            <div className="p-4 bg-[var(--accent)]-500/10 border border-[var(--accent)]-500/30 rounded-lg">
              <p className="text-sm font-medium text-[var(--accent)]-400 mb-2">New password set!</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-[var(--bg)] border border-[var(--accent)]-500/30 rounded text-sm text-[var(--text)] font-mono">{success}</code>
                <button onClick={() => navigator.clipboard.writeText(success)}
                  className="px-3 py-2 bg-[var(--accent)]-500/20 text-[var(--accent)]-400 text-xs font-medium rounded-lg hover:bg-[var(--accent)]-500/30 transition-colors">
                  Copy
                </button>
              </div>
              <p className="text-xs text-[var(--text-secondary)]500 mt-2">This password will not be shown again.</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">New Password <span className="text-[var(--red)]">*</span></label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                    placeholder="Min 6 characters" className="w-full px-4 py-2 pr-10 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 placeholder:text-[var(--text-secondary)]500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]400 hover:text-[var(--text)]">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[var(--text-secondary)]400 hover:text-[var(--text)] transition-colors">Cancel</button>
                <button type="submit" disabled={loading}
                  className="px-5 py-2 bg-[#e6c866] hover:bg-[#e6c866]/80 disabled:opacity-50 text-black text-sm font-medium rounded-lg transition-colors">
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
