"use client";

import { useState, useEffect } from "react";
import { Check, AlertCircle, Loader } from "lucide-react";

export default function SiteBioPage() {
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchBio = async () => {
      try {
        const response = await fetch("/api/site-bio");
        if (response.ok) {
          const data = await response.json();
          setBio(data.bio);
        }
      } catch (error) {
        console.error("Error fetching bio:", error);
        setMessage({ type: "error", text: "Failed to load bio" });
      } finally {
        setLoading(false);
      }
    };

    fetchBio();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);

    try {
      const response = await fetch("/api/site-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: bio.trim() }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Bio updated successfully!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to update bio" });
      }
    } catch (error) {
      console.error("Error updating bio:", error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Landing Page Bio</h1>
        <p className="text-slate-600 mt-2">Edit the introductory text displayed on your landing page</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-3">
            Bio Text
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Enter your landing page bio..."
            rows={6}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-slate-500 mt-2">
            Use double line breaks (press Enter twice) to create paragraphs
          </p>
        </div>

        {message && (
          <div
            className={`flex items-center gap-3 p-4 rounded-xl ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {message.type === "success" ? (
              <Check className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={updating}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 disabled:bg-slate-400 transition-colors font-medium"
        >
          {updating && <Loader className="w-4 h-4 animate-spin" />}
          {updating ? "Saving..." : "Save Bio"}
        </button>
      </form>

      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Preview</h2>
        <div className="text-slate-600 whitespace-pre-wrap text-sm leading-relaxed">
          {bio || "(Bio will appear here)"}
        </div>
      </div>
    </div>
  );
}
