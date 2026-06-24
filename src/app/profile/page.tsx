"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { User, Settings, BookOpen, Edit2, Trash2, Plus, Eye, Grid, List, Save, Shield, AlertCircle, Camera, Image as ImageIcon, Lock } from "lucide-react";
import Link from "next/link";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  timeMinutes: number;
  coverImage: string | null;
  published: boolean;
  locked: boolean;
  lockContent: boolean;
  price: number;
  author: { id: string; name: string };
  _count: { steps: number };
  createdAt: string;
}

interface PurchaseEntry {
  id: string;
  createdAt: string;
  tutorial: Tutorial;
}

interface UserStats {
  totalTutorials: number;
  publishedTutorials: number;
  draftTutorials: number;
  totalSteps: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, refresh, logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"overview" | "tutorials" | "library" | "settings">("overview");
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [purchases, setPurchases] = useState<PurchaseEntry[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [saving, setSaving] = useState(false);

  // Image upload states
  const [profilePicture, setProfilePicture] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);

  // Preferences
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [defaultCategory, setDefaultCategory] = useState("");
  const [defaultDifficulty, setDefaultDifficulty] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
      setProfilePicture(user.profilePicture || "");
      setBackgroundImage(user.backgroundImage || "");
      // @ts-ignore - age/gender/country may not exist on user type yet
      setEditAge(user.age ? String(user.age) : "");
      // @ts-ignore
      setEditGender(user.gender || "");
      // @ts-ignore
      setEditCountry(user.country || "");
      loadUserData();
      loadPreferences();
    }
  }, [user]);

  // Load purchases when switching to library tab
  useEffect(() => {
    if (activeTab === "library" && user) {
      setLoadingPurchases(true);
      fetch("/api/tutorials/purchase")
        .then((res) => res.ok ? res.json() : null)
        .then((data) => { if (data) setPurchases(data.purchases || []); })
        .catch(() => {})
        .finally(() => setLoadingPurchases(false));
    }
  }, [activeTab, user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tutorials?search=");
      if (res.ok) {
        const data = await res.json();
        const userTutorials = data.tutorials.filter((t: Tutorial) => t.author.name === user?.name);
        setTutorials(userTutorials);
        setStats({
          totalTutorials: userTutorials.length,
          publishedTutorials: userTutorials.filter((t: Tutorial) => t.published).length,
          draftTutorials: userTutorials.filter((t: Tutorial) => !t.published).length,
          totalSteps: userTutorials.reduce((acc: number, t: Tutorial) => acc + t._count.steps, 0),
        });
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = () => {
    const prefs = localStorage.getItem("stephud_prefs");
    if (prefs) {
      const p = JSON.parse(prefs);
      setViewMode(p.viewMode || "grid");
      setDefaultCategory(p.defaultCategory || "");
      setDefaultDifficulty(p.defaultDifficulty || "");
    }
  };

  const savePreferences = () => {
    const prefs = { viewMode, defaultCategory, defaultDifficulty };
    localStorage.setItem("stephud_prefs", JSON.stringify(prefs));
    showToast("Preferences saved!", "success");
  };

  const uploadImage = async (file: File, type: "profile" | "background"): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      console.log("Upload API response status:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("Upload API response data:", data);
        return data.url;
      } else if (res.status === 401) {
        console.error("Upload failed: Unauthorized - cookie may be missing");
        showToast("Session expired. Please log in again.", "error");
        try { await logout(); } catch { /* ignore */ }
        router.push("/login");
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Upload API error:", errorData);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
    return null;
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user) {
      showToast("Please log in to upload a profile picture", "error");
      return;
    }
    setUploadingProfile(true);
    try {
      const url = await uploadImage(file, "profile");
      console.log("Upload returned URL:", url);
      if (url) {
        setProfilePicture(url);
        // Auto-save profile picture to database
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            name: user?.name, 
            email: user?.email,
            profilePicture: url,
            backgroundImage: backgroundImage || null,
          }),
        });
        console.log("Profile API response status:", res.status);
        if (res.ok) {
          const data = await res.json();
          console.log("Profile API response data:", data);
          try { await refresh(); } catch (e) { console.error("Refresh failed:", e); }
          showToast("Profile picture saved!", "success");
        } else {
          const data = await res.json().catch(() => ({}));
          console.error("Profile update failed:", data);
          showToast(data.error || "Failed to save profile picture", "error");
        }
      } else {
        console.error("Upload returned null URL");
        showToast("Upload failed - please try again", "error");
      }
    } catch (err) {
      console.error("Failed to save profile picture:", err);
      showToast("Failed to save profile picture", "error");
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleBackgroundChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user) {
      showToast("Please log in to upload a background image", "error");
      return;
    }
    setUploadingBg(true);
    try {
      const url = await uploadImage(file, "background");
      console.log("Background upload returned URL:", url);
      if (url) {
        setBackgroundImage(url);
        // Auto-save background to database
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            name: user?.name, 
            email: user?.email,
            profilePicture: profilePicture || null,
            backgroundImage: url,
          }),
        });
        console.log("Background Profile API response status:", res.status);
        if (res.ok) {
          const data = await res.json();
          console.log("Background Profile API response data:", data);
          try { await refresh(); } catch (e) { console.error("Refresh failed:", e); }
          showToast("Background image saved!", "success");
        } else {
          const data = await res.json().catch(() => ({}));
          console.error("Background update failed:", data);
          showToast(data.error || "Failed to save background", "error");
        }
      } else {
        console.error("Background upload returned null URL");
        showToast("Upload failed - please try again", "error");
      }
    } catch (err) {
      console.error("Failed to save background:", err);
      showToast("Failed to save background", "error");
    } finally {
      setUploadingBg(false);
    }
  };

  const updateProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: editName, 
          email: editEmail,
          profilePicture: profilePicture || null,
          backgroundImage: backgroundImage || null,
          age: editAge ? parseInt(editAge) : null,
          gender: editGender || null,
          country: editCountry || null,
        }),
      });
      if (res.ok) {
        await refresh();
        setEditMode(false);
        showToast("Profile updated!", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to update", "error");
      }
    } catch {
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteTutorial = async (id: string) => {
    if (!confirm("Delete this tutorial?")) return;
    try {
      const res = await fetch(`/api/tutorials/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTutorials(tutorials.filter((t) => t.id !== id));
        showToast("Tutorial deleted", "success");
      }
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>;
  }

  const roleColors = {
    ADMIN: "bg-[var(--purple)]/20 text-[var(--purple)]",
    MODERATOR: "bg-[var(--cyan)]/20 text-[var(--cyan)]",
    USER: "bg-[#8b8e96]/20 text-[var(--text-secondary)]",
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Profile Header with Background */}
      <div className="relative h-40 md:h-52 overflow-hidden">
        {backgroundImage ? (
          <img src={backgroundImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/30 via-[var(--bg-secondary)] to-[var(--bg)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent" />

        {/* Background upload button */}
        <label className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg cursor-pointer hover:bg-black/70 transition-colors z-10">
          <ImageIcon className="w-4 h-4 text-white" />
          <span className="text-sm text-white">Change Cover</span>
          <input type="file" accept="image/*" onChange={handleBackgroundChange} className="hidden" />
        </label>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Info Row */}
        <div className="relative -mt-16 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] p-6 shadow-lg">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full border-4 border-[var(--border)] overflow-hidden bg-[var(--bg-secondary)] shadow-md">
                {profilePicture ? (
                  <img src={profilePicture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[var(--accent)]">
                    <User className="w-12 h-12 text-[#0f0f14]" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-1 right-1 w-7 h-7 bg-[var(--accent)] rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--accent-hover)] transition-colors shadow-md">
                <Camera className="w-3.5 h-3.5 text-[#0f0f14]" />
                <input type="file" accept="image/*" onChange={handleProfilePictureChange} className="hidden" />
              </label>
            </div>

            {/* Name + Email */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl font-bold text-[var(--text)]">{user.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>{user.role}</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {!editMode ? (
                <Button variant="secondary" size="sm" onClick={() => setEditMode(true)}><Edit2 className="w-4 h-4 mr-1.5" />Edit Profile</Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setEditMode(false)}>Cancel</Button>
                  <Button size="sm" onClick={updateProfile} loading={saving}><Save className="w-4 h-4 mr-1.5" />Save</Button>
                </>
              )}
            </div>
          </div>

          {editMode && (
            <div className="mt-4 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Profile Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Display Name" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your name" />
                <Input label="Email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="your@email.com" />
                <Input label="Age" type="number" value={editAge} onChange={(e) => setEditAge(e.target.value)} placeholder="Your age" min="1" max="120" />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Gender</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <Input label="Country" value={editCountry} onChange={(e) => setEditCountry(e.target.value)} placeholder="e.g. United States" />
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[var(--bg-secondary)] rounded-xl p-1.5 border border-[var(--border)]">
          {[
            { id: "overview", label: "Overview", icon: BookOpen },
            { id: "tutorials", label: "My Tutorials", icon: BookOpen },
            { id: "library", label: "Library", icon: Lock },
            { id: "settings", label: "Preferences", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? "bg-[var(--accent)] text-[#0f0f14] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-highlight)]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Guides", value: stats?.totalTutorials ?? 0, color: "text-[var(--accent)]", icon: BookOpen },
                { label: "Published", value: stats?.publishedTutorials ?? 0, color: "text-[#aad94c]", icon: BookOpen },
                { label: "Drafts", value: stats?.draftTutorials ?? 0, color: "text-[#e6c866]", icon: BookOpen },
                { label: "Total Steps", value: stats?.totalSteps ?? 0, color: "text-[var(--cyan)]", icon: BookOpen },
              ].map((stat) => (
                <div key={stat.label} className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-5 hover:border-[var(--border-light)] transition-colors">
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Tutorials */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--text)]">Recent Guides</h2>
                {tutorials.length > 0 && (
                  <button onClick={() => setActiveTab("tutorials")} className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium">View all →</button>
                )}
              </div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-[var(--bg-secondary)] rounded-xl animate-pulse" />)}
                </div>
              ) : tutorials.length === 0 ? (
                <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-10 text-center">
                  <BookOpen className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                  <p className="text-[var(--text-secondary)] mb-4">You haven&apos;t created any guides yet</p>
                  <Link href="/create"><Button size="sm"><Plus className="w-4 h-4 mr-1.5" />Create Your First Guide</Button></Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tutorials.slice(0, 3).map((tutorial) => (
                    <Link key={tutorial.id} href={`/tutorial/${tutorial.id}`}>
                      <div className="group bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/40 p-4 transition-all hover:-translate-y-0.5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tutorial.published ? "bg-[#aad94c]/20 text-[#aad94c]" : "bg-[#e6c866]/20 text-[#e6c866]"}`}>
                            {tutorial.published ? "Published" : "Draft"}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">{tutorial.category}</span>
                        </div>
                        <h3 className="font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">{tutorial.title}</h3>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">{tutorial._count.steps} steps</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tutorials Tab */}
        {activeTab === "tutorials" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text)]">My Tutorials ({tutorials.length})</h2>
              <Link href="/create"><Button size="sm"><Plus className="w-4 h-4 mr-1" />New Guide</Button></Link>
            </div>

            {loading ? (
              <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-[var(--bg-secondary)] rounded-xl animate-pulse" />)}</div>
            ) : tutorials.length === 0 ? (
              <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-8 text-center">
                <p className="text-[var(--text-secondary)] mb-4">No tutorials yet</p>
                <Link href="/create"><Button>Create Guide</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {tutorials.map((tutorial) => (
                  <div key={tutorial.id} className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-4 flex items-center gap-4">
                    <div className="w-24 h-16 bg-[var(--bg-highlight)] rounded-lg overflow-hidden flex-shrink-0">
                      {tutorial.coverImage && <img src={tutorial.coverImage} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${tutorial.published ? "bg-[#aad94c]/20 text-[#aad94c]" : "bg-[#e6c866]/20 text-[#e6c866]"}`}>
                          {tutorial.published ? "Published" : "Draft"}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">{tutorial.category}</span>
                      </div>
                      <h3 className="font-semibold text-[var(--text)] truncate">{tutorial.title}</h3>
                      <p className="text-xs text-[var(--text-muted)]">{tutorial._count.steps} steps • Difficulty {tutorial.difficulty}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link href={`/tutorial/${tutorial.id}`}><Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button></Link>
                      <Button variant="danger" size="sm" onClick={() => deleteTutorial(tutorial.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Library Tab — purchased guides */}
        {activeTab === "library" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text)]">My Library ({purchases.length})</h2>
            </div>
            {loadingPurchases ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-[var(--bg-secondary)] rounded-xl animate-pulse" />)}
              </div>
            ) : purchases.length === 0 ? (
              <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-8 text-center">
                <Lock className="w-12 h-12 text-[#3a3a4d] mx-auto mb-3" />
                <p className="text-[var(--text-secondary)] mb-4">Your library is empty</p>
                <p className="text-sm text-[var(--text-muted)] mb-4">Guides you unlock will appear here</p>
                <Link href="/"><Button size="sm">Browse Guides</Button></Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {purchases.map((purchase) => (
                  <Link key={purchase.id} href={`/tutorial/${purchase.tutorial.id}`}>
                    <div className="group bg-[var(--bg-secondary)] rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all hover:-translate-y-1">
                      <div className="aspect-video bg-[var(--bg-highlight)] relative overflow-hidden">
                        {purchase.tutorial.coverImage ? (
                          <img src={purchase.tutorial.coverImage} alt={purchase.tutorial.title} className="w-full h-full object-cover" />
                        ) : (
                          <img src="/images/logo.png" alt="" className="w-full h-full object-contain opacity-30" />
                        )}
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#aad94c]/20 text-[#aad94c] flex items-center gap-1">
                            <Lock className="w-3 h-3" />Unlocked
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{purchase.tutorial.category}</span>
                        <h3 className="font-semibold text-[var(--text)] mt-1 group-hover:text-[var(--accent)] transition-colors truncate">{purchase.tutorial.title}</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{purchase.tutorial._count.steps} steps • by {purchase.tutorial.author.name}</p>
                        <p className="text-xs text-[#3a3a4d] mt-1">Purchased {new Date(purchase.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* View Preferences */}
            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-[var(--accent)]" />Browse Preferences</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">Default View Mode</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                        viewMode === "grid" ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-light)]"
                      }`}
                    >
                      <Grid className="w-5 h-5" />Grid
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                        viewMode === "list" ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-light)]"
                      }`}
                    >
                      <List className="w-5 h-5" />List
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Default Category Filter</label>
                    <select
                      value={defaultCategory}
                      onChange={(e) => setDefaultCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    >
                      <option value="">All Categories</option>
                      <option value="DIY">DIY</option><option value="Cooking">Cooking</option><option value="Tech">Tech</option>
                      <option value="Crafts">Crafts</option><option value="Home Improvement">Home Improvement</option>
                      <option value="Gardening">Gardening</option><option value="Electronics">Electronics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Default Difficulty</label>
                    <select
                      value={defaultDifficulty}
                      onChange={(e) => setDefaultDifficulty(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    >
                      <option value="">Any Difficulty</option>
                      <option value="1">Easy</option><option value="2">Medium</option><option value="3">Hard</option>
                      <option value="4">Expert</option><option value="5">Master</option>
                    </select>
                  </div>
                </div>

                <Button onClick={savePreferences} className="w-full md:w-auto"><Save className="w-4 h-4 mr-2" />Save Preferences</Button>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-6 flex items-center gap-2"><User className="w-5 h-5 text-[var(--accent)]" />Account Details</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                  <span className="text-[var(--text-secondary)]">Name</span>
                  <span className="text-[var(--text)]">{user.name}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                  <span className="text-[var(--text-secondary)]">Email</span>
                  <span className="text-[var(--text)]">{user.email}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[var(--text-secondary)]">Role</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>{user.role}</span>
                </div>
              </div>
            </div>

            {/* Role Info */}
            {(user.role === "ADMIN" || user.role === "MODERATOR") && (
              <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
                <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-[var(--accent)]" />Moderator Access</h2>
                <p className="text-[var(--text-secondary)] text-sm mb-4">
                  You have {user.role === "ADMIN" ? "full admin" : "moderator"} access to manage content on stephud.
                </p>
                <Link href="/admin"><Button variant="secondary"><Shield className="w-4 h-4 mr-2" />Open Admin Panel</Button></Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
