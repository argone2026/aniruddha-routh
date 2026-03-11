"use client";

import Image from "next/image";
import { useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";

type HobbyItem = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string | null;
};

type HobbyCardsProps = {
  hobbies: HobbyItem[];
};

export default function HobbyCards({ hobbies }: HobbyCardsProps) {
  const [selected, setSelected] = useState<{ src: string; alt: string } | null>(null);

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-6">
        {hobbies.map((hobby) => (
          <div
            key={hobby.id}
            className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md hover:border-rose-200 transition-all duration-300"
          >
            {hobby.imageUrl && (
              <button
                type="button"
                className="relative block w-full h-44 mb-4 rounded-xl overflow-hidden border border-slate-100"
                onClick={() =>
                  setSelected({
                    src: hobby.imageUrl as string,
                    alt: hobby.name,
                  })
                }
              >
                <Image
                  src={hobby.imageUrl}
                  alt={hobby.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </button>
            )}
            <h3 className="font-semibold text-slate-900 text-lg mb-1">{hobby.name}</h3>
            <p className="text-slate-500 leading-relaxed">{hobby.description}</p>
          </div>
        ))}
      </div>

      <ImageLightbox
        open={Boolean(selected)}
        src={selected?.src ?? ""}
        alt={selected?.alt ?? "Hobby image"}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
