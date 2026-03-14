"use client";

import { useState, useEffect } from "react";
import { Trash2, Download, Loader, Grid } from "lucide-react";
import Image from "next/image";

interface Doodle {
  id: string;
  imageUrl: string;
  title: string | null;
  createdAt: string;
}

export default function DoodlesPage() {
  const [doodles, setDoodles] = useState<Doodle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoodles = async () => {
      try {
        const response = await fetch("/api/doodles");
        if (response.ok) {
          const data = await response.json();
          setDoodles(data);
        }
      } catch (error) {
        console.error("Error fetching doodles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoodles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this doodle?")) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/doodles/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDoodles(doodles.filter((d) => d.id !== id));
      } else {
        alert("Failed to delete doodle");
      }
    } catch (error) {
      console.error("Error deleting doodle:", error);
      alert("Error deleting doodle");
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = (doodle: Doodle) => {
    const link = document.createElement("a");
    link.href = doodle.imageUrl;
    link.download = `${doodle.title || "doodle"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Grid className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Doodle Gallery</h1>
            <p className="text-slate-600 mt-1">View and manage all submitted doodles</p>
          </div>
        </div>
      </div>

      {doodles.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
          <Grid className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-500">No doodles yet. Create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doodles.map((doodle) => (
            <div
              key={doodle.id}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative bg-slate-100 aspect-square overflow-hidden">
                <img
                  src={doodle.imageUrl}
                  alt={doodle.title || "Doodle"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleDownload(doodle)}
                    className="p-3 rounded-full bg-white text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(doodle.id)}
                    disabled={deleting === doodle.id}
                    className="p-3 rounded-full bg-white text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deleting === doodle.id ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="font-medium text-slate-900 truncate">{doodle.title}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(doodle.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
