import { prisma } from "@/lib/db";
import Link from "next/link";
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
          <div className="grid sm:grid-cols-2 gap-6">
            {hobbies.map((hobby) => (
              <div
                key={hobby.id}
                className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-md hover:border-rose-200 transition-all duration-300 flex gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">
                    {hobby.name}
                  </h3>
                  <p className="text-slate-500 leading-relaxed">
                    {hobby.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
