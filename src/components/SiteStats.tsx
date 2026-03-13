"use client";

import { MessageCircle, PenTool, Award } from "lucide-react";

interface SiteStatsProps {
  visitorCount: number;
  achievementCount: number;
}

export default function SiteStats({ visitorCount, achievementCount }: SiteStatsProps) {
  return (
    <section className="py-12 px-6 bg-gradient-to-r from-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Visitors / Anonymous Thoughts */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 p-3 rounded-full bg-blue-100">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
              {visitorCount.toLocaleString()}
            </div>
            <p className="text-slate-600 font-medium">Anonymous Thoughts</p>
            <p className="text-xs text-slate-500 mt-1">Left by visitors like you</p>
          </div>

          {/* Doodles */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 p-3 rounded-full bg-purple-100">
              <PenTool className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
              ∞
            </div>
            <p className="text-slate-600 font-medium">Infinite Doodles</p>
            <p className="text-xs text-slate-500 mt-1">Create your own art</p>
          </div>

          {/* Achievements */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 p-3 rounded-full bg-amber-100">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
              {achievementCount}+
            </div>
            <p className="text-slate-600 font-medium">Milestones Reached</p>
            <p className="text-xs text-slate-500 mt-1">Check out all achievements</p>
          </div>
        </div>
      </div>
    </section>
  );
}
