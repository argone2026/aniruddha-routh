import { prisma } from "@/lib/db";
import Link from "next/link";
import { Trophy, Star, ArrowLeft } from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  star: Star,
};

export default async function AchievementsPage() {
  const achievements = await prisma.achievement.findMany({
    orderBy: { createdAt: "desc" },
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
          All Achievements
        </h1>
        <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-12" />

        {achievements.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <p className="text-xl">No achievements listed yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {achievements.map((achievement) => {
              const Icon = ICON_MAP[achievement.icon] ?? Trophy;
              return (
                <div
                  key={achievement.id}
                  className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-md hover:border-amber-200 transition-all duration-300 flex gap-5"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">
                      {achievement.date}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-lg mb-1">
                      {achievement.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
