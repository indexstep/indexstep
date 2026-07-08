"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Eye, Users, Edit2, Paperclip, ChevronRight, ChevronLeft, ArrowUp, RefreshCw, Home } from "lucide-react";
import Button from "@/components/Button";
import SpecTree from "@/components/SpecTree";
import { useAuth } from "@/contexts/AuthContext";

const WIN_BG = "#f3f3f3";
const WIN_PANEL = "#ffffff";
const WIN_BORDER = "#d1d1d1";
const WIN_TOOLBAR_BG = "#f9f9f9";
const WIN_STATUS_BG = "#e8e8e8";
const TEXT = "#1a1a1a";
const TEXT_MUTED = "#6e6e6e";
const ACCENT = "#0078d4";
const ROW_ALT = "#f9f9f9";

interface SpecNodeData {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  imageUrl?: string | null;
  authorId?: string;
  _count: { children: number };
  details?: string;
  parentId?: string | null;
  viewCount?: number;
  likeCount?: number;
  followCount?: number;
  children?: SpecNodeData[];
}

interface SpecAttachment {
  id: string;
  name: string;
  fileUrl: string;
  fileType: string;
  mimeType: string | null;
  size: number;
  createdAt: string;
}

interface SpecData {
  id: string;
  name: string;
  details: string;
  color: string;
  icon: string | null;
  imageUrl: string | null;
  viewCount: number;
  likeCount: number;
  followCount: number;
  author: { id: string; name: string };
  parent: { id: string; name: string } | null;
  children: SpecNodeData[];
  attachments: SpecAttachment[];
}

// Build breadcrumb path from root to selected node
function buildPath(node: SpecNodeData | null, treeSpecs: any[], rootName: string): string[] {
  if (!node) return [rootName];
  const path: string[] = [rootName];

  const findPath = (nodes: any[], target: string, chain: string[]): string[] | null => {
    for (const n of nodes) {
      const newChain = [...chain, n.name];
      if (n.id === target) return newChain;
      if (n.children) {
        const result = findPath(n.children, target, newChain);
        if (result) return result;
      }
    }
    return null;
  };

  const result = findPath(treeSpecs, node.id, []);
  return result ? [...path, ...result] : path;
}

// Simple text row — name and value on ONE line, like a plain text file
function RegistryRow({
  name,
  value,
  isAlt,
  depth,
  onClick,
  onChildClick,
  hasChildren,
}: {
  name: string;
  value: string;
  isAlt: boolean;
  depth: number;
  onClick?: () => void;
  onChildClick?: () => void;
  hasChildren?: boolean;
}) {
  const RED = "#C8102E";
  const BLUE = "#2C5FE6";
  const nameColor = depth % 2 === 0 ? RED : BLUE;

  return (
    <div
      className="flex items-center cursor-pointer group px-3 gap-2"
      style={{
        backgroundColor: isAlt ? ROW_ALT : WIN_PANEL,
        borderBottom: `1px solid ${WIN_BORDER}`,
        minHeight: "23px",
      }}
      onClick={onClick}
      onDoubleClick={hasChildren ? onChildClick : undefined}
    >
      {hasChildren ? (
        <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: TEXT_MUTED }} />
      ) : null}
      <span
        className="text-sm font-mono truncate"
        style={{ color: nameColor, fontWeight: "500" }}
      >
        {name}
      </span>
      <span className="text-sm font-mono truncate" style={{ color: TEXT }}>
        {value}
      </span>
    </div>
  );
}

