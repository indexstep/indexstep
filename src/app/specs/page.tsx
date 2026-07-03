"use client";

import { useState, useCallback, useEffect } from "react";
import SpecTree from "@/components/SpecTree";
import SpecForm from "@/components/SpecForm";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import type { SpecChild } from "@/lib/types";
import { Plus, GitBranch, Layers } from "lucide-react";

interface SpecItem extends SpecChild {
  details?: string;
  parentId?: string | null;
  imageUrl?: string | null;
  children?: SpecItem[];
}

export default function SpecsPage() {
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
    <div className="min-h-screen">
      <div className="border-b" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--accent)" }}>
                <GitBranch className="w-5 h-5" style={{ color: "#0f0f14" }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Specifications</h1>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Tree-based specs and documentation</p>
              </div>
            </div>
            <Button onClick={openNewSpec}>
              <Plus className="w-4 h-4 mr-1" /> New Spec
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-2" style={{ color: "var(--text-muted)" }}>
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              ) : fetchError ? (
                <div className="text-center py-16">
                  <p style={{ color: "var(--error)" }}>{fetchError}</p>
                  <Button onClick={fetchSpecs} className="mt-4">Retry</Button>
                </div>
              ) : (
                <SpecTree
                  specs={specs as SpecItem[]}
                  onEdit={(spec) => { setEditingSpec(spec as SpecItem); setShowForm(true); }}
                  onDelete={handleDelete}
                  onAddChild={openAddChild}
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text)" }}>
                <Layers className="w-4 h-4" style={{ color: "var(--accent)" }} />
                How Specs Work
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <li>• Specs are organized in a <strong>tree structure</strong></li>
                <li>• Each spec can have <strong>child specs</strong></li>
                <li>• Click <strong>+</strong> on any spec to add a child</li>
                <li>• Add a <strong>picture</strong> and <strong>color</strong> to visually categorize</li>
                <li>• Add <strong>details</strong> to describe the spec fully</li>
                <li>• <strong>Click</strong> a node to expand/collapse children</li>
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
