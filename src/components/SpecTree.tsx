"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, GitBranch } from "lucide-react";
import type { SpecChild } from "@/lib/types";

interface SpecNodeData extends SpecChild {
  details?: string;
  parentId?: string | null;
  imageUrl?: string | null;
  viewCount?: number;
  likeCount?: number;
  followCount?: number;
}

interface SpecNodeProps {
  spec: SpecNodeData;
  depth?: number;
  onEdit?: (spec: SpecNodeData) => void;
  onDelete?: (id: string) => void;
  onAddChild?: (parentId: string) => void;
}

interface SpecTreeProps {
  specs: SpecNodeData[];
  allSpecs?: { id: string; name: string; depth?: number }[];
  onEdit?: (spec: SpecNodeData) => void;
  onDelete?: (id: string) => void;
  onAddChild?: (parentId: string) => void;
}

function SpecNode({
  spec,
  onEdit,
  onDelete,
  onAddChild,
  depth = 0,
}: SpecNodeProps & { spec: SpecNodeData; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = !!(spec.children && spec.children.length > 0);
  const childCount = spec._count?.children ?? spec.children?.length ?? 0;

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-lg mb-0.5 group hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]"
        style={{ paddingLeft: `${depth * 28 + 12}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          <button
            className="p-0.5 rounded hover:bg-[var(--bg-highlight)] transition-colors flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          >
            {expanded
              ? <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              : <ChevronRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            }
          </button>
        ) : (
          <span className="w-5 flex-shrink-0" />
        )}

        {spec.imageUrl ? (
          <img
            src={spec.imageUrl}
            alt=""
            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
            style={{ borderColor: spec.color, borderWidth: "2px", borderStyle: "solid" }}
          />
        ) : (
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: spec.color }} />
        )}

        {spec.icon && !spec.imageUrl && <span className="text-base flex-shrink-0">{spec.icon}</span>}
        <span className="flex-1 text-sm font-medium truncate" style={{ color: "var(--text)" }}>{spec.name}</span>

        {childCount > 0 && (
          <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: "var(--bg-highlight)", color: "var(--text-muted)" }}>
            {childCount}
          </span>
        )}

        <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
          {onAddChild && (
            <button
              onClick={(e) => { e.stopPropagation(); onAddChild(spec.id); }}
              className="p-1.5 rounded hover:bg-[var(--bg-highlight)] transition-colors"
              title="Add child spec"
            >
              <Plus className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(spec); }}
              className="p-1.5 rounded hover:bg-[var(--bg-highlight)] transition-colors"
              title="Edit spec"
            >
              <Edit2 className="w-3.5 h-3.5" style={{ color: "var(--text-secondary)" }} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(spec.id); }}
              className="p-1.5 rounded hover:bg-[var(--bg-highlight)] transition-colors"
              title="Delete spec"
            >
              <Trash2 className="w-3.5 h-3.5" style={{ color: "var(--error)" }} />
            </button>
          )}
        </div>
      </div>

      {expanded && hasChildren && (
        <div>
          {spec.children!.map((child) => (
            <SpecNode
              key={child.id}
              spec={child as SpecNodeData}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SpecTree({ specs, allSpecs, onEdit, onDelete, onAddChild }: SpecTreeProps) {
  if (specs.length === 0) {
    return (
      <div className="text-center py-16">
        <GitBranch className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
        <p style={{ color: "var(--text-muted)" }} className="text-sm">No specs yet. Create your first one above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {specs.map((spec) => (
        <SpecNode
          key={spec.id}
          spec={spec}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
          depth={0}
        />
      ))}
    </div>
  );
}
