"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";
import SpecTree from "@/components/SpecTree";
import SpecForm from "@/components/SpecForm";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import type { SpecChild } from "@/lib/types";
import { Plus, GitBranch, Layers } from "lucide-react";

const RED = "#C8102E";
const BLUE = "#2C5FE6";

interface SpecItem extends SpecChild {
  details?: string;
  parentId?: string | null;
  imageUrl?: string | null;
  children?: SpecItem[];
}

function SpecsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [specs, setSpecs] = useState<SpecItem[]>([]);
  const [allSpecsFlat, setAllSpecsFlat] = useState<{ id: string; name: string; depth?: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSpec, setEditingSpec] = useState<SpecItem | null>(null);
  const [childParentId, setChildParentId] = useState<string | null>(null);

  const fetchSpecs = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/specs?rootOnly=true");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSpecs(data.specs || []);
    } catch (err) {
      console.error("fetchSpecs error:", err);
      setFetchError("Failed to load specs.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllSpecs = useCallback(async () => {
    try {
      const res = await fetch("/api/specs");
      if (!res.ok) return;
      const data = await res.json();
      const flat: { id: string; name: string; depth: number }[] = [];
      const flatten = (items: SpecChild[], depth: number) => {
        for (const item of items) {
          flat.push({ id: item.id, name: item.name, depth });
          if (item.children?.length) flatten(item.children, depth + 1);
        }
      };
      flatten(data.specs || [], 0);
      setAllSpecsFlat(flat);
    } catch (err) {
      console.error("fetchAllSpecs error:", err);
    }
  }, []);

  useEffect(() => {
    fetchSpecs();
    fetchAllSpecs();
  }, [fetchSpecs, fetchAllSpecs]);

  // Handle ?edit= specId from URL (admin edit)
  useEffect(() => {
    if (!editId) return;
    const findSpec = async () => {
      const existing = specs.find(s => s.id === editId);
      if (existing) {
        setEditingSpec(existing);
        setShowForm(true);
      } else {
        try {
          const res = await fetch(`/api/specs/${editId}`);
          if (res.ok) {
            const data = await res.json();
            setEditingSpec(data.spec);
            setShowForm(true);
          }
        } catch {}
      }
    };
    if (specs.length > 0) findSpec();
  }, [editId, specs]);

  const handleCreate = async (data: { name: string; details: string; color: string; icon: string | null; imageUrl: string | null; parentId: string | null }) => {
    const res = await fetch("/api/specs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.status === 401) {
      window.location.href = "/login?redirect=/specs";
      return;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to create" }));
      throw new Error(err.error || "Failed to create");
    }
    await fetchSpecs();
    await fetchAllSpecs();
    setShowForm(false);
    setChildParentId(null);
  };

  const handleUpdate = async (data: { name: string; details: string; color: string; icon: string | null; imageUrl: string | null; parentId: string | null }) => {
    if (!editingSpec?.id) return;
    const res = await fetch(`/api/specs/${editingSpec.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.status === 401) {
      window.location.href = "/login?redirect=/specs";
      return;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to update" }));
      throw new Error(err.error || "Failed to update");
    }
    await fetchSpecs();
    await fetchAllSpecs();
    setEditingSpec(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this spec and all its children?")) return;
    const res = await fetch(`/api/specs/${id}`, { method: "DELETE" });
    if (res.status === 401) {
      window.location.href = "/login?redirect=/specs";
      return;
    }
    if (!res.ok) {
      alert("Failed to delete spec");
      return;
    }
    await fetchSpecs();
    await fetchAllSpecs();
  };

  const handleMultiDelete = async (ids: string[]) => {
    if (!confirm(`Delete ${ids.length} specs and all their children? This cannot be undone.`)) return;
    await Promise.all(ids.map(id => fetch(`/api/specs/${id}`, { method: "DELETE" })));
    await fetchSpecs();
    await fetchAllSpecs();
  };

  const openNewSpec = () => {
    setEditingSpec(null);
    setChildParentId(null);
    setShowForm(true);
  };

  const openAddChild = (parentId: string) => {
    setEditingSpec(null);
    setChildParentId(parentId);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff", fontFamily: "monospace" }}>
      <div className="border-b border-gray-200" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: RED }}>
                <GitBranch className="w-5 h-5" style={{ color: "#ffffff" }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-widest" style={{ color: RED }}>SPECIFICATIONS</h1>
                <p className="text-xs tracking-widest" style={{ color: BLUE }}>TREE-BASED SPECS AND DOCUMENTATION</p>
              </div>
            </div>
            <Button onClick={openNewSpec} className="gap-2 font-mono text-xs tracking-widest uppercase" style={{ backgroundColor: RED, color: "#ffffff", border: "none" }}>
              <Plus className="w-4 h-4" /> NEW SPEC
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="border p-5" style={{ backgroundColor: "#ffffff", borderColor: "#e5e5e5" }}>
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-2" style={{ color: "var(--text-muted)" }}>
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              ) : fetchError ? (
                <div className="text-center py-16 font-mono">
                  <p style={{ color: RED }}>{fetchError}</p>
                  <Button onClick={fetchSpecs} className="mt-4">Retry</Button>
                </div>
              ) : (
                <SpecTree
                  specs={specs as SpecItem[]}
                  onEdit={(spec) => { setEditingSpec(spec as SpecItem); setShowForm(true); }}
                  onDelete={handleDelete}
                  onMultiDelete={handleMultiDelete}
                  onAddChild={openAddChild}
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="border p-5" style={{ backgroundColor: "#ffffff", borderColor: "#e5e5e5" }}>
              <h3 className="text-xs font-bold tracking-widest mb-3 flex items-center gap-2 uppercase" style={{ color: RED }}>
                <Layers className="w-4 h-4" style={{ color: RED }} />
                HOW TO USE
              </h3>
              <ul className="space-y-2 text-xs font-mono tracking-wider" style={{ color: BLUE }}>
                <li>▶ SPECS ARE ORGANIZED IN A TREE</li>
                <li>▶ EACH SPEC CAN HAVE CHILDREN</li>
                <li>▶ CLICK + TO ADD A CHILD</li>
                <li>▶ ADD PICTURE + COLOR TO CATEGORIZE</li>
                <li>▶ ADD DETAILS TO DESCRIBE SPECS</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <Modal
          isOpen={true}
          onClose={() => { setShowForm(false); setEditingSpec(null); setChildParentId(null); }}
          title={editingSpec ? `Edit: ${editingSpec.name}` : childParentId ? "Add Child Spec" : "New Spec"}
        >
          <SpecForm
            initialData={editingSpec || undefined}
            parentId={childParentId}
            allSpecs={allSpecsFlat}
            onSubmit={editingSpec ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditingSpec(null); setChildParentId(null); }}
            submitLabel={editingSpec ? "Save Changes" : "Create Spec"}
          />
        </Modal>
      )}
    </div>
  );
}

export default function SpecsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ color: "var(--text-muted)" }}>Loading...</div>}>
      <SpecsContent />
    </Suspense>
  );
}
