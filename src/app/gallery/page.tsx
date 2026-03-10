import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Image as ImageIcon, ArrowLeft } from "lucide-react";

export default async function GalleryPage() {
  const photos = await prisma.photo.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Gallery</h1>
        <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full mb-12" />

        {photos.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <p className="text-xl">No photos yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-2xl aspect-square bg-slate-200"
              >
                <Image
                  src={photo.url}
                  alt={photo.alt ?? photo.caption ?? "Gallery photo"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {photo.caption && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <p className="text-white text-sm font-medium">
                      {photo.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
