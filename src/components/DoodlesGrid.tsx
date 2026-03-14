"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Doodle = {
  id: string;
  imageUrl: string;
  title: string | null;
  createdAt: string | Date;
};

export default function DoodlesGrid({ doodles }: { doodles: Doodle[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !doodles || doodles.length === 0) {
    return null;
  }

  // Adaptive sizing based on doodle count
  const getDoodleSize = () => {
    const count = doodles.length;
    if (count === 1) return "120px";
    if (count === 2) return "140px";
    if (count <= 4) return "160px";
    return "180px";
  };

  const getContainerPadding = () => {
    const count = doodles.length;
    if (count === 1) return "py-4";
    if (count === 2) return "py-5";
    if (count <= 4) return "py-6";
    return "py-10";
  };

  const doodleSize = getDoodleSize();

  return (
    <section className={`relative w-full ${getContainerPadding()} dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 bg-gradient-to-b from-slate-100 to-slate-50`} id="doodles-gallery">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        {/* Header */}
        <div className={`${doodles.length > 4 ? "mb-8" : doodles.length > 2 ? "mb-5" : "mb-4"} text-center`}>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            ✨ Creative Canvas
          </span>
          <h2 className={`mt-1.5 ${doodles.length > 4 ? "text-3xl" : doodles.length > 2 ? "text-2xl" : "text-xl"} font-bold dark:text-slate-50 text-slate-950`}>
            Doodle Gallery
          </h2>
          <p className="mt-2 text-xs dark:text-slate-400 text-slate-600 max-w-xl mx-auto">
            Raw thoughts. Unfiltered creativity. {doodles.length} {doodles.length === 1 ? "doodle" : "doodles"} 🎨
          </p>
        </div>

        {/* Rectangular Grid Layout */}
        <div className="relative h-auto flex justify-center">
          <div
            className="grid gap-2 sm:gap-3"
            style={{
              gridTemplateColumns: doodles.length === 1 
                ? "1fr" 
                : doodles.length === 2 
                ? "repeat(2, 1fr)" 
                : `repeat(auto-fit, minmax(${doodleSize}, 1fr))`,
              maxWidth: doodles.length === 1 ? doodleSize : doodles.length === 2 ? `calc(${doodleSize} * 2 + 0.75rem)` : "100%",
            }}
          >
            {doodles.map((doodle) => {
              return (
                <div
                  key={doodle.id}
                  className="flex justify-center items-center group"
                >
                  {/* Rectangular container */}
                  <div
                    className="relative transition-all duration-300 hover:scale-105 hover:z-10 hover:shadow-lg cursor-pointer rounded-lg overflow-hidden"
                    style={{
                      width: doodleSize,
                      height: doodleSize,
                    }}
                  >
                    {/* Image container */}
                    <div className="w-full h-full relative bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 shadow-md group-hover:shadow-xl transition-all duration-300">
                      {/* Image */}
                      <Image
                        src={doodle.imageUrl}
                        alt={doodle.title ?? "doodle"}
                        fill
                        className="object-cover w-full h-full"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />

                      {/* Overlay on hover with timestamp */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
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
        <div className="mt-8 text-center">
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
