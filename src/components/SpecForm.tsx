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
  };
  parentId?: string | null;
  allSpecs?: { id: string; name: string; depth?: number }[];
  onSubmit: (data: { name: string; details: string; color: string; icon: string | null; imageUrl: string | null; parentId: string | null }) => Promise<void>;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!initialData?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    setError("");
    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), details: details.trim(), color, icon, imageUrl, parentId: selectedParentId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
