"use client";

import Image from "next/image";
import { useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";

type GalleryPhoto = {
  id: string;
  url: string;
  alt?: string | null;
  caption?: string | null;
};

type GalleryGridProps = {
  photos: GalleryPhoto[];
  compact?: boolean;
};

export default function GalleryGrid({ photos, compact = false }: GalleryGridProps) {
  const [selected, setSelected] = useState<{ src: string; alt: string } | null>(null);

  return (
    <>
      <div className={compact ? "grid sm:grid-cols-2 md:grid-cols-4 gap-3" : "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"}>
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() =>
              setSelected({
                src: photo.url,
                alt: photo.alt ?? photo.caption ?? "Gallery photo",
              })
            }
            className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-slate-200 text-left"
          >
            <Image
              src={photo.url}
              alt={photo.alt ?? photo.caption ?? "Gallery photo"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes={compact ? "(max-width: 768px) 50vw, 25vw" : "(max-width: 1024px) 50vw, 25vw"}
            />
            {photo.caption && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <p className="text-white text-sm font-medium line-clamp-2">{photo.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      <ImageLightbox
        open={Boolean(selected)}
        src={selected?.src ?? ""}
        alt={selected?.alt ?? "Gallery image"}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
