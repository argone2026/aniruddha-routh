"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Doodle = {
  id: string;
  imageUrl: string;
  title: string | null;
  createdAt: string | Date;
};

const SHAPES = [
  "polygon(20% 0%, 100% 0%, 100% 80%, 0% 100%)",
  "polygon(0% 15%, 100% 0%, 100% 100%, 0% 85%)",
  "polygon(30% 0%, 100% 20%, 70% 100%, 0% 80%)",
  "polygon(0% 20%, 80% 0%, 100% 100%, 20% 90%)",
  "polygon(25% 0%, 100% 10%, 90% 100%, 0% 85%)",
  "polygon(0% 0%, 100% 15%, 100% 100%, 0% 90%)",
  "polygon(10% 0%, 85% 5%, 95% 100%, 5% 95%)",
  "polygon(15% 0%, 100% 0%, 85% 100%, 0% 90%)",
];

const ROTATIONS = ["-3deg", "-1deg", "2deg", "-2deg", "1deg", "-1.5deg"];

export default function DoodlesGrid({ doodles }: { doodles: Doodle[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !doodles || doodles.length === 0) {
    return null;
  }

  // Get random shape and rotation for each doodle
  const getDoodleStyle = (index: number) => {
    const shape = SHAPES[index % SHAPES.length];
    const rotation = ROTATIONS[index % ROTATIONS.length];
    return { shape, rotation };
  };

  return (
    <section className="relative w-full py-16 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 bg-gradient-to-b from-slate-100 to-slate-50">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            ✨ Creative Canvas
          </span>
          <h2 className="mt-2 text-4xl font-bold dark:text-slate-50 text-slate-950">
            Doodle Gallery
          </h2>
          <p className="mt-3 text-sm dark:text-slate-400 text-slate-600 max-w-xl mx-auto">
            Raw thoughts. Unfiltered creativity. {doodles.length} doodles saved so far 🎨
          </p>
        </div>

        {/* Irregular Grid Layout */}
        <div className="relative h-auto">
          <div
            className="grid gap-6 sm:gap-8"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {doodles.map((doodle, index) => {
              const { shape, rotation } = getDoodleStyle(index);

              return (
                <div
                  key={doodle.id}
                  className="flex justify-center items-center group perspective"
                >
                  {/* Outer irregular container with rotation */}
                  <div
                    className="relative w-full aspect-square transform transition-all duration-300 hover:scale-105 hover:z-10 hover:shadow-2xl cursor-pointer"
                    style={{
                      transform: `rotate(${rotation})`,
                    }}
                  >
                    {/* Inner container with clip-path */}
                    <div
                      className="w-full h-full relative overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 shadow-lg group-hover:shadow-2xl transition-all duration-300"
                      style={{
                        clipPath: shape,
                      }}
                    >
                      {/* Image */}
                      <Image
                        src={doodle.imageUrl}
                        alt={doodle.title ?? "doodle"}
                        fill
                        className="object-cover w-full h-full"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />

                      {/* Overlay on hover with timestamp */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <div className="text-white">
                          <p className="text-xs font-medium opacity-90">
                            {new Date(doodle.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm dark:text-slate-400 text-slate-600">
            <a
              href="#interactive-zone"
              className="font-semibold dark:text-indigo-400 text-indigo-600 hover:underline transition-all"
            >
              Create your own →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
