"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import type { SpecChild } from "@/lib/types";

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
  isRed?: boolean;
  ancestorHasExpander?: boolean;
  onEdit?: (spec: SpecNodeData) => void;
  onDelete?: (id: string) => void;
  onAddChild?: (parentId: string) => void;
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
  isRed = true,
  ancestorHasExpander = false,
  onEdit,
  onDelete,
  onAddChild,
}: SpecNodeProps) {
  const hasChildren = !!(spec.children && spec.children.length > 0);
  const childCount = spec._count?.children ?? spec.children?.length ?? 0;

  const { indent, connector, finalPrefix } = getTreeParts(depth, isLast, ancestorHasExpander);

  const isRedNode = hasChildren;
  const labelColor = isRedNode ? RED : BLUE;

  const displayName = spec.name.toUpperCase();
  const prefix = depth > 0 && !hasChildren ? "+ " : "";

  return (
    <div className="select-none font-mono text-sm leading-7">
      <div
        className="flex items-center gap-2 cursor-pointer group py-0.5 hover:bg-gray-100 rounded transition-colors px-1"
        onClick={() => hasChildren && void 0}
      >
        {/* Tree connector */}
        <span className="text-gray-400 select-none w-auto" style={{ minWidth: "0", fontFamily: "monospace" }}>
          {depth > 0 ? finalPrefix : ""}
        </span>

        {/* Expand/collapse arrow */}
        <span className="select-none w-4 flex-shrink-0" style={{ color: labelColor }}>
          {hasChildren ? "▶" : ""}
        </span>

        {/* Prefix for leaf items */}
        <span className="flex-shrink-0" style={{ color: labelColor }}>{prefix}</span>

        {/* Name */}
        <span className="truncate" style={{ color: labelColor }}>{displayName}</span>

        {/* Image thumbnail */}
        {spec.imageUrl && (
          <img
            src={spec.imageUrl}
            alt=""
            className="w-5 h-5 rounded object-cover flex-shrink-0"
          />
        )}

        {/* Child count badge */}
        {childCount > 0 && (
          <span
            className="text-xs px-1 rounded flex-shrink-0"
            style={{ backgroundColor: labelColor + "22", color: labelColor }}
          >
            {childCount}
          </span>
        )}

        {/* Action buttons */}
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
      </div>

      {/* Children */}
      {hasChildren && (
        <div>
          {spec.children!.map((child, idx) => (
            <SpecNode
              key={child.id}
              spec={child as SpecNodeData}
              depth={depth + 1}
              isLast={idx === spec.children!.length - 1}
              isRed={false}
              ancestorHasExpander={hasChildren}
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
        <p className="text-gray-400 text-sm uppercase tracking-widest">No specs yet.</p>
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
          isRed={true}
          ancestorHasExpander={false}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  );
}
