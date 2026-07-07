"use client";

import { useState } from "react";
import Button from "./Button";
import Input from "./Input";
import Textarea from "./Textarea";
import FileUpload from "./FileUpload";

interface SpecFormProps {
  initialData?: {
    id?: string;
    name?: string;
    details?: string;
    color?: string;
    icon?: string | null;
    imageUrl?: string | null;
    parentId?: string | null;
    published?: boolean;
    locked?: boolean;
    lockContent?: boolean;
    price?: number;
    password?: string | null;
    linkOnly?: boolean;
  };
  parentId?: string | null;
  allSpecs?: { id: string; name: string; depth?: number }[];
  onSubmit: (data: {
    name: string;
    details: string;
    color: string;
    icon: string | null;
    imageUrl: string | null;
    parentId: string | null;
    published: boolean;
    locked: boolean;
    lockContent: boolean;
    price: number;
    password: string | null;
    linkOnly: boolean;
  }) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

const PRESET_COLORS = [
  "#ff9940", "#aad94c", "#e6c866", "#f26d78",
  "#60a5fa", "#a78bfa", "#f472b6", "#34d399",
  "#fbbf24", "#ef4444", "#3b82f6", "#8b5cf6",
];

const PRESET_ICONS = [
  "🎮", "🛠️", "💻", "📱", "🎨", "🎵", "📹", "📚",
  "🍳", "🔧", "⚙️", "🔬", "📦", "🏠", "🚀", "💡",
];

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div
        className="mt-0.5 relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0"
        style={{ backgroundColor: checked ? "var(--accent)" : "var(--bg-highlight)" }}
        onClick={() => onChange(!checked)}
      >
        <div
          className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform mt-0.5 ml-0.5"
          style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }}
        />
      </div>
      <div>
        <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{label}</span>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{description}</p>
        )}
      </div>
    </label>
  );
}

export default function SpecForm({
  initialData,
  parentId,
  allSpecs = [],
  onSubmit,
  onCancel,
  submitLabel = "Create Spec",
}: SpecFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [details, setDetails] = useState(initialData?.details || "");
  const [color, setColor] = useState(initialData?.color || "#ff9940");
  const [icon, setIcon] = useState(initialData?.icon || null);
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl || null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(initialData?.parentId ?? parentId ?? null);
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [locked, setLocked] = useState(initialData?.locked ?? false);
  const [lockContent, setLockContent] = useState(initialData?.lockContent ?? false);
  const [price, setPrice] = useState(initialData?.price ?? 0);
  const [password, setPassword] = useState(initialData?.password || "");
  const [linkOnly, setLinkOnly] = useState(initialData?.linkOnly ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLockOptions, setShowLockOptions] = useState(initialData?.locked ?? false);

  const isEdit = !!initialData?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    setError("");
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        details: details.trim(),
        color,
        icon,
        imageUrl,
        parentId: selectedParentId,
        published,
        locked,
        lockContent,
        price,
        password: password.trim() || null,
        linkOnly,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Gaming Setup, Car Maintenance..."
        error={error}
        required
      />
      <Textarea
        label="Details"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Additional details, notes, specs..."
        rows={3}
      />

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Picture <span className="font-normal" style={{ color: "var(--text-muted)" }}>(optional)</span>
        </label>
        <FileUpload
          value={imageUrl || undefined}
          onChange={(url) => setImageUrl(url || null)}
        />
      </div>

      {!isEdit && (
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Parent Spec
          </label>
          <select
            value={selectedParentId || ""}
            onChange={(e) => setSelectedParentId(e.target.value || null)}
            className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm"
            style={{ color: "var(--text)" }}
          >
            <option value="">— None (top-level) —</option>
            {allSpecs
              .filter((s) => s.id !== initialData?.id)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {"  ".repeat(s.depth || 0)}{s.name}
                </option>
              ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Color</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                borderColor: color === c ? "var(--text)" : "transparent",
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Icon <span className="font-normal" style={{ color: "var(--text-muted)" }}>(optional — shown if no picture)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_ICONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(icon === i ? null : i)}
              className="w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors"
              style={{
                backgroundColor: icon === i ? "var(--bg-highlight)" : "transparent",
                border: icon === i ? "1.5px solid var(--accent)" : "1px solid var(--border)",
              }}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* ── ACCESS CONTROL ── */}
      <div className="border-t pt-4" style={{ borderColor: "var(--border)" }}>
        <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
          Access & Visibility
        </h4>
        <div className="space-y-3">
          <Toggle
            label="Published"
            description="Unpublished specs are only visible to you"
            checked={published}
            onChange={(v) => setPublished(v)}
          />
          <Toggle
            label="Link Only (Unlisted)"
            description="Only accessible via direct link — hidden from public listings"
            checked={linkOnly}
            onChange={(v) => setLinkOnly(v)}
          />
          <Toggle
            label="Password Protected"
            description="Require a password to view this spec"
            checked={locked}
            onChange={(v) => { setLocked(v); setShowLockOptions(v); }}
          />
          {showLockOptions && (
            <div className="ml-0 mt-2 space-y-3 pl-0">
              <Input
                label="Password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to protect this spec"
              />
              <Toggle
                label="Lock Children Too"
                description="Also lock all child specs under this one"
                checked={lockContent}
                onChange={(v) => setLockContent(v)}
              />
            </div>
          )}
          <Toggle
            label="Paid Spec"
            description="Set a price for this spec (0 = free)"
            checked={price > 0}
            onChange={(v) => setPrice(v ? 999 : 0)}
          />
          {price > 0 && (
            <div className="ml-0 mt-2 pl-0">
              <Input
                label="Price (credits)"
                type="number"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                placeholder="999"
                min={1}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
