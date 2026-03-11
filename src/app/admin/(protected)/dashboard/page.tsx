import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import {
  StickyNote,
  Trophy,
  Target,
  Heart,
  Image,
  Briefcase,
  Mailbox,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const [notesCount, achievementsCount, goalsCount, hobbiesCount, workCount, inboxCount, photosCount] =
    await Promise.all([
      prisma.note.count(),
      prisma.achievement.count(),
      prisma.goal.count(),
      prisma.hobby.count(),
      prisma.workExperience.count(),
      prisma.visitorMessage.count(),
      prisma.photo.count(),
    ]);

  const recentNotes = await prisma.note.findMany({
    orderBy: { updatedAt: "desc" },
    take: 3,
  });

  const stats = [
    { label: "Notes", count: notesCount, icon: StickyNote, color: "text-blue-500", bg: "bg-blue-50", href: "/admin/notes" },
    { label: "Achievements", count: achievementsCount, icon: Trophy, color: "text-amber-500", bg: "bg-amber-50", href: "/admin/achievements" },
    { label: "Goals", count: goalsCount, icon: Target, color: "text-violet-500", bg: "bg-violet-50", href: "/admin/goals" },
    { label: "Hobbies", count: hobbiesCount, icon: Heart, color: "text-rose-500", bg: "bg-rose-50", href: "/admin/hobbies" },
    { label: "Work", count: workCount, icon: Briefcase, color: "text-sky-500", bg: "bg-sky-50", href: "/admin/work-experience" },
    { label: "Inbox", count: inboxCount, icon: Mailbox, color: "text-emerald-500", bg: "bg-emerald-50", href: "/admin/visitor-messages" },
    { label: "Photos", count: photosCount, icon: Image, color: "text-indigo-500", bg: "bg-indigo-50", href: "/admin/gallery" },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {session?.user?.name ?? "Admin"}! 👋
        </h1>
        <p className="text-slate-500 mt-2">
          Here&apos;s an overview of your portfolio content.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-8">
        {stats.map(({ label, count, icon: Icon, color, bg, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all group"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${bg} ${color} mb-3 group-hover:scale-110 transition-transform`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{count}</div>
            <div className="text-sm text-slate-500">{label}</div>
          </Link>
        ))}
      </div>

      {/* Recent Notes */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-slate-900">Recent Notes</h2>
          </div>
          <Link
            href="/admin/notes"
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentNotes.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notes yet.</p>
            <Link
              href="/admin/notes"
              className="text-indigo-600 text-sm hover:underline mt-1 inline-block"
            >
              Create your first note →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentNotes.map((note) => (
              <div
                key={note.id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <StickyNote className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 text-sm truncate">
                    {note.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                {note.pinned && (
                  <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                    Pinned
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
