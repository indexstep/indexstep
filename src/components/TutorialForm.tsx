"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import FileUpload from "@/components/FileUpload";
import { Plus, Trash2, GripVertical, AlertCircle, ArrowLeft, Lock, Unlock, Eye, ChevronDown, X, Settings2, Pencil, PlusCircle } from "lucide-react";
import { CATEGORIES } from "@/lib/types";
import { getMergedToolConfig, TOOL_CATEGORY_CONFIG, type CustomToolFieldConfig, type ToolFieldDef } from "@/lib/toolCategories";
import Link from "next/link";

interface Tool { id: string; name: string; quantity: string; size: string; kind: string; notes: string; category: string; }
interface Step { id: string; title: string; content: string; imageUrl: string; }

interface TutorialFormProps {
  mode: "create" | "edit";
  tutorialId?: string;
  initialData?: {
    title: string;
    description: string;
    category: string;
    difficulty: number;
    timeMinutes: number;
    coverImage: string;
    locked: boolean;
    lockContent: boolean;
    published: boolean;
    price: number;
    password?: string | null;
    linkOnly?: boolean;
    tools: { id: string; name: string; quantity: string; size: string; kind: string; notes: string; category: string }[];
    steps: { id: string; title: string; content: string; imageUrl: string }[];
    customConfigs?: CustomToolFieldConfig[];
    customToolConfigs?: unknown;
  };
}

