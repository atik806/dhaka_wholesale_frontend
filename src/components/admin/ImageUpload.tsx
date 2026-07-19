"use client";

import { useState, useRef } from "react";
import { X, Loader2, ImagePlus } from "lucide-react";
import { API_BASE } from "@/src/lib/constants";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

function getToken(): string | null {
  try {
    const s = localStorage.getItem("admin_session");
    if (!s) return null;
    const session = JSON.parse(s);
    return session.session?.access_token || null;
  } catch {
    return null;
  }
}

export function ImageUpload({ value, onChange, maxImages = 8 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");
    const newUrls: string[] = [];
    const errors: string[] = [];
    const token = getToken();

    const remainingSlots = maxImages - value.length;
    const fileArray = Array.from(files);

    const oversized = fileArray.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      errors.push(`${oversized.map((f) => f.name).join(", ")} exceed 5MB limit`);
    }

    const validFiles = fileArray.filter((f) => f.size <= MAX_FILE_SIZE);
    const skippedCount = fileArray.length - Math.min(fileArray.length, remainingSlots);
    const filesToUpload = validFiles.slice(0, remainingSlots);

    if (skippedCount > 0) {
      errors.push(`${skippedCount} file(s) skipped (max ${maxImages} images)`);
    }

    const results = await Promise.allSettled(
      filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${API_BASE}/upload`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || data?.data?.message || `Upload failed (${res.status})`);
        }
        const url = data.data?.url || data.url;
        if (!url) throw new Error("No URL returned from upload");
        return url;
      })
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "fulfilled") {
        newUrls.push(result.value);
      } else {
        errors.push(result.reason?.message || `Upload ${i + 1} failed`);
      }
    }

    if (errors.length > 0) {
      setError(errors.join("; "));
    }

    if (newUrls.length > 0) {
      onChange([...value, ...newUrls]);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((url, i) => (
            <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length < maxImages && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-sm text-zinc-500 dark:text-zinc-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImagePlus className="w-4 h-4" />
            )}
            {uploading ? "Uploading..." : "Upload Images"}
          </button>
          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>
          )}
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            {value.length}/{maxImages} images (JPEG, PNG, WebP, max 5MB each)
          </p>
        </div>
      )}
    </div>
  );
}
