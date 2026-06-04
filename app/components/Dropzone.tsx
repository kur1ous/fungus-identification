"use client";

import { useRef, useState, useEffect, useCallback, DragEvent } from "react";

interface DropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function Dropzone({ onFile, disabled }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      setPreview(url);
      onFile(file);
    },
    [onFile]
  );

  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      if (disabled) return;
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/")
      );
      if (item) {
        const file = item.getAsFile();
        if (file) handleFile(file);
      }
    };
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [handleFile, disabled]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
      aria-label="Upload a fungus photo"
      className="relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden"
      style={{
        borderColor: dragging ? "#c4913a" : "#8b6f47",
        backgroundColor: dragging ? "rgba(196,145,58,0.06)" : "rgba(139,111,71,0.04)",
        minHeight: "220px",
        boxShadow: dragging
          ? "0 0 32px rgba(196,145,58,0.18)"
          : "0 0 0 rgba(0,0,0,0)",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {preview ? (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Uploaded fungus preview"
            className="w-full h-full object-cover"
            style={{ display: "block" }}
          />
          {!disabled && (
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
              style={{ backgroundColor: "rgba(26,26,20,0.6)" }}
            >
              <p className="text-sm font-medium tracking-wide" style={{ color: "#e8e0d0" }}>
                Click or drag to replace
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 p-10 text-center h-full min-h-[220px]">
          <div className="text-5xl select-none" aria-hidden>
            🍄
          </div>
          <div>
            <p className="text-base font-medium" style={{ color: "#e8e0d0" }}>
              Drop a photo here, or click to browse
            </p>
            <p className="text-sm mt-1" style={{ color: "#a09880" }}>
              You can also paste with{" "}
              <kbd
                className="px-1.5 py-0.5 rounded text-xs"
                style={{
                  backgroundColor: "rgba(139,111,71,0.2)",
                  color: "#c4913a",
                  border: "1px solid rgba(196,145,58,0.3)",
                }}
              >
                Ctrl+V
              </kbd>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
