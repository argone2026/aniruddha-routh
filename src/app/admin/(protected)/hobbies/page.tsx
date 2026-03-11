"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Heart, Plus, Pencil, Trash2, X, Loader2, Save } from "lucide-react";

interface Hobby {
  id: string;
  name: string;
  description: string;
  icon: string;
  imageUrl?: string | null;
}

const ICON_OPTIONS = ["heart", "star", "trophy"];

export default function HobbiesAdminPage() {
  const [items, setItems] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Hobby | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "heart" });

  async function fetchData() {
    setLoading(true);
    const res = await fetch("/api/hobbies");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", icon: "heart" });
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    setShowModal(true);
  }

  function openEdit(item: Hobby) {
    setEditing(item);
    setForm({ name: item.name, description: item.description, icon: item.icon });
    setImageFile(null);
    setImagePreview(item.imageUrl ?? null);
    setRemoveImage(false);
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.description) return;
    setSaving(true);

    const url = editing ? `/api/hobbies/${editing.id}` : "/api/hobbies";
    const method = editing ? "PUT" : "POST";
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("icon", form.icon);
    if (editing) {
      formData.append("existingImageUrl", editing.imageUrl ?? "");
      formData.append("imageAction", removeImage ? "remove" : "keep");
    }
    if (imageFile) {
      formData.append("image", imageFile);
    }

    await fetch(url, {
      method,
      body: formData,
    });

    setSaving(false);
    setShowModal(false);
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this hobby?")) return;
    await fetch(`/api/hobbies/${id}`, { method: "DELETE" });
    fetchData();
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hobbies</h1>
          <p className="text-slate-500 mt-1">Manage your hobbies and interests</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Hobby
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <Heart className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium mb-2">No hobbies yet</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 text-sm"
          >
            <Plus className="w-4 h-4" /> Add First Hobby
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    {item.imageUrl && (
                      <div className="mb-2">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={80}
                          height={56}
                          className="rounded-lg object-cover border border-slate-100"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">
                {editing ? "Edit Hobby" : "New Hobby"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Hobby name..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe this hobby..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Icon</label>
                <div className="flex gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm({ ...form, icon })}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors capitalize ${
                        form.icon === icon
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 text-slate-600 hover:border-indigo-300"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setImageFile(file);
                    setRemoveImage(false);
                    if (file) {
                      setImagePreview(URL.createObjectURL(file));
                    } else {
                      setImagePreview(editing?.imageUrl ?? null);
                    }
                  }}
                  className="w-full text-sm text-slate-600 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                />
                {imagePreview && !removeImage && (
                  <div className="mt-3 flex items-center gap-3">
                    <Image
                      src={imagePreview}
                      alt="Hobby preview"
                      width={96}
                      height={72}
                      className="rounded-lg object-cover border border-slate-200"
                    />
                    {editing?.imageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setRemoveImage(true);
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-sm">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.description}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
