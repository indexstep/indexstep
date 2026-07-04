"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Eye, MessageCircle } from "lucide-react";
import type { SpecChild } from "@/lib/types";

interface RedditThreadSpec extends SpecChild {
  details?: string;
  viewCount?: number;
  likeCount?: number;
  followCount?: number;
  commentCount?: number;
  children?: RedditThreadSpec[];
}

interface RedditThreadProps {
  spec: RedditThreadSpec;
  depth?: number;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  /** Colour of the dot on the left — passed from parent or defaults to blue */
  dotColor?: string;
  /** Which spec IDs are expanded */
  expandedIds: Set<string>;
  /** Callback when a spec is clicked (navigate to detail) */
  onNavigate?: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

// Status dot colours cycling per depth (Reddit uses colours to hint at sub-community)
const DOT_COLOURS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4"];

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function RedditThreadItem({
  spec,
  depth = 0,
  dotColor,
  expandedIds,
  onNavigate,
  onToggleExpand,
}: RedditThreadProps) {
  const hasChildren = !!(spec.children && spec.children.length > 0);
  const isExpanded = expandedIds.has(spec.id);
  const childCount = spec._count?.children ?? spec.children?.length ?? 0;

  const effectiveDot = dotColor || DOT_COLOURS[depth % DOT_COLOURS.length];

  return (
    <div className="select-none">
      {/* Thread line connecting to children */}
      <div
        className="flex items-start gap-2 py-2 px-3 rounded-lg mb-0.5 group cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
        onClick={() => onNavigate?.(spec.id)}
      >
        {/* Left: status dot + expand chevron */}
        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: effectiveDot }}
          />
          {hasChildren ? (
            <button
              className="p-0.5 rounded hover:bg-[var(--bg-highlight)] transition-colors"
              onClick={(e) => { e.stopPropagation(); onToggleExpand(spec.id); }}
            >
              {isExpanded
                ? <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                : <ChevronRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              }
            </button>
          ) : (
            <span className="w-4" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Emoji flair */}
            {spec.icon && <span className="text-base flex-shrink-0">{spec.icon}</span>}
            {/* Name */}
            <span className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
              {spec.name}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
            {spec.viewCount !== undefined && (
              <span className="flex items-center gap-0.5">
                <Eye className="w-3 h-3" />
                {formatCount(spec.viewCount)}
              </span>
            )}
            {childCount > 0 && (
              <span className="flex items-center gap-0.5">
                <MessageCircle className="w-3 h-3" />
                {childCount}
              </span>
            )}
            {spec.likeCount !== undefined && spec.likeCount > 0 && (
              <span className="flex items-center gap-0.5">
                ♥ {formatCount(spec.likeCount)}
              </span>
            )}
          </div>
        </div>

        {/* Comment count badge (Reddit-style) */}
        {childCount > 0 && (
          <div
            className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: "var(--bg-highlight)", color: "var(--text-secondary)" }}
          >
            {childCount}
          </div>
        )}
      </div>

      {/* Nested children */}
      {isExpanded && hasChildren && (
        <div>
          {spec.children!.map((child) => (
            <RedditThreadItem
              key={child.id}
              spec={child as RedditThreadSpec}
              depth={depth + 1}
              dotColor={effectiveDot}
              expandedIds={expandedIds}
              onNavigate={onNavigate}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}
