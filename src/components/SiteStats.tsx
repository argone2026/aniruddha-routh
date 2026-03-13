"use client";

import { MessageCircle, PenTool } from "lucide-react";

interface SiteStatsProps {
  visitorCount: number;
  doodleCount: number;
}

export default function SiteStats({ visitorCount, doodleCount }: SiteStatsProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-2xl border border-slate-200 dark:border-slate-700 p-6 min-w-80">
        <div className="space-y-4">
          {/* Visitors / Anonymous Thoughts */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Anonymous Thoughts</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {visitorCount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-200 dark:bg-slate-700" />

          {/* Doodles */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <PenTool className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Doodles Cleared</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {doodleCount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
