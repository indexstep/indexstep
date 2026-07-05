"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import type { SpecChild } from "@/lib/types";

const RED = "#C8102E";
const BLUE = "#2C5FE6";

interface SpecNodeData extends SpecChild {
  details?: string;
  parentId?: string | null;
  imageUrl?: string | null;
  viewCount?: number;
  likeCount?: number;
  followCount?: number;
  _count?: { children: number };
}

interface SpecNodeProps {
  spec: SpecNodeData;
  depth?: number;
  isLast?: boolean;
  // which ancestor depths had non-last children — true means that ancestor
  // had more siblings after the branch we're on, so we need a | at this depth
  nonLastAtDepth: boolean[];
  onEdit?: (spec: SpecNodeData) => void;
  onDelete?: (id: string) => void;
  onAddChild?: (parentId: string) => void;
}

/** Build the leading tree prefix for a node at `depth` with `nonLastAtDepth`. */
function treePrefix(depth: number, nonLastAtDepth: boolean[]): string {
  if (depth === 0) return "";
  let prefix = "";
  for (let d = 0; d < depth; d++) {
    prefix += nonLastAtDepth[d] ? "│ " : "  ";
  }
  return prefix;
}

function SpecNode({
  spec,
  depth = 0,
  isLast = false,
  nonLastAtDepth,
  onEdit,
  onDelete,
  onAddChild,
}: SpecNodeProps) {
  const hasChildren = !!(spec.children && spec.children.length > 0);
  const childCount = spec._count?.children ?? spec.children?.length ?? 0;

  // Each node manages its own expanded state
  const [expanded, setExpanded] = useState(depth < 2);

  const isRedNode = hasChildren;
  const labelColor = isRedNode ? RED : BLUE;
  const displayName = spec.name.toUpperCase();
  const prefix = depth > 0 && !hasChildren ? "+ " : "";

  // Build tree connector: ├─ or └─ at this node's depth
  const depthConnector = depth > 0
    ? (isLast ? "└─ " : "├─ ")
    : "";

  const fullPrefix = treePrefix(depth, nonLastAtDepth) + depthConnector;

  // For children: pass nonLastAtDepth updated with whether THIS node is last
  const childNonLast: boolean[] = [
    ...nonLastAtDepth,
    !isLast,
  ];

  return (
    <div className="select-none font-mono text-sm leading-6">
      {/* This node's row */}
      <div
        className="flex items-center gap-1 cursor-pointer group py-0.5 px-1 rounded hover:bg-gray-100 transition-colors whitespace-nowrap"
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {/* Tree prefix (│ or spaces + ├ or └) */}
        <span className="text-gray-400 select-none" style={{ fontFamily: "monospace" }}>
          {fullPrefix}
        </span>

        {/* Expand/collapse arrow */}
        <span className="select-none w-4 flex-shrink-0" style={{ color: labelColor, fontFamily: "monospace" }}>
          {hasChildren ? (expanded ? "▼" : "▶") : ""}
        </span>

        {/* Prefix for leaf items */}
        <span className="flex-shrink-0" style={{ color: labelColor, fontFamily: "monospace" }}>
          {prefix}
        </span>

        {/* Name */}
        <span className="truncate" style={{ color: labelColor, fontFamily: "monospace" }}>
          {displayName}
        </span>

        {/* Image thumbnail */}
        {spec.imageUrl && (
          <img
            src={spec.imageUrl}
            alt=""
            className="w-5 h-5 rounded object-cover flex-shrink-0"
          />
        )}

        {/* Child count */}
        {childCount > 0 && (
          <span
            className="text-xs px-1 rounded flex-shrink-0"
            style={{ backgroundColor: labelColor + "22", color: labelColor, fontFamily: "monospace" }}
          >
            {childCount}
          </span>
        )}

        {/* Action buttons */}
        <div className="hidden group-hover:flex items-center gap-0.5 ml-2 flex-shrink-0">
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
      </div>

      {/* Children — only rendered when expanded */}
      {hasChildren && expanded && (
        <div>
          {spec.children!.map((child, idx) => (
            <SpecNode
              key={child.id}
              spec={child as SpecNodeData}
              depth={depth + 1}
              isLast={idx === spec.children!.length - 1}
              nonLastAtDepth={childNonLast}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SpecTreeProps {
  specs: SpecNodeData[];
  allSpecs?: { id: string; name: string; depth?: number }[];
  onEdit?: (spec: SpecNodeData) => void;
  onDelete?: (id: string) => void;
  onAddChild?: (parentId: string) => void;
}

export default function SpecTree({ specs, allSpecs, onEdit, onDelete, onAddChild }: SpecTreeProps) {
  if (specs.length === 0) {
    return (
      <div className="text-center py-16 font-mono">
        <p className="text-gray-400 text-sm uppercase tracking-widest">NO SPECS YET</p>
      </div>
    );
  }

  return (
    <div className="space-y-0 font-mono text-sm">
      {specs.map((spec, idx) => (
        <SpecNode
          key={spec.id}
          spec={spec}
          depth={0}
          isLast={idx === specs.length - 1}
          nonLastAtDepth={[]}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  );
}
