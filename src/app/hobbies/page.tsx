import { prisma } from "@/lib/db";
import Link from "next/link";
import HobbyCards from "@/components/HobbyCards";
import { Heart, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HobbiesPage() {
  const hobbies = await prisma.hobby.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Hobbies &amp; Interests
        </h1>
        <div className="w-16 h-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full mb-12" />

        {hobbies.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <Heart className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <p className="text-xl">No hobbies listed yet.</p>
          </div>
        ) : (
          <HobbyCards
            hobbies={hobbies.map((hobby) => ({
              id: hobby.id,
              name: hobby.name,
              description: hobby.description,
              imageUrl: hobby.imageUrl,
            }))}
          />
        )}
      </div>
    </div>
  );
}
