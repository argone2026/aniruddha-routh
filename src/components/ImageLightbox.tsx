"use client";

import Image from "next/image";
import { useEffect } from "react";
import { X } from "lucide-react";

type ImageLightboxProps = {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
};

export default function ImageLightbox({ open, src, alt, onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 p-4 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
        aria-label="Close image preview"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative w-full h-full max-w-6xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <Image src={src} alt={alt} fill className="object-contain" sizes="100vw" priority />
      </div>
    </div>
  );
}
