"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Image as ImageIcon, Upload, Trash2, Loader2, X } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  caption?: string | null;
  alt?: string | null;
  createdAt: string;
}

export default function GalleryAdminPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ caption: "", alt: "" });
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function fetchPhotos() {
    setLoading(true);
    const res = await fetch("/api/photos");
    setPhotos(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchPhotos();
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  async function handleUpload() {
    if (!previewFile) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", previewFile);
    if (form.caption) formData.append("caption", form.caption);
    if (form.alt) formData.append("alt", form.alt);

    const res = await fetch("/api/photos", { method: "POST", body: formData });
    setUploading(false);

    if (res.ok) {
      setShowUpload(false);
      setPreviewFile(null);
      setPreviewUrl(null);
      setForm({ caption: "", alt: "" });
      if (fileRef.current) fileRef.current.value = "";
      fetchPhotos();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this photo?")) return;
    await fetch(`/api/photos/${id}`, { method: "DELETE" });
    fetchPhotos();
  }

  function closeUpload() {
    setShowUpload(false);
    setPreviewFile(null);
    setPreviewUrl(null);
    setForm({ caption: "", alt: "" });
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gallery</h1>
          <p className="text-slate-500 mt-1">Manage your photo collection</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Upload className="w-4 h-4" /> Upload Photo
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium mb-2">No photos yet</p>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 text-sm"
          >
            <Upload className="w-4 h-4" /> Upload First Photo
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-2xl aspect-square bg-slate-200"
            >
              <Image
                src={photo.url}
                alt={photo.alt ?? photo.caption ?? "Photo"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                {photo.caption && (
                  <p className="text-white text-xs text-center px-2">
                    {photo.caption}
                  </p>
                )}
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Upload Photo</h2>
              <button
                onClick={closeUpload}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* File drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all"
              >
                {previewUrl ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-slate-600 text-sm">
                      Click to select an image
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      JPEG, PNG, GIF, WebP — Max 5MB
                    </p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Caption (optional)
                </label>
                <input
                  type="text"
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  placeholder="Photo caption..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Alt text (optional)
                </label>
                <input
                  type="text"
                  value={form.alt}
                  onChange={(e) => setForm({ ...form, alt: e.target.value })}
                  placeholder="Descriptive alt text..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={closeUpload}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !previewFile}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
