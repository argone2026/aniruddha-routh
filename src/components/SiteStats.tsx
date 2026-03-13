"use client";

import { useState } from "react";
import { MessageCircle, PenTool, X, ChevronUp } from "lucide-react";

interface SiteStatsProps {
  visitorCount: number;
  doodleCount: number;
}

export default function SiteStats({ visitorCount, doodleCount }: SiteStatsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {isExpanded ? (
        // Expanded view
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-80 animate-in slide-in-from-bottom-2 duration-200">
          {/* Close button */}
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-4 right-4 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>

          <div className="space-y-4 pr-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
              Live Stats
            </h3>

            {/* Visitors / Anonymous Thoughts */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Anonymous Thoughts</p>
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
                  <p className="text-xs text-slate-600 dark:text-slate-400">Doodles Cleared</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {doodleCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Collapsed icon button
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl dark:shadow-2xl transition-all duration-200 hover:scale-110 flex items-center justify-center group"
          title="View site statistics"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <ChevronUp className="w-4 h-4 absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
      )}
    </div>
  );
}
