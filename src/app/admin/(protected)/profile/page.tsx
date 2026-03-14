"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { UserCircle2, Upload, Trash2, Loader2, CheckCircle } from "lucide-react";

export default function ProfilePictureAdminPage() {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function fetchCurrent() {
    setLoading(true);
    const res = await fetch("/api/profile-picture");
    const data = await res.json();
    setCurrentUrl(data.url ?? null);
    setLoading(false);
  }

  useEffect(() => {
    fetchCurrent();
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setSuccessMsg("");
  }

  async function handleUpload() {
    if (!previewFile) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", previewFile);

    const res = await fetch("/api/profile-picture", { method: "POST", body: formData });
    setUploading(false);

    if (res.ok) {
      const data = await res.json();
      setCurrentUrl(data.url);
      setPreviewFile(null);
      setPreviewUrl(null);
      if (fileRef.current) fileRef.current.value = "";
      setSuccessMsg("Profile picture updated!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  }

  async function handleDelete() {
    if (!confirm("Remove profile picture?")) return;
    setDeleting(true);
    await fetch("/api/profile-picture", { method: "DELETE" });
    setCurrentUrl(null);
    setDeleting(false);
    setSuccessMsg("Profile picture removed.");
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile Picture</h1>
        <p className="text-slate-500 mt-1">Manage your hero profile photo displayed on the landing page.</p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Current Picture */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center gap-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider self-start">Current Photo</h2>
          {loading ? (
            <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
          ) : currentUrl ? (
            <>
              <div className="relative w-48 h-48 rounded-full overflow-hidden ring-4 ring-indigo-100 shadow-lg">
                <Image src={currentUrl} alt="Profile picture" fill className="object-cover" />
              </div>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Remove Photo
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <UserCircle2 className="w-24 h-24" />
              <p className="text-sm">No profile picture set</p>
            </div>
          )}
        </div>

        {/* Upload New */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Upload New Photo</h2>

          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
          >
            {previewUrl ? (
              <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-indigo-100 shadow">
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                <p className="text-sm text-slate-500 group-hover:text-indigo-600 text-center">
                  Click to select a photo<br />
                  <span className="text-xs text-slate-400">JPEG, PNG or WebP · max 5 MB</span>
                </p>
              </>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {previewFile && (
            <p className="text-xs text-slate-500 truncate">Selected: {previewFile.name}</p>
          )}

          <button
            onClick={handleUpload}
            disabled={!previewFile || uploading}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Upload Photo
              </>
            )}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 text-sm text-indigo-700">
        <strong>Tip:</strong> Your profile picture is displayed in the hero section. For best results, use a square photo (at least 400×400 px).
      </div>
    </div>
  );
}
