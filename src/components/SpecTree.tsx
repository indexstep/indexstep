"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, CheckSquare, Square, X, Check } from "lucide-react";

interface SpecNodeData {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  details?: string;
  parentId?: string | null;
  imageUrl?: string | null;
  viewCount?: number;
  likeCount?: number;
  followCount?: number;
  locked?: boolean;
  _count: { children: number };
  children?: SpecNodeData[];
}

interface SpecNodeProps {
  spec: SpecNodeData;
  depth?: number;
  isLast?: boolean;
  ancestorHasExpander?: boolean;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onEdit?: (spec: SpecNodeData) => void;
  onDelete?: (id: string) => void;
  onAddChild?: (parentId: string) => void;
  onSelect?: (spec: SpecNodeData) => void;
}

const RED = "#C8102E";
const BLUE = "#2C5FE6";

function getTreeParts(depth: number, isLast: boolean, ancestorHasExpander: boolean): {
  indent: string;
  connector: string;
  finalPrefix: string;
} {
  if (depth === 0) {
    return {
      indent: "",
      connector: "",
      finalPrefix: "",
    };
  }

  const indent = "  ".repeat(depth - 1);
  const pipe = ancestorHasExpander ? "│ " : "  ";
  const connector = isLast ? "└─ " : "├─ ";
  return {
    indent: indent + pipe,
    connector,
    finalPrefix: indent + (isLast ? "└─ " : "├─ "),
  };
}

