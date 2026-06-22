"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/Button";
import { Clock, RotateCcw, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

interface Version {
  id: string;
  title: string;
  editedAt: string;
  editReason: string | null;
  isFlagged: boolean;
}

interface VersionHistoryProps {
  tutorialId: string;
}

export default function VersionHistory({ tutorialId }: VersionHistoryProps) {
  const { user } = useAuth();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/tutorials/${tutorialId}/versions`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) setVersions(data.versions);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tutorialId, open]);

  const handleRestore = async (versionId: string) => {
    setRestoring(versionId);
    try {
      const res = await fetch(`/api/tutorials/${tutorialId}/versions/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to restore version");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setRestoring(null);
      setConfirmRestore(null);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--bg-highlight)]/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--accent)]" />
          <span className="font-medium text-[var(--text)]">Version History</span>
          {versions.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--bg-highlight)] text-[var(--text-muted)]">
              {versions.length} saved
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-[var(--text-secondary)]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--text-secondary)]" />
        )}
      </button>

      {open && (
        <div className="border-t border-[var(--border)] p-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : versions.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">
              No previous versions saved yet.
            </p>
          ) : (
            <div className="space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${
                    version.isFlagged
                      ? "border-[var(--red)]/50 bg-[var(--red)]/5"
                      : "border-[var(--border)] bg-[var(--bg)]"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[var(--text)] truncate">
                        {version.title}
                      </span>
                      {version.isFlagged && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[var(--red)]/20 text-[var(--red)]">
                          <AlertTriangle className="w-3 h-3" />Flagged
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(version.editedAt).toLocaleString()}
                      {version.editReason && (
                        <span className="ml-2 text-[var(--text-secondary)]">
                          — {version.editReason}
                        </span>
                      )}
                    </p>
                  </div>

                  {confirmRestore === version.id ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmRestore(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        loading={restoring === version.id}
                        onClick={() => handleRestore(version.id)}
                      >
                        Confirm Restore
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setConfirmRestore(version.id)}
                      className="flex-shrink-0"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />Restore
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-[var(--text-muted)] mt-3">
            Restoring a version saves the current state as a new version first, so you can always undo.
          </p>
        </div>
      )}
    </div>
  );
}