export default function SpecDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [spec, setSpec] = useState<SpecData | null>(null);
  const [treeSpecs, setTreeSpecs] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<SpecNodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likedByMe, setLikedByMe] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [followedByMe, setFollowedByMe] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const nodeDataRef = useRef<Map<string, SpecNodeData>>(new Map());
  const [nodeDepths, setNodeDepths] = useState<Map<string, number>>(new Map());
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const fetchSpec = useCallback(async (pwd?: string) => {
    try {
      const specUrl = pwd ? `/api/specs/${id}?password=${encodeURIComponent(pwd)}` : `/api/specs/${id}`;
      const [specRes, treeRes] = await Promise.all([
        fetch(specUrl),
        fetch("/api/specs"),
      ]);

      if (specRes.status === 401) {
        const data = await specRes.json();
        if (data.passwordRequired) {
          setPasswordRequired(true);
          setPasswordError(true);
          setLoading(false);
          return;
        }
      }
      if (!specRes.ok) throw new Error(`HTTP ${specRes.status}`);
      const specData = await specRes.json();
      setSpec(specData.spec);
      setLikedByMe(specData.likedByMe);
      setFollowedByMe(specData.followedByMe);
      setPasswordRequired(false);
      setPasswordError(false);

      if (treeRes.ok) {
        const treeData = await treeRes.json();
        setTreeSpecs(treeData.specs || []);
        // Clear and rebuild cache
        nodeDataRef.current.clear();
        const cacheNodes = (nodes: any[]) => {
          nodes.forEach(n => {
            nodeDataRef.current.set(n.id, n);
            if (n.children) cacheNodes(n.children);
          });
        };
        cacheNodes(treeData.specs || []);
      }
    } catch {
      setError("Failed to load spec");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchSpec(); }, [fetchSpec]);

  // Navigate to a node (adds to history)
  const navigateTo = (node: SpecNodeData | null) => {
    setSelectedNode(node);
    setHistory(prev => [...prev.slice(0, historyIndex + 1), node?.id || ""]);
    setHistoryIndex(prev => prev + 1);
    // Calculate depth for all nodes under this one
    if (node) {
      const depths = new Map<string, number>();
      const calcDepth = (n: any, d: number) => {
        depths.set(n.id, d);
        if (n.children) n.children.forEach((c: any) => calcDepth(c, d + 1));
      };
      calcDepth(node, 0);
      setNodeDepths(depths);
    }
  };

  const handleBack = () => {
    if (historyIndex <= 0) return;
    const prevId = history[historyIndex - 1];
    const node = prevId ? nodeDataRef.current.get(prevId) || null : null;
    setSelectedNode(node);
    setHistoryIndex(prev => prev - 1);
  };

  const handleForward = () => {
    if (historyIndex >= history.length - 1) return;
    const nextId = history[historyIndex + 1];
    const node = nextId ? nodeDataRef.current.get(nextId) || null : null;
    setSelectedNode(node);
    setHistoryIndex(prev => prev + 1);
  };

  const handleUp = () => {
    // Go up one level (to parent)
    if (!selectedNode && spec) {
      // Already at root spec level, go to root tree
      setSelectedNode(null);
    } else if (selectedNode?.parentId) {
      const parent = nodeDataRef.current.get(selectedNode.parentId);
      if (parent) navigateTo(parent);
    } else {
      setSelectedNode(null);
    }
  };

  const handleLike = async () => {
    if (!user) { router.push("/login"); return; }
    setLikeLoading(true);
    try {
      const res = await fetch(`/api/specs/${id}/like`, { method: likedByMe ? "DELETE" : "POST" });
      if (res.ok) {
        setLikedByMe(!likedByMe);
        setSpec(prev => prev ? { ...prev, likeCount: likedByMe ? prev.likeCount - 1 : prev.likeCount + 1 } : null);
      }
    } finally {
      setLikeLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) { router.push("/login"); return; }
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/specs/${id}/follow`, { method: followedByMe ? "DELETE" : "POST" });
      if (res.ok) {
        setFollowedByMe(!followedByMe);
        setSpec(prev => prev ? { ...prev, followCount: followedByMe ? prev.followCount - 1 : prev.followCount + 1 } : null);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const handleTreeSelect = (node: SpecNodeData) => {
    const cached = nodeDataRef.current.get(node.id);
    navigateTo(cached || node);
  };

  const canEdit = user?.id === spec?.author?.id || user?.role === "ADMIN" || user?.role === "MODERATOR";

  // Build breadcrumb path
  const breadcrumbPath = buildPath(selectedNode, treeSpecs, spec?.name || "");
  const currentItems: SpecNodeData[] = selectedNode?.children || spec?.children || [];
  // Depth of the selected node: items shown are at depth selectedNodeDepth + 1
  const selectedNodeDepth = selectedNode ? (nodeDepths.get(selectedNode.id) ?? 0) : -1;

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)]" style={{ backgroundColor: WIN_BG }}>
        <div className="flex items-center justify-center flex-1">
          <RefreshCw className="w-6 h-6 animate-spin" style={{ color: ACCENT }} />
        </div>
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center" style={{ backgroundColor: WIN_BG }}>
        <div className="win-panel p-8 text-center" style={{ maxWidth: "400px", width: "100%" }}>
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: TEXT }}>This Spec is Password Protected</h2>
          <p className="text-sm mb-6" style={{ color: TEXT_MUTED }}>Enter the password to view this spec.</p>
          <form
            onSubmit={(e) => { e.preventDefault(); fetchSpec(passwordInput); }}
            className="space-y-3"
          >
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 rounded-lg border text-sm"
              style={{ backgroundColor: WIN_PANEL, borderColor: passwordError ? RED : WIN_BORDER, color: TEXT }}
              autoFocus
            />
            {passwordError && (
              <p className="text-xs" style={{ color: RED }}>Incorrect password. Try again.</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: ACCENT }}
              >
                Unlock
              </button>
              <button
                type="button"
                onClick={() => router.push("/specs")}
                className="flex-1 py-2 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: WIN_TOOLBAR_BG, color: TEXT }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (error || !spec) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center" style={{ backgroundColor: WIN_BG }}>
        <p style={{ color: "#d13438" }}>{error || "Spec not found"}</p>
        <Button onClick={() => router.push("/specs")} className="mt-4">Back to Specs</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden" style={{ backgroundColor: WIN_BG }}>
      {/* ── TOOLBAR ── */}
      <div
        className="flex items-center gap-1 px-2 py-1"
        style={{
          backgroundColor: WIN_TOOLBAR_BG,
          borderBottom: `1px solid ${WIN_BORDER}`,
        }}
      >
        {/* Back */}
        <button
          onClick={handleBack}
          disabled={historyIndex <= 0}
          className="flex items-center justify-center w-7 h-7 rounded hover:bg-[#e0e0e0] disabled:opacity-40 disabled:cursor-default transition-colors"
          title="Back"
        >
          <ChevronLeft className="w-4 h-4" style={{ color: TEXT }} />
        </button>
        {/* Forward */}
        <button
          onClick={handleForward}
          disabled={historyIndex >= history.length - 1}
          className="flex items-center justify-center w-7 h-7 rounded hover:bg-[#e0e0e0] disabled:opacity-40 disabled:cursor-default transition-colors"
          title="Forward"
        >
          <ChevronRight className="w-4 h-4" style={{ color: TEXT }} />
        </button>
        {/* Up */}
        <button
          onClick={handleUp}
          className="flex items-center justify-center w-7 h-7 rounded hover:bg-[#e0e0e0] transition-colors"
          title="Up"
        >
          <ArrowUp className="w-4 h-4" style={{ color: TEXT }} />
        </button>
        {/* Refresh */}
        <button
          onClick={fetchSpec}
          className="flex items-center justify-center w-7 h-7 rounded hover:bg-[#e0e0e0] transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" style={{ color: TEXT }} />
        </button>

        <div className="w-px h-5 mx-1" style={{ backgroundColor: WIN_BORDER }} />

        {/* Address bar */}
        <div
          className="flex items-center flex-1 px-2 py-1 rounded text-sm font-mono"
          style={{
            backgroundColor: WIN_PANEL,
            border: `1px solid ${WIN_BORDER}`,
            color: TEXT,
            height: "28px",
          }}
        >
          <Home className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" style={{ color: TEXT_MUTED }} />
          {breadcrumbPath.map((part, idx) => {
            const depth = idx; // 0=root spec, 1+=children
            const color = depth % 2 === 0 ? "#C8102E" : "#2C5FE6";
            return (
              <span key={idx} className="flex items-center">
                {idx > 0 && <ChevronRight className="w-3 h-3 mx-1" style={{ color: TEXT_MUTED }} />}
                <span style={{ color }}>
                  {part}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Tree panel */}
        <div
          className="flex flex-col overflow-hidden"
          style={{
            width: "300px",
            backgroundColor: WIN_PANEL,
            borderRight: `1px solid ${WIN_BORDER}`,
          }}
        >
          <div
            className="px-3 py-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: TEXT_MUTED, borderBottom: `1px solid ${WIN_BORDER}` }}
          >
            Tree
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <SpecTree
              specs={treeSpecs}
              onSelect={handleTreeSelect as any}
              onEdit={(s) => router.push(`/specs?edit=${s.id}`)}
              onDelete={(sId) => {
                if (!confirm("Delete this spec?")) return;
                fetch(`/api/specs/${sId}`, { method: "DELETE" }).then((res) => {
                  if (res.ok) {
                    // If we deleted the selected node, go back
                    if (selectedNode?.id === sId) {
                      if (selectedNode.parentId) {
                        const parent = nodeDataRef.current.get(selectedNode.parentId);
                        if (parent) navigateTo(parent);
                        else setSelectedNode(null);
                      } else {
                        setSelectedNode(null);
                      }
                    }
                    fetchSpec();
                  }
                });
              }}
              onMultiDelete={(ids) => {
                if (!confirm(`Delete ${ids.length} items? This cannot be undone.`)) return;
                Promise.all(ids.map(id => fetch(`/api/specs/${id}`, { method: "DELETE" }))).then(() => {
                  // If any deleted was the selected node, go back
                  if (selectedNode && ids.includes(selectedNode.id)) {
                    setSelectedNode(null);
                  }
                  fetchSpec();
                });
              }}
              onAddChild={(parentId) => router.push(`/specs?childOf=${parentId}`)}
            />
          </div>
        </div>

        {/* RIGHT: Registry list panel */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: WIN_PANEL }}>
          {/* Leaf view: sticky name header + scrollable value */}
          {(() => {
            const isLeaf = !selectedNode || !selectedNode.children || selectedNode.children.length === 0;
            if (isLeaf && selectedNode?.details) {
              return (
                <>
                  {/* Sticky name box — always visible, full name shown */}
                  <div
                    style={{
                      backgroundColor: "#2C5FE6",
                      borderBottom: `3px solid #1a3fa0`,
                      flexShrink: 0,
                    }}
                  >
                    <div className="px-4 py-2">
                      <span
                        className="text-sm font-semibold font-mono"
                        style={{ color: "#ffffff", overflowWrap: "anywhere" }}
                      >
                        {selectedNode.icon ? `${selectedNode.icon}  ${selectedNode.name}` : selectedNode.name}
                      </span>
                    </div>
                    {/* Divider line below name */}
                    <div style={{ height: "2px", backgroundColor: "#ffffff", opacity: 0.4 }} />
                  </div>
                  {/* Scrollable value */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div
                      className="rounded-lg border font-mono text-sm"
                      style={{
                        backgroundColor: "#f0f7ff",
                        border: "2px solid #2C5FE6",
                        color: TEXT,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        lineHeight: "1.6",
                        padding: "16px",
                      }}
                    >
                      {selectedNode.details}
                    </div>
                  </div>
                </>
              );
            }
            // Not a leaf — show normal registry list
            return (
              <>
                <div
                  className="flex items-center px-3 gap-2"
                  style={{
                    backgroundColor: WIN_TOOLBAR_BG,
                    borderBottom: `2px solid ${WIN_BORDER}`,
                    height: "26px",
                    flexShrink: 0,
                  }}
                >
                  <span className="text-xs font-semibold" style={{ color: TEXT_MUTED }}>Name</span>
                  <span className="text-xs font-semibold" style={{ color: TEXT_MUTED }}>Value</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {currentItems.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-sm" style={{ color: TEXT_MUTED }}>
                        {selectedNode ? `No values for "${selectedNode.name}"` : "Select an item from the tree"}
                      </span>
                    </div>
                  ) : (
                    currentItems.map((item, idx) => (
                      <RegistryRow
                        key={item.id}
                        name={item.icon ? `${item.icon} ${item.name}` : item.name}
                        value={item.details || ""}
                        isAlt={idx % 2 === 1}
                        depth={selectedNodeDepth + 1}
                        hasChildren={!!(item.children && item.children.length > 0)}
                        onClick={() => { if (item.children?.length) navigateTo(item); }}
                        onChildClick={() => navigateTo(item)}
                      />
                    ))
                  )}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* ── STATUS BAR ── */}
      <div
        className="flex items-center justify-between px-3 py-1 text-xs font-mono"
        style={{
          backgroundColor: WIN_STATUS_BG,
          borderTop: `1px solid ${WIN_BORDER}`,
          color: TEXT_MUTED,
        }}
      >
        <div className="flex items-center gap-4">
          <span>{currentItems.length} item{currentItems.length !== 1 ? "s" : ""}</span>
          {selectedNode && (
            <span>{(selectedNode.children || []).length} sub-item{(selectedNode.children || []).length !== 1 ? "s" : ""}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{spec.viewCount}</span>
          <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{spec.likeCount}</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{spec.followCount}</span>
          {canEdit && (
            <button
              onClick={() => router.push(`/specs?edit=${id}`)}
              className="px-2 py-0.5 rounded hover:bg-[#d0d0d0] transition-colors"
              style={{ color: TEXT }}
            >
              ✎ Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
