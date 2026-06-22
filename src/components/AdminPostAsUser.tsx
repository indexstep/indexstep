"use client";

import { useState, useEffect } from "react";
import { CATEGORIES } from "@/lib/types";
import type { ToolFieldDef, ToolFieldKey } from "@/lib/toolCategories";
import { Plus, Trash2, Search, User, X, AlertCircle, CheckCircle, Settings2, PlusCircle } from "lucide-react";

interface Tool { id: string; name: string; quantity: string; size: string; kind: string; notes: string; category: string; }
interface Step { id: string; title: string; content: string; imageUrl: string; }
interface UserOption { id: string; name: string; email: string; role: string; banned: boolean; }

/** Field keys we support in the simple form */
const SIMPLE_FIELD_KEYS: { key: ToolFieldKey; label: string; placeholder: string }[] = [
  { key: "name", label: "Name", placeholder: "e.g. flour, chicken breast" },
  { key: "amount", label: "Quantity", placeholder: "e.g. 2 cups, 500g" },
  { key: "size", label: "Size / Spec", placeholder: "e.g. large, 1 inch" },
  { key: "kind", label: "Kind / Type", placeholder: "e.g. organic, instant" },
  { key: "notes", label: "Notes", placeholder: "e.g. room temperature" },
];

export default function AdminPostAsUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // User search
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("DIY");
  const [difficulty, setDifficulty] = useState("3");
  const [timeMinutes, setTimeMinutes] = useState("30");
  const [coverImage, setCoverImage] = useState("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [steps, setSteps] = useState<Step[]>([{ id: "1", title: "", content: "", imageUrl: "" }]);
  const [published, setPublished] = useState(false);
  const [locked, setLocked] = useState(false);
  const [price, setPrice] = useState("0");

  // Search users
  useEffect(() => {
    if (!userQuery.trim()) { setUserResults([]); setShowDropdown(false); return; }
    setSearchingUsers(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/users?search=${encodeURIComponent(userQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setUserResults(data.filter((u: UserOption) => !u.banned));
          setShowDropdown(true);
        }
      } finally {
        setSearchingUsers(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [userQuery]);

  const selectUser = (u: UserOption) => {
    setSelectedUser(u);
    setUserQuery(u.name);
    setShowDropdown(false);
    setUserResults([]);
  };

  const clearUser = () => {
    setSelectedUser(null);
    setUserQuery("");
  };

  const addTool = () => {
    setTools([...tools, { id: crypto.randomUUID(), name: "", quantity: "", size: "", kind: "", notes: "", category }]);
  };

  const removeTool = (id: string) => {
    setTools(tools.filter((t) => t.id !== id));
  };

  const updateTool = (id: string, field: keyof Tool, value: string) => {
    setTools(tools.map((t) => t.id === id ? { ...t, [field]: value } : t));
  };

  const addStep = () => {
    setSteps([...steps, { id: crypto.randomUUID(), title: "", content: "", imageUrl: "" }]);
  };

  const removeStep = (id: string) => {
    if (steps.length === 1) return;
    setSteps(steps.filter((s) => s.id !== id));
  };

  const updateStep = (id: string, field: keyof Step, value: string) => {
    setSteps(steps.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) { setError("Please select a user first"); return; }
    if (!title || !description || !category || !difficulty || !timeMinutes) { setError("Please fill in all required fields"); return; }

    const validSteps = steps.filter((s) => s.title.trim() || s.content.trim());
    if (validSteps.length === 0) { setError("At least one step with a title is required"); return; }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/tutorials/as-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: selectedUser.id,
          title, description, category,
          difficulty: parseInt(difficulty),
          timeMinutes: parseInt(timeMinutes),
          coverImage: coverImage || null,
          tools: tools.filter((t) => t.name.trim()),
          steps: validSteps,
          published,
          locked,
          price: price ? Math.round(parseFloat(price) * 100) : 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create tutorial"); return; }

      setSuccess(`Tutorial created as ${selectedUser.name}! Title: "${data.title}"`);
      // Reset form
      setTitle(""); setDescription(""); setCategory("DIY"); setDifficulty("3");
      setTimeMinutes("30"); setCoverImage(""); setTools([]); setSteps([{ id: "1", title: "", content: "", imageUrl: "" }]);
      setPublished(false); setLocked(false); setPrice("0");
      setSelectedUser(null); setUserQuery("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Map tool field key to tool property name
  const fieldKeyToProp = (key: ToolFieldKey): keyof Tool => {
    if (key === "amount") return "quantity";
    return key as keyof Tool;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="w-6 h-6 text-[var(--accent)]-400" />
        <div>
          <h2 className="text-xl font-semibold text-[var(--text)]">Post as User</h2>
          <p className="text-sm text-[var(--text-secondary)]400">Create a tutorial on behalf of another user</p>
        </div>
      </div>

      {/* User Selector */}
      <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          Target User <span className="text-[var(--red)]">*</span>
        </label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]400" />
            <input
              type="text"
              placeholder="Search for a user by name or email..."
              value={userQuery}
              onChange={(e) => { setUserQuery(e.target.value); setSelectedUser(null); }}
              onFocus={() => userResults.length > 0 && setShowDropdown(true)}
              className="w-full pl-10 pr-10 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 placeholder:text-[var(--text-secondary)]500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500"
            />
            {selectedUser && (
              <button onClick={clearUser} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]400 hover:text-[var(--text)]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {showDropdown && userResults.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden">
              {userResults.map((u) => (
                <button
                  key={u.id}
                  onClick={() => selectUser(u)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--bg-highlight)]/30 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--accent)]-500/20 flex items-center justify-center text-xs font-medium text-[var(--accent)]-400">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{u.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]500">{u.email}</p>
                  </div>
                  <span className="ml-auto text-xs text-[var(--text-secondary)]500">{u.role}</span>
                </button>
              ))}
            </div>
          )}
          {searchingUsers && <p className="mt-2 text-xs text-[var(--text-secondary)]500">Searching...</p>}
        </div>
        {selectedUser && (
          <div className="mt-3 flex items-center gap-3 p-3 bg-[var(--accent)]-500/10 border border-[var(--accent)]-500/30 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]-500/20 flex items-center justify-center text-sm font-medium text-[var(--accent)]-400">
              {selectedUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text)]">{selectedUser.name}</p>
              <p className="text-xs text-[var(--text-secondary)]500">{selectedUser.email}</p>
            </div>
            <span className="ml-auto text-xs px-2 py-1 bg-[var(--accent)]-500/20 text-[var(--accent)]-400 rounded-full">Selected</span>
          </div>
        )}
      </div>

      {/* Tutorial Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-3 p-4 bg-[var(--red)]-500/10 border border-[var(--red)]-500/30 rounded-lg text-[var(--red)] text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-[var(--accent)]-500/10 border border-[var(--accent)]-500/30 rounded-lg text-[var(--accent)]-400 text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6 space-y-4">
          <h3 className="text-lg font-semibold text-[var(--text)]">Basic Information</h3>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">Title <span className="text-[var(--red)]">*</span></label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120}
              placeholder="Tutorial title..." className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 placeholder:text-[var(--text-secondary)]500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">Description <span className="text-[var(--red)]">*</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} maxLength={500}
              placeholder="Brief description of what this tutorial covers..."
              className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 placeholder:text-[var(--text-secondary)]500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Category</label>
              <select value={category} onChange={(e) => { setCategory(e.target.value); setTools([]); }}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Difficulty (1-5)</label>
              <input type="number" min={1} max={5} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Time (minutes)</label>
              <input type="number" min={1} value={timeMinutes} onChange={(e) => setTimeMinutes(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Price ($)</label>
              <input type="number" min={0} step={0.01} value={price} onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">Cover Image URL</label>
            <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..." className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 placeholder:text-[var(--text-secondary)]500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500" />
          </div>
        </div>

        {/* Tools / Ingredients */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6 space-y-4">
          <h3 className="text-lg font-semibold text-[var(--text)]">Tools & Materials</h3>
          {tools.length === 0 ? (
            <button type="button" onClick={addTool}
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]400 hover:text-[var(--accent)]-400 hover:border-[var(--accent)]-400 transition-colors">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          ) : (
            <div className="space-y-3">
              {tools.map((tool) => (
                <div key={tool.id} className="flex items-start gap-3 p-3 bg-[var(--bg)] rounded-lg border border-[var(--border)]">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2">
                    <input value={tool.name} onChange={(e) => updateTool(tool.id, "name", e.target.value)}
                      placeholder="Name" maxLength={80}
                      className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-xs text-[var(--text-secondary)]300 placeholder:text-[var(--text-secondary)]500 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]-500" />
                    <input value={tool.quantity} onChange={(e) => updateTool(tool.id, "quantity", e.target.value)}
                      placeholder="Quantity" maxLength={40}
                      className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-xs text-[var(--text-secondary)]300 placeholder:text-[var(--text-secondary)]500 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]-500" />
                    <input value={tool.size} onChange={(e) => updateTool(tool.id, "size", e.target.value)}
                      placeholder="Size / Spec" maxLength={40}
                      className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-xs text-[var(--text-secondary)]300 placeholder:text-[var(--text-secondary)]500 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]-500" />
                    <input value={tool.kind} onChange={(e) => updateTool(tool.id, "kind", e.target.value)}
                      placeholder="Kind / Type" maxLength={40}
                      className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-xs text-[var(--text-secondary)]300 placeholder:text-[var(--text-secondary)]500 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]-500" />
                    <input value={tool.notes} onChange={(e) => updateTool(tool.id, "notes", e.target.value)}
                      placeholder="Notes" maxLength={80}
                      className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-xs text-[var(--text-secondary)]300 placeholder:text-[var(--text-secondary)]500 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]-500" />
                  </div>
                  <button type="button" onClick={() => removeTool(tool.id)}
                    className="p-1.5 text-[var(--text-secondary)]400 hover:text-[var(--red)]-400 transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addTool}
                className="flex items-center gap-2 px-4 py-2 border border-dashed border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]400 hover:text-[var(--accent)]-400 hover:border-[var(--accent)]-400 transition-colors">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6 space-y-4">
          <h3 className="text-lg font-semibold text-[var(--text)]">Steps</h3>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={step.id} className="p-4 bg-[var(--bg)] rounded-lg border border-[var(--border)] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[var(--accent)]-500/20 text-xs font-medium text-[var(--accent)]-400">{i + 1}</span>
                  <input value={step.title} onChange={(e) => updateStep(step.id, "title", e.target.value)}
                    placeholder="Step title..." maxLength={80}
                    className="flex-1 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-sm text-[var(--text-secondary)]300 placeholder:text-[var(--text-secondary)]500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500" />
                  {steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(step.id)}
                      className="p-1.5 text-[var(--text-secondary)]400 hover:text-[var(--red)]-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <textarea value={step.content} onChange={(e) => updateStep(step.id, "content", e.target.value)}
                  placeholder="Describe what to do in this step..."
                  rows={3} className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]300 placeholder:text-[var(--text-secondary)]500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500 resize-none" />
                <input value={step.imageUrl} onChange={(e) => updateStep(step.id, "imageUrl", e.target.value)}
                  placeholder="Image URL (optional)" className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-xs text-[var(--text-secondary)]300 placeholder:text-[var(--text-secondary)]500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]-500" />
              </div>
            ))}
          </div>
          <button type="button" onClick={addStep}
            className="flex items-center gap-2 px-4 py-2 border border-dashed border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)]400 hover:text-[var(--accent)]-400 hover:border-[var(--accent)]-400 transition-colors">
            <Plus className="w-4 h-4" /> Add Step
          </button>
        </div>

        {/* Options */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
          <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Publishing Options</h3>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)]-500 focus:ring-[var(--accent)]-500" />
              <span className="text-sm text-[var(--text-secondary)]300">Publish immediately</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)]-500 focus:ring-[var(--accent)]-500" />
              <span className="text-sm text-[var(--text-secondary)]300">Lock (paid access)</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading || !selectedUser}
            className="px-6 py-2.5 bg-[var(--accent)]-500 hover:bg-[var(--accent)]-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
            {loading ? "Creating..." : `Post as ${selectedUser?.name || "User"}`}
          </button>
          {!selectedUser && <span className="text-sm text-[var(--text-secondary)]500">Select a user above to continue</span>}
        </div>
      </form>
    </div>
  );
}
