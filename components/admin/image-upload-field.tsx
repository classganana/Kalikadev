"use client";

/**
 * Image upload field - Interactive upload with drag & drop, thumbnails, remove.
 */
import { useRef, useState } from "react";

interface ImageUploadFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  hint?: string;
}

export function ImageUploadField({
  value,
  onChange,
  placeholder = "https://example.com/image.jpg",
  disabled = false,
  label,
  hint,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const urls = value.split("\n").map((s) => s.trim()).filter(Boolean);

  const removeImage = (index: number) => {
    const next = urls.filter((_, i) => i !== index).join("\n");
    onChange(next);
  };

  const addUrls = (newUrls: string[]) => {
    const combined = [...urls, ...newUrls].filter(Boolean);
    onChange(combined.join("\n"));
  };

  const processFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    setUploadError("");
    setUploading(true);

    try {
      let accumulated = value;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Upload failed");
        }

        const { url } = await res.json();
        accumulated = accumulated ? `${accumulated}\n${url}` : url;
        onChange(accumulated);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || uploading) return;
    processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const getImageSrc = (url: string) => {
    if (url.startsWith("http")) return url;
    return url.startsWith("/") ? url : `/${url.replace(/^\//, "")}`;
  };

  return (
    <div className="space-y-4">
      {(label || hint) && (
        <div className="space-y-1">
          {label && (
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {label}
            </p>
          )}
          {hint && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        className={`
          flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all
          ${isDragging ? "border-zinc-900 bg-zinc-100 dark:border-white dark:bg-zinc-800" : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500"}
          ${disabled || uploading ? "cursor-not-allowed opacity-60" : ""}
        `}
        style={{ minHeight: 140 }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <div className="size-10 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-white" />
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Uploading…
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8">
            <div className="rounded-full bg-zinc-200 p-3 dark:bg-zinc-700">
              <svg
                className="size-6 text-zinc-600 dark:text-zinc-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6 6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {isDragging ? "Drop images here" : "Click or drag images to upload"}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              JPEG, PNG, WebP, GIF · max 5MB each
            </p>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
      )}

      {/* Thumbnail grid */}
      {urls.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Images ({urls.length})
          </p>
          <div className="flex flex-wrap gap-3">
            {urls.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <div className="relative size-20 sm:size-24">
                  <img
                    src={getImageSrc(url)}
                    alt={`Preview ${index + 1}`}
                    className="size-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect fill='%23e4e4e7' width='96' height='96'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2371717a' font-size='12'%3E?%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute right-1 top-1 rounded-full bg-red-500/90 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                    aria-label="Remove image"
                  >
                    <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* URL paste */}
      <div>
        <p className="mb-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Or paste URL
        </p>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={2}
          placeholder={`One URL per line\n${placeholder}`}
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
        />
      </div>
    </div>
  );
}
