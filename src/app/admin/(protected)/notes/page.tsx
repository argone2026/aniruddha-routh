"use client";

import { useState, useEffect } from "react";
import {
  StickyNote,
  Plus,
  Pencil,
  Trash2,
  Pin,
  X,
  Loader2,
  Save,
} from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", pinned: false });

  async function fetchNotes() {
    setLoading(true);
    const res = await fetch("/api/notes");
    const data = await res.json();
    setNotes(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  function openCreate() {
    setEditingNote(null);
    setForm({ title: "", content: "", pinned: false });
    setShowModal(true);
  }

  function openEdit(note: Note) {
    setEditingNote(note);
    setForm({ title: note.title, content: note.content, pinned: note.pinned });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title || !form.content) return;
    setSaving(true);

    const url = editingNote ? `/api/notes/${editingNote.id}` : "/api/notes";
    const method = editingNote ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    setShowModal(false);
    fetchNotes();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    fetchNotes();
  }

  async function togglePin(note: Note) {
    await fetch(`/api/notes/${note.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...note, pinned: !note.pinned }),
    });
    fetchNotes();
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notes</h1>
          <p className="text-slate-500 mt-1">Your personal notes and reminders</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New Note
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <StickyNote className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium mb-2">No notes yet</p>
          <p className="text-sm mb-6">Create your first note to get started</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" /> Create Note
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`bg-white p-5 rounded-2xl border transition-all hover:shadow-md ${
                note.pinned ? "border-amber-200 bg-amber-50/30" : "border-slate-100"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-900 flex-1 pr-2 leading-snug">
                  {note.title}
                </h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => togglePin(note)}
                    title={note.pinned ? "Unpin" : "Pin"}
                    className={`p-1.5 rounded-lg transition-colors ${
                      note.pinned
                        ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                        : "text-slate-400 hover:text-amber-500 hover:bg-amber-50"
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEdit(note)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">
                {note.content}
              </p>
              <div className="mt-3 text-xs text-slate-400">
                {new Date(note.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
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
                {editingNote ? "Edit Note" : "New Note"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Note title..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Content
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  placeholder="Write your note here..."
                  rows={6}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinned"
                  checked={form.pinned}
                  onChange={(e) =>
                    setForm({ ...form, pinned: e.target.checked })
                  }
                  className="w-4 h-4 accent-indigo-600"
                />
                <label
                  htmlFor="pinned"
                  className="text-sm text-slate-700 cursor-pointer"
                >
                  Pin this note
                </label>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title || !form.content}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
