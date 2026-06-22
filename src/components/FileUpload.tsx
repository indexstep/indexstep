"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
}

export default function FileUpload({ value, onChange, label = "Upload Image", accept = "image/*" }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      onChange(url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (value) {
    return (
      <div className="relative">
        <img src={value} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
        <button
          onClick={() => onChange("")}
          className="absolute top-2 right-2 p-1.5 bg-[var(--bg)]/80 rounded-full text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      {label && <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-150
          ${dragOver ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)] hover:border-[var(--border-light)] hover:bg-[var(--bg-secondary)]/50"}
        `}
      >
        <input ref={inputRef} type="file" accept={accept} onChange={handleInputChange} className="hidden" />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--text-secondary)]">Uploading...</p>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 mx-auto text-[var(--text-muted)] mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">
              Drag and drop an image, or <span className="text-[var(--accent)]">browse</span>
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">PNG, JPG, GIF, WebP up to 5MB</p>
          </>
        )}
      </div>
    </div>
  );
}
