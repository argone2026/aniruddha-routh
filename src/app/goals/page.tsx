import { prisma } from "@/lib/db";
import Link from "next/link";
import { Target, Star, Trophy, Heart, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  star: Star,
  trophy: Trophy,
  heart: Heart,
};

export default async function GoalsPage() {
  const goals = await prisma.goal.findMany({
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
        <h1 className="text-4xl font-bold text-slate-900 mb-4">All Goals</h1>
        <div className="w-16 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full mb-12" />

        {goals.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <p className="text-xl">No goals listed yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const Icon = ICON_MAP[goal.icon] ?? Target;
              return (
                <div
                  key={goal.id}
                  className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-md hover:border-violet-200 transition-all duration-300 flex gap-5"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">{goal.date}</div>
                    <h3 className="font-semibold text-slate-900 text-lg mb-1">{goal.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{goal.description}</p>
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