export default function TutorialForm({ mode, tutorialId, initialData }: TutorialFormProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(mode === "edit" && !initialData);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("DIY");
  const [difficulty, setDifficulty] = useState("3");
  const [timeMinutes, setTimeMinutes] = useState("30");
  const [coverImage, setCoverImage] = useState("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [toolSectionCategory, setToolSectionCategory] = useState(category);
  const [steps, setSteps] = useState<Step[]>([{ id: "1", title: "", content: "", imageUrl: "" }]);
  const [published, setPublished] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockContent, setLockContent] = useState(false);
  const [price, setPrice] = useState("0");
  const [guidePassword, setGuidePassword] = useState("");
  const [accessType, setAccessType] = useState<"public" | "link_only" | "password_only" | "link_password">("public");
  const [customConfigs, setCustomConfigs] = useState<CustomToolFieldConfig[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [editingCustom, setEditingCustom] = useState<CustomToolFieldConfig | null>(null);
  const [editReason, setEditReason] = useState("");

  // Keep tool section category in sync with tutorial category
  useEffect(() => {
    setToolSectionCategory(category);
  }, [category]);

  // Load existing tutorial data in edit mode
  useEffect(() => {
    if (mode === "edit" && tutorialId && !initialData) {
      setFetching(true);
      fetch(`/api/tutorials/${tutorialId}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (!data) { router.push("/"); return; }
          // Check ownership/admin
          if (user && data.author.id !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
            router.push(`/tutorial/${tutorialId}`);
            return;
          }
          setTitle(data.title);
          setDescription(data.description);
          setCategory(data.category);
          setDifficulty(String(data.difficulty));
          setTimeMinutes(String(data.timeMinutes));
          setCoverImage(data.coverImage || "");
          setPublished(data.published);
          setLocked(data.locked);
          setLockContent(data.lockContent || false);
          setPrice((data.price / 100).toFixed(2));
          setGuidePassword(data.password || "");
          // Derive access type from published + linkOnly + password
          if (data.password) {
            setAccessType(data.linkOnly ? "link_password" : "password_only");
          } else {
            setAccessType(data.linkOnly ? "link_only" : "public");
          }
          setTools(data.tools.map((t: { id: string; name: string; quantity: string | null; size: string | null; kind: string | null; notes: string | null; category: string | null }) => ({
            id: t.id,
            name: t.name,
            quantity: t.quantity || "",
            size: t.size || "",
            kind: t.kind || "",
            notes: t.notes || "",
            category: t.category || category,
          })));
          setCustomConfigs(data.customToolConfigs || []);
          setSteps(data.steps.map((s: { id: string; title: string; content: string; imageUrl: string | null }) => ({
            id: s.id,
            title: s.title,
            content: s.content,
            imageUrl: s.imageUrl || "",
          })));
        })
        .catch(() => router.push("/"))
        .finally(() => setFetching(false));
    } else if (mode === "edit" && initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setCategory(initialData.category);
      setDifficulty(String(initialData.difficulty));
      setTimeMinutes(String(initialData.timeMinutes));
      setCoverImage(initialData.coverImage);
      setLocked(initialData.locked);
      setLockContent(initialData.lockContent || false);
      setPrice((initialData.price / 100).toFixed(2));
      setGuidePassword(initialData.password || "");
      // Derive access type from published + linkOnly + password
      if (initialData.password) {
        setAccessType(initialData.linkOnly ? "link_password" : "password_only");
      } else {
        setAccessType(initialData.linkOnly ? "link_only" : "public");
      }
      setTools(initialData.tools.map((t) => ({ id: t.id, name: t.name, quantity: t.quantity || "", size: t.size || "", kind: t.kind || "", notes: t.notes || "", category: t.category || category })));
      setCustomConfigs((initialData.customToolConfigs as CustomToolFieldConfig[]) || []);
      setSteps(initialData.steps.map((s) => ({ id: s.id, title: s.title, content: s.content, imageUrl: s.imageUrl || "" })));
    }
  }, [mode, tutorialId, initialData, user, router]);

  useEffect(() => { if (!authLoading && !user) router.push("/login"); }, [user, authLoading, router]);

  const addTool = (toolCategory?: string) => {
    const cat = toolCategory || toolSectionCategory;
    setTools([...tools, { id: Date.now().toString(), name: "", quantity: "", size: "", kind: "", notes: "", category: cat }]);
  };
  const removeTool = (id: string) => setTools(tools.filter((t) => t.id !== id));
  const updateTool = (id: string, field: keyof Tool, value: string) => setTools(tools.map((t) => t.id === id ? { ...t, [field]: value } : t));
  const addStep = () => setSteps([...steps, { id: Date.now().toString(), title: "", content: "", imageUrl: "" }]);
  const removeStep = (id: string) => { if (steps.length > 1) setSteps(steps.filter((s) => s.id !== id)); };
  const updateStep = (id: string, field: keyof Step, value: string) => setSteps(steps.map((s) => s.id === id ? { ...s, [field]: value } : s));

  const handleSubmit = async (doPublish: boolean) => {
    setError("");
    if (!title.trim()) { setError("Title is required"); return; }
    if (!description.trim()) { setError("Description is required"); return; }
    if (steps.some((s) => !s.title.trim() || !s.content.trim())) { setError("All steps must have a title and content"); return; }
    if (locked && parseFloat(price) <= 0) { setError("Locked guides must have a price greater than 0"); return; }
    setLoading(true);
    try {
      // Map access type to published/linkOnly/password fields
      const isPublic = accessType === "public";
      const isLinkOnly = accessType === "link_only";
      const needsPassword = accessType === "password_only" || accessType === "link_password";
      const finalPublished = isPublic || accessType === "password_only"; // listed in search
      const finalLinkOnly = isLinkOnly || accessType === "link_password";
      const finalPassword = needsPassword ? (guidePassword || null) : null;

      const payload = {
        title, description, category, difficulty: parseInt(difficulty),
        timeMinutes: parseInt(timeMinutes), coverImage: coverImage || null,
        published: finalPublished, locked, lockContent, price: Math.round(parseFloat(price) * 100),
        linkOnly: finalLinkOnly,
        password: finalPassword,
        tools: tools.filter((t) => t.name.trim()).map((t) => ({ name: t.name, quantity: t.quantity || undefined, size: t.size || undefined, kind: t.kind || undefined, notes: t.notes || undefined, category: t.category })),
        customToolConfigs: customConfigs,
        steps: steps.map((s, idx) => ({ title: s.title, content: s.content, imageUrl: s.imageUrl || null, order: idx + 1 })),
        ...(mode === "edit" ? { editReason: editReason.trim() || undefined } : {}),
      };
      const url = mode === "edit" && tutorialId ? `/api/tutorials/${tutorialId}` : "/api/tutorials";
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || `Failed to ${mode} tutorial`); }
      const data = await res.json();
      router.push(`/tutorial/${data.id}`);
    } catch (err) { setError(err instanceof Error ? err.message : `Failed to ${mode} tutorial`); }
    finally { setLoading(false); }
  };

  if (authLoading || fetching || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>;
  }

  const isEdit = mode === "edit";

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href={isEdit && tutorialId ? `/tutorial/${tutorialId}` : "/"} className="text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">{isEdit ? "Edit Guide" : "Create New Guide"}</h1>
            <p className="text-[var(--text-secondary)]">{isEdit ? "Update your step-by-step tutorial" : "Build a step-by-step tutorial"}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-lg flex items-center gap-3 text-[var(--red)]">
            <AlertCircle className="w-5 h-5" /><p className="text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Basic Info */}
          <section className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--text)] mb-6">Basic Information</h2>
            <div className="space-y-4">
              <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., How to Build a Birdhouse" required />
              {isEdit && (
                <div className="mt-2">
                  <Input
                    label="What changed? (optional)"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="e.g., Fixed step 3 instructions, added more photos"
                  />
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Describe what you changed — this helps track edits and flags suspicious activity.
                  </p>
                </div>
              )}
              <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Briefly describe what users will learn..." rows={3} required />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))} />
                <Select label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} options={[{ value: "1", label: "1 - Easy" }, { value: "2", label: "2 - Medium" }, { value: "3", label: "3 - Hard" }, { value: "4", label: "4 - Expert" }, { value: "5", label: "5 - Master" }]} />
                <Input label="Time (minutes)" type="number" value={timeMinutes} onChange={(e) => setTimeMinutes(e.target.value)} min={1} required />
              </div>
              <FileUpload label="Cover Image" value={coverImage} onChange={setCoverImage} />
              <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--bg)]">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">{locked ? <Lock className="w-5 h-5 text-[var(--accent)]" /> : <Unlock className="w-5 h-5 text-[var(--text-muted)]" />}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-[var(--text)]">Guide Access</label>
                      <button type="button" onClick={() => setLocked(!locked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${locked ? "bg-[var(--accent)]" : "bg-[var(--bg-highlight)]"}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${locked ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mb-3">{locked ? "Only users who purchase this guide can view its full content." : "This guide will be freely accessible to everyone."}</p>
                    {locked && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--text-secondary)]">Price:</span>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-sm">$</span>
                          <input type="number" min="0.01" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
                            className="w-28 pl-6 pr-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]" />
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">per unlock</span>
                      </div>
                    )}
                    {locked && (
                      <div className="mt-3 pt-3 border-t border-[var(--border)]">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className="text-sm font-medium text-[var(--text)]">Lock content, show title</p>
                            <p className="text-xs text-[var(--text-muted)]">Everyone sees the title; everything else requires purchase</p>
                          </div>
                          <button type="button" onClick={() => setLockContent(!lockContent)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 ${lockContent ? "bg-[var(--accent)]" : "bg-[var(--bg-highlight)]"}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${lockContent ? "translate-x-6" : "translate-x-1"}`} />
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Privacy / Access Type */}
                    <div className="mt-3 pt-3 border-t border-[var(--border)]">
                      <p className="text-sm font-medium text-[var(--text)] mb-2">Privacy & Access</p>
                      <div className="space-y-2">
                        {[
                          { value: "public", label: "Public", desc: "Listed in search, no password needed" },
                          { value: "link_only", label: "Link Only", desc: "Hidden from search, accessible via direct link" },
                          { value: "password_only", label: "Password Only", desc: "Listed in search, but requires a password" },
                          { value: "link_password", label: "Link + Password", desc: "Hidden from search, requires link AND password" },
                        ].map((option) => (
                          <label key={option.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            accessType === option.value
                              ? "border-[var(--accent)] bg-[var(--accent)]/5"
                              : "border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--text-muted)]"
                          }`}>
                            <input
                              type="radio"
                              name="accessType"
                              value={option.value}
                              checked={accessType === option.value}
                              onChange={() => setAccessType(option.value as typeof accessType)}
                              className="mt-0.5"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[var(--text)]">{option.label}</p>
                              <p className="text-xs text-[var(--text-muted)]">{option.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      {(accessType === "password_only" || accessType === "link_password") && (
                        <div className="mt-3">
                          <input
                            type="password"
                            value={guidePassword}
                            onChange={(e) => setGuidePassword(e.target.value)}
                            placeholder="Enter password..."
                            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                          />
                          <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                            Share link: <span className="text-[var(--accent)]">{typeof window !== "undefined" ? window.location.origin : ""}/tutorial/[ID]</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Ingredients & Materials — Tabbed by Category */}
          <section className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text)]">Ingredients & Materials</h2>
              <div className="flex items-center gap-2">
                {/* Customize Fields button */}
                <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingCustom(null); setShowCustomModal(true); }}>
                  <Settings2 className="w-4 h-4 mr-1" />Customize Fields
                </Button>
                {/* Add Item dropdown */}
                <div className="relative group">
                  <Button type="button" variant="secondary" size="sm">
                    <Plus className="w-4 h-4 mr-1" />Add Item <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                  <div className="absolute right-0 mt-1 w-56 rounded-lg shadow-xl border py-1 z-10 hidden group-hover:block"
                    style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                    {CATEGORIES.map((cat) => {
                      const cfg = getMergedToolConfig(cat, customConfigs);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => { addTool(cat); setToolSectionCategory(cat); }}
                          className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-highlight)]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          + {cfg.sectionTitle}
                        </button>
                      );
                    })}
                    {customConfigs.length > 0 && (
                      <>
                        <div className="border-t mx-2 my-1" style={{ borderColor: "var(--border)" }} />
                        {customConfigs.map((cfg) => (
                          <button
                            key={cfg.categoryKey}
                            type="button"
                            onClick={() => { addTool(cfg.categoryKey); setToolSectionCategory(cfg.categoryKey); }}
                            className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-highlight)]"
                            style={{ color: "var(--accent)" }}
                          >
                            + {cfg.sectionTitle} (custom)
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Category tabs — only show categories that have at least one tool */}
            {(() => {
              const allCategoryKeys = new Set<string>();
              CATEGORIES.forEach((c) => { if (tools.some((t) => t.category === c)) allCategoryKeys.add(c); });
              customConfigs.forEach((c) => { if (tools.some((t) => t.category === c.categoryKey)) allCategoryKeys.add(c.categoryKey); });
              if (allCategoryKeys.size === 0) return null;
              return (
                <div className="flex items-center gap-1 mb-5 flex-wrap border-b" style={{ borderColor: "var(--border)" }}>
                  {CATEGORIES.map((cat) => {
                    const count = tools.filter((t) => t.category === cat).length;
                    if (count === 0) return null;
                    const cfg = getMergedToolConfig(cat, customConfigs);
                    const isActive = toolSectionCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setToolSectionCategory(cat)}
                        className="px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px"
                        style={{
                          color: isActive ? "var(--accent)" : "var(--text-secondary)",
                          borderColor: isActive ? "var(--accent)" : "transparent",
                        }}
                      >
                        {cfg.sectionTitle} <span className="ml-1 text-xs opacity-60">({count})</span>
                      </button>
                    );
                  })}
                  {customConfigs.map((cfg) => {
                    const count = tools.filter((t) => t.category === cfg.categoryKey).length;
                    if (count === 0) return null;
                    const isActive = toolSectionCategory === cfg.categoryKey;
                    return (
                      <button
                        key={cfg.categoryKey}
                        type="button"
                        onClick={() => setToolSectionCategory(cfg.categoryKey)}
                        className="px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px"
                        style={{
                          color: isActive ? "var(--accent)" : "var(--text-secondary)",
                          borderColor: isActive ? "var(--accent)" : "transparent",
                        }}
                      >
                        {cfg.sectionTitle} <span className="ml-1 text-xs opacity-60">({count})</span>
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {/* Current tab config */}
            {(() => {
              const cfg = getMergedToolConfig(toolSectionCategory, customConfigs);
              const tabTools = tools.filter((t) => t.category === toolSectionCategory);
              return (
                <div>
                  <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                    Adding to: <strong style={{ color: "var(--accent)" }}>{cfg.sectionTitle}</strong> — switch tabs above to edit items from other categories
                  </p>
                  {tabTools.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>No {cfg.sectionTitle.toLowerCase()} added yet.</p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Click &quot;Add Item&quot; above to add {cfg.sectionTitle.toLowerCase()} for the <strong>{toolSectionCategory}</strong> category.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tabTools.map((tool) => {
                        const origIndex = tools.findIndex((t) => t.id === tool.id) + 1;
                        // Only show fields that have values in this tool
                        const visibleFields = cfg.fields.filter((f) => {
                          if (f.key === "name") return true; // name is always shown
                          const val = tool[f.key === "amount" ? "quantity" : f.key as keyof typeof tool];
                          return val !== undefined && val !== null && String(val).trim() !== "";
                        });

                        return (
                          <div key={tool.id} className="bg-[var(--bg)] rounded-lg border border-[var(--border)] p-4">
                            <div className="flex items-start gap-2 mb-3">
                              <GripVertical className="w-4 h-4 text-[var(--text-muted)] mt-2 flex-shrink-0" />
                              <span className="text-[var(--text-muted)] text-sm font-medium mt-2 flex-shrink-0">{origIndex}.</span>
                              <div className="flex-1 min-w-0">
                                <Input
                                  value={tool.name}
                                  onChange={(e) => updateTool(tool.id, "name", e.target.value)}
                                  placeholder={cfg.fields.find((f) => f.key === "name")?.placeholder || "Item name"}
                                  className="w-full"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeTool(tool.id)}
                                className="p-2 transition-colors flex-shrink-0"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            {visibleFields.filter((f) => f.key !== "name").length > 0 && (
                              <div className={"grid gap-3 " + (visibleFields.length <= 2 ? "grid-cols-1 md:grid-cols-2" : visibleFields.length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-" + Math.min(visibleFields.length, 4))}>
                                {visibleFields.filter((f) => f.key !== "name").map((field) => (
                                  <div key={field.key}>
                                    <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>{field.label}</label>
                                    <Input
                                      value={tool[field.key === "amount" ? "quantity" : field.key as keyof typeof tool] || ""}
                                      onChange={(e) => updateTool(tool.id, field.key === "amount" ? "quantity" : field.key, e.target.value)}
                                      placeholder={field.placeholder}
                                    />
                                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{field.helper}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </section>

          {/* Steps */}
          <section className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[var(--text)]">Steps ({steps.length})</h2>
              <Button type="button" variant="secondary" size="sm" onClick={addStep}><Plus className="w-4 h-4 mr-1" />Add Step</Button>
            </div>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.id} className="bg-[var(--bg)] rounded-lg border border-[var(--border)] p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-[#0f0f14] flex items-center justify-center text-sm font-bold flex-shrink-0">{index + 1}</div>
                    <Input value={step.title} onChange={(e) => updateStep(step.id, "title", e.target.value)} placeholder={`Step ${index + 1} title`} className="flex-1" />
                    {steps.length > 1 && <button type="button" onClick={() => removeStep(step.id)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--red)] flex-shrink-0"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Photo for this step</label>
                    {step.imageUrl ? (
                      <div className="relative group">
                        <img src={step.imageUrl} alt={`Step ${index + 1}`} className="w-full h-48 object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-lg">
                          <button type="button" onClick={() => document.getElementById(`step-img-${step.id}`)?.click()} className="px-3 py-1.5 bg-[var(--accent)] text-[#0f0f14] rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors">Change Photo</button>
                          <button type="button" onClick={() => updateStep(step.id, "imageUrl", "")} className="px-3 py-1.5 bg-[var(--red)]/80 text-[var(--text)] rounded-lg text-sm font-medium hover:bg-[var(--red)] transition-colors">Remove</button>
                        </div>
                        <input id={`step-img-${step.id}`} type="file" accept="image/*" className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]; if (!file) return;
                            const fd = new FormData(); fd.append("file", file);
                            setLoading(true);
                            try { const res = await fetch("/api/upload", { method: "POST", body: fd }); if (res.ok) { const { url } = await res.json(); updateStep(step.id, "imageUrl", url); } }
                            finally { setLoading(false); }
                          }} />
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-[var(--accent)]", "bg-[var(--accent)]/5"); }}
                        onDragLeave={(e) => e.currentTarget.classList.remove("border-[var(--accent)]", "bg-[var(--accent)]/5")}
                        onDrop={(e) => {
                          e.preventDefault(); e.currentTarget.classList.remove("border-[var(--accent)]", "bg-[var(--accent)]/5");
                          const file = e.dataTransfer.files[0]; if (!file?.type.startsWith("image/")) return;
                          const fd = new FormData(); fd.append("file", file); setLoading(true);
                          fetch("/api/upload", { method: "POST", body: fd }).then((res) => res.ok ? res.json() : null)
                            .then((data) => { if (data?.url) updateStep(step.id, "imageUrl", data.url); }).catch(console.error).finally(() => setLoading(false));
                        }}
                        onClick={() => document.getElementById(`step-img-${step.id}`)?.click()}
                        className="border-2 border-dashed border-[var(--border)] hover:border-[var(--border-light)] rounded-lg p-6 text-center cursor-pointer hover:bg-[var(--bg-secondary)]/30 transition-all"
                      >
                        <input id={`step-img-${step.id}`} type="file" accept="image/*" className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]; if (!file) return;
                            const fd = new FormData(); fd.append("file", file); setLoading(true);
                            try { const res = await fetch("/api/upload", { method: "POST", body: fd }); if (res.ok) { const { url } = await res.json(); updateStep(step.id, "imageUrl", url); } }
                            finally { setLoading(false); }
                          }} />
                        <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-[var(--bg-highlight)] flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5c6370" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">Drag & drop a photo, or <span className="text-[var(--accent)] font-medium">browse</span></p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">PNG, JPG, GIF, WebP up to 10MB</p>
                      </div>
                    )}
                  </div>
                  <Textarea label="Instructions" value={step.content} onChange={(e) => updateStep(step.id, "content", e.target.value)} placeholder="Describe this step in detail..." rows={4} required />
                </div>
              ))}
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              {isEdit ? (
                <Link href={`/tutorial/${tutorialId}`} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
                  <Eye className="w-4 h-4" />Preview
                </Link>
              ) : (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={!published} onChange={(e) => setPublished(!e.target.checked)}
                    className="w-5 h-5 rounded border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--accent)] focus:ring-[var(--accent)] focus:ring-offset-[#0f0f14]" />
                  <span className="text-[var(--text-secondary)]">Save as draft</span>
                </label>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => router.push(isEdit && tutorialId ? `/tutorial/${tutorialId}` : "/")}>Cancel</Button>
              {isEdit ? (
                <>
                  <Button variant="secondary" onClick={() => handleSubmit(false)} loading={loading} disabled={!published}>
                    Save Draft
                  </Button>
                  <Button onClick={() => handleSubmit(true)} loading={loading}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => handleSubmit(false)} loading={loading}>Save Draft</Button>
                  <Button onClick={() => handleSubmit(true)} loading={loading}>{!published ? "Publish Guide" : "Save & Preview"}</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Tool Fields Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowCustomModal(false)} />
          <div className="relative w-full max-w-2xl my-8 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)]">Customize Field Labels</h2>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  Create custom categories with your own field names. E.g. "Supplies" with fields like "Brand", "Grade", "Certification".
                </p>
              </div>
              <button onClick={() => setShowCustomModal(false)} className="p-2 rounded-lg hover:bg-[var(--bg-highlight)] transition-colors" style={{ color: "var(--text-secondary)" }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {editingCustom ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
                  <h3 className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>
                    {editingCustom.categoryKey ? "Edit Category" : "New Category"}
                  </h3>

                  <div className="mb-4">
                    <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Category Name</label>
                    <Input
                      value={editingCustom.sectionTitle}
                      onChange={(e) => setEditingCustom({ ...editingCustom, sectionTitle: e.target.value })}
                      placeholder="e.g. Ingredients, Materials, Supplies"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium" style={{ color: "var(--text)" }}>Items in this category</label>
                      <button
                        type="button"
                        onClick={() => {
                          const newFields = [...editingCustom.fields, { key: "name" as const, label: "Item", placeholder: "e.g. item name", helper: "What do you need?", itemName: "" }];
                          setEditingCustom({ ...editingCustom, fields: newFields });
                        }}
                        className="text-xs px-2 py-1 rounded transition-colors"
                        style={{ backgroundColor: "var(--accent)", color: "#0f0f14" }}
                      >
                        <PlusCircle className="w-3 h-3 inline mr-1" />Add Item
                      </button>
                    </div>
                    <div className="space-y-2">
                      {editingCustom.fields.map((field, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            value={field.itemName || ""}
                            onChange={(e) => {
                              const newFields = [...editingCustom.fields];
                              newFields[idx] = { ...field, itemName: e.target.value };
                              setEditingCustom({ ...editingCustom, fields: newFields });
                            }}
                            placeholder="e.g. flour, eggs, sugar"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCustom({ ...editingCustom, fields: editingCustom.fields.filter((_, i) => i !== idx) });
                            }}
                            className="p-2 rounded flex-shrink-0"
                            style={{ color: "var(--red)" }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {editingCustom.fields.length === 0 && (
                        <p className="text-xs text-center py-3" style={{ color: "var(--text-muted)" }}>No items yet. Click "Add Item" to add one.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (!editingCustom.sectionTitle.trim()) return;
                        if (editingCustom.categoryKey) {
                          // Editing existing - update config and update tool names
                          setCustomConfigs(customConfigs.map((c) => c.categoryKey === editingCustom.categoryKey ? { ...editingCustom } : c));
                          // Update existing tools' category to match new section title if changed
                          if (editingCustom.sectionTitle !== customConfigs.find((c) => c.categoryKey === editingCustom.categoryKey)?.sectionTitle) {
                            setTools(tools.map((t) => t.category === editingCustom.categoryKey ? { ...t, category: editingCustom.sectionTitle } : t));
                          }
                        } else {
                          // Creating new - save config and add items to tools table
                          const newKey = "custom_" + Date.now();
                          setCustomConfigs([...customConfigs, { ...editingCustom, categoryKey: newKey }]);
                          // Add each item to tools
                          const newTools = editingCustom.fields
                            .filter((f) => f.itemName && f.itemName.trim())
                            .map((f) => ({
                              id: Date.now().toString() + Math.random(),
                              name: f.itemName || "",
                              quantity: "",
                              size: "",
                              kind: "",
                              notes: "",
                              category: newKey,
                            }));
                          setTools([...tools, ...newTools]);
                        }
                        setEditingCustom(null);
                      }}
                    >
                      {editingCustom.categoryKey ? "Save Changes" : "Add Category"}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditingCustom(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* List of existing custom configs */
              <div className="space-y-3">
                {customConfigs.length === 0 && (
                  <div className="text-center py-8">
                    <Settings2 className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
                    <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>No custom categories yet.</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Click "Add Custom Category" to create one with your own field labels.</p>
                  </div>
                )}
                {customConfigs.map((cfg) => (
                  <div key={cfg.categoryKey} className="flex items-start justify-between p-4 rounded-lg border" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm" style={{ color: "var(--accent)" }}>{cfg.sectionTitle}</span>
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "var(--bg-highlight)", color: "var(--text-muted)" }}>custom</span>
                      </div>
                      <div className="text-xs flex flex-wrap gap-x-3 gap-y-0.5" style={{ color: "var(--text-secondary)" }}>
                        {cfg.fields.map((f) => (
                          <span key={f.key}><strong>{f.label}</strong>{" "}</span>
                        ))}
                      </div>
                      {tools.filter((t) => t.category === cfg.categoryKey).length > 0 && (
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                          {tools.filter((t) => t.category === cfg.categoryKey).length} item(s) using this category
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-4">
                      <button
                        type="button"
                        onClick={() => setEditingCustom({ sectionTitle: cfg.sectionTitle, categoryKey: cfg.categoryKey, fields: Array.isArray(cfg.fields) ? cfg.fields : [] })}
                        className="p-2 rounded-lg hover:bg-[var(--bg-highlight)] transition-colors"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomConfigs(customConfigs.filter((c) => c.categoryKey !== cfg.categoryKey));
                          // Also remove tools using this category
                          setTools(tools.filter((t) => t.category !== cfg.categoryKey));
                        }}
                        className="p-2 rounded-lg hover:bg-[var(--red)]/10 transition-colors"
                        style={{ color: "var(--red)" }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingCustom({ categoryKey: "", sectionTitle: "", fields: [{ key: "name", label: "Item", placeholder: "e.g. item name", helper: "What do you need?" }] })}
                  className="mt-2"
                >
                  <PlusCircle className="w-4 h-4 mr-1" />Add Custom Category
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}