"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { User, ArrowLeft, Flag, BookOpen, Calendar } from "lucide-react";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfile {
  id: string;
  name: string;
  profilePicture: string | null;
  backgroundImage: string | null;
  createdAt: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  timeMinutes: number;
  coverImage: string | null;
  published: boolean;
  author: { name: string };
  _count: { steps: number };
  createdAt: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    if (params.id) loadUserProfile();
  }, [params.id]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      // Load user profile via API
      const userRes = await fetch(`/api/users/${params.id}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setProfile(userData);
      } else {
        router.push("/");
        return;
      }

      // Load user's tutorials
      const tutorialsRes = await fetch("/api/tutorials?search=");
      if (tutorialsRes.ok) {
        const data = await tutorialsRes.json();
        const userTutorials = data.tutorials.filter((t: Tutorial) => t.author.name === profile?.name);
        setTutorials(userTutorials);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && tutorials.length === 0) {
      loadTutorialsForUser();
    }
  }, [profile]);

  const loadTutorialsForUser = async () => {
    try {
      const tutorialsRes = await fetch("/api/tutorials?search=");
      if (tutorialsRes.ok) {
        const data = await tutorialsRes.json();
        const userTutorials = data.tutorials.filter((t: Tutorial) => t.author.name === profile?.name);
        setTutorials(userTutorials);
      }
    } catch (error) {
      console.error("Failed to load tutorials:", error);
    }
  };

  const submitReport = async () => {
    if (!reportReason.trim() || !profile) return;
    setSubmittingReport(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "USER", reason: reportReason, reportedUserId: profile.id }),
      });
      if (res.ok) {
        setShowReportModal(false);
        setReportReason("");
        alert("Report submitted. Thank you!");
      }
    } catch (err) {
      console.error("Failed to submit report:", err);
    } finally {
      setSubmittingReport(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--text-secondary)]">User not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Background */}
      <div className="relative h-40 md:h-52 overflow-hidden">
        {profile.backgroundImage ? (
          <img src={profile.backgroundImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/30 via-[var(--bg-secondary)] to-[var(--bg)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to guides
        </Link>

        {/* Profile Header */}
        <div className="relative -mt-16 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] p-6 shadow-lg">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[var(--accent)] flex-shrink-0 border-4 border-[var(--border)]">
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-[#0f0f14]" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-[var(--text)] mb-2">{profile.name}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[var(--text-secondary)] text-sm">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Joined {formatDate(profile.createdAt)}</span>
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" />{tutorials.length} {tutorials.length === 1 ? "guide" : "guides"}</span>
              </div>
            </div>
            {user && user.id !== profile.id && (
              <Button variant="danger" size="sm" onClick={() => setShowReportModal(true)}>
                <Flag className="w-4 h-4 mr-1.5" />Report
              </Button>
            )}
          </div>
        </div>

        {/* User's Tutorials */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--text)]">Guides by {profile.name}</h2>
            <span className="text-sm text-[var(--text-muted)]">{tutorials.length} {tutorials.length === 1 ? "guide" : "guides"}</span>
          </div>
          {tutorials.length === 0 ? (
            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-10 text-center">
              <BookOpen className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-[var(--text-secondary)]">No guides published yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials.map((tutorial) => (
                <Link key={tutorial.id} href={`/tutorial/${tutorial.id}`}>
                  <article className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all hover:-translate-y-1">
                    <div className="aspect-video bg-[var(--bg-highlight)] relative overflow-hidden">
                      {tutorial.coverImage ? (
                        <img src={tutorial.coverImage} alt={tutorial.title} className="w-full h-full object-cover" />
                      ) : (
                        <img src="/images/logo.png" alt="" className="w-full h-full object-contain opacity-30" />
                      )}
                    </div>
                    <div className="p-4">
                      <span className="text-xs font-medium text-[var(--accent)] uppercase">{tutorial.category}</span>
                      <h3 className="mt-2 text-lg font-semibold text-[var(--text)] hover:text-[var(--accent)] transition-colors line-clamp-2">{tutorial.title}</h3>
                      <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2">{tutorial.description}</p>
                      <div className="mt-4 flex items-center justify-between text-sm text-[var(--text-muted)]">
                        <span>{tutorial._count.steps} steps</span>
                        <span>Difficulty {tutorial.difficulty}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => { setShowReportModal(false); setReportReason(""); }} />
          <div className="relative bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Report User</h3>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe the issue with this user..."
              rows={4}
              className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--red)] resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => { setShowReportModal(false); setReportReason(""); }}>Cancel</Button>
              <Button variant="danger" loading={submittingReport} onClick={submitReport}>Submit Report</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