function SpecNode({
  spec,
  depth = 0,
  isLast = false,
  ancestorHasExpander = false,
  selectionMode = false,
  selectedIds = new Set(),
  onToggleSelect,
  onEdit,
  onDelete,
  onAddChild,
  onSelect,
}: SpecNodeProps) {
  const router = useRouter();
  const hasChildren = !!(spec.children && spec.children.length > 0);
  const childCount = spec._count?.children ?? spec.children?.length ?? 0;
  const [expanded, setExpanded] = useState(depth === 0);
  const isSelected = selectedIds.has(spec.id);

  // Sync expanded state when spec children change (e.g., after delete/add)
  useEffect(() => {
    setExpanded(depth === 0);
  }, [spec.children, depth]);

  const { indent, connector, finalPrefix } = getTreeParts(depth, isLast, ancestorHasExpander);

  // Alternating colors by depth: even=RED, odd=BLUE
  const labelColor = depth % 2 === 0 ? RED : BLUE;

  const displayName = spec.name.toUpperCase();
  const prefix = depth > 0 && !hasChildren ? "+ " : "";

  const handleClick = (e: React.MouseEvent) => {
    if (selectionMode) {
      e.stopPropagation();
      onToggleSelect?.(spec.id);
      return;
    }
    if (onSelect) {
      onSelect(spec);
    } else if (hasChildren) {
      setExpanded(!expanded);
    } else {
      router.push(`/specs/${spec.id}`);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect?.(spec.id);
  };

  return (
    <div className="select-none font-mono text-sm leading-7">
      <div
        className={`flex items-center gap-2 group py-0.5 rounded transition-colors px-1 ${selectionMode ? "cursor-pointer" : "cursor-pointer hover:bg-gray-100"} ${isSelected ? "bg-blue-50" : ""}`}
        onClick={handleClick}
      >
        {/* Checkbox (in selection mode) */}
        {selectionMode && (
          <span
            onClick={handleCheckboxClick}
            className="flex-shrink-0 cursor-pointer"
            style={{ color: isSelected ? "#0078d4" : "#999" }}
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </span>
        )}

        {/* Tree connector */}
        <span className="text-gray-400 select-none w-auto" style={{ minWidth: "0", fontFamily: "monospace" }}>
          {depth > 0 ? finalPrefix : ""}
        </span>

        {/* Expand/collapse arrow */}
        <span
          className="select-none w-4 flex-shrink-0 cursor-pointer"
          style={{ color: labelColor }}
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        >
          {hasChildren ? (expanded ? "▼" : "▶") : ""}
        </span>

        {/* Prefix for leaf items */}
        <span className="flex-shrink-0" style={{ color: labelColor }}>{prefix}</span>

        {/* Name */}
        <span className="truncate" style={{ color: labelColor }}>{displayName}</span>
        {spec.locked && <span className="ml-1" title="Locked">🔒</span>}

        {/* Image thumbnail */}
        {spec.imageUrl && (
          <img
            src={spec.imageUrl}
            alt=""
            className="w-5 h-5 rounded object-cover flex-shrink-0"
          />
        )}

        {/* Child count badge */}
        {childCount > 0 && !selectionMode && (
          <span
            className="text-xs px-1 rounded flex-shrink-0"
            style={{ backgroundColor: labelColor + "22", color: labelColor }}
          >
            {childCount}
          </span>
        )}

        {/* Selected count badge */}
        {selectionMode && (
          <span
            className="text-xs px-1 rounded flex-shrink-0"
            style={{ backgroundColor: "#0078d422", color: "#0078d4" }}
          >
            {childCount > 0 ? `${childCount} items` : "leaf"}
          </span>
        )}

        {/* Action buttons (hidden in selection mode) */}
        {!selectionMode && (
          <div className="hidden group-hover:flex items-center gap-0.5 ml-auto flex-shrink-0">
            {onAddChild && (
              <button
                onClick={(e) => { e.stopPropagation(); onAddChild(spec.id); }}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                title="Add child"
              >
                <Plus className="w-3.5 h-3.5" style={{ color: RED }} />
              </button>
            )}
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(spec); }}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5" style={{ color: BLUE }} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(spec.id); }}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" style={{ color: RED }} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {spec.children!.map((child, idx) => (
            <SpecNode
              key={child.id}
              spec={child as SpecNodeData}
              depth={depth + 1}
              isLast={idx === spec.children!.length - 1}
              ancestorHasExpander={hasChildren}
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SpecTreeProps {
  specs: SpecNodeData[];
  onEdit?: (spec: SpecNodeData) => void;
  onDelete?: (id: string) => void;
  onMultiDelete?: (ids: string[]) => void;
  onAddChild?: (parentId: string) => void;
  onSelect?: (spec: SpecNodeData) => void;
}

export default function SpecTree({ specs, onEdit, onDelete, onMultiDelete, onAddChild, onSelect }: SpecTreeProps) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Collect all spec IDs recursively
  const collectAllIds = (nodes: SpecNodeData[]): string[] => {
    const ids: string[] = [];
    const collect = (nodes: SpecNodeData[]) => {
      nodes.forEach(n => {
        ids.push(n.id);
        if (n.children) collect(n.children);
      });
    };
    collect(nodes);
    return ids;
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = collectAllIds(specs);
    setSelectedIds(new Set(allIds));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleExitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected item${selectedIds.size !== 1 ? "s" : ""}?`)) return;
    onMultiDelete?.(Array.from(selectedIds));
    handleExitSelectionMode();
  };

  if (specs.length === 0) {
    return (
      <div className="text-center py-16 font-mono">
        <p className="text-gray-400 text-sm uppercase tracking-widest">No specs yet.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header toolbar */}
      <div
        className="flex items-center justify-between px-3 py-2 mb-2 rounded"
        style={{ backgroundColor: "#f0f0f0", border: "1px solid #d1d1d1" }}
      >
        {selectionMode ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold" style={{ color: "#0078d4" }}>
                {selectedIds.size} selected
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold hover:bg-gray-200 transition-colors"
                style={{ color: "#0078d4" }}
              >
                <Check className="w-3 h-3" /> Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold hover:bg-gray-200 transition-colors"
                style={{ color: "#6e6e6e" }}
              >
                <X className="w-3 h-3" /> Deselect
              </button>
              <div className="w-px h-4 bg-gray-400 mx-1" />
              <button
                onClick={handleExitSelectionMode}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold hover:bg-gray-200 transition-colors"
                style={{ color: "#6e6e6e" }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="text-xs" style={{ color: "#6e6e6e" }}>
              {specs.length} root item{specs.length !== 1 ? "s" : ""}
            </span>
            {onMultiDelete && (
              <button
                onClick={() => setSelectionMode(true)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold hover:bg-gray-200 transition-colors"
                style={{ color: RED }}
              >
                <CheckSquare className="w-3.5 h-3.5" /> Multi-Delete
              </button>
            )}
          </>
        )}
      </div>

      {/* Tree */}
      <div className="space-y-0 font-mono text-sm">
        {specs.map((spec, idx) => (
          <SpecNode
            key={spec.id}
            spec={spec}
            depth={0}
            isLast={idx === specs.length - 1}
            ancestorHasExpander={false}
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Floating delete bar */}
      {selectionMode && selectedIds.size > 0 && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl z-50"
          style={{ backgroundColor: "#ffffff", border: "2px solid #d1d1d1" }}
        >
          <span className="text-sm font-bold" style={{ color: "#1a1a1a" }}>
            {selectedIds.size} selected
          </span>
          <button
            onClick={handleDeleteSelected}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: RED }}
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </button>
          <button
            onClick={handleExitSelectionMode}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors hover:bg-gray-100"
            style={{ backgroundColor: "#f0f0f0", color: "#1a1a1a" }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
