"use client";

import { FormEvent, useState } from "react";

export default function VisitorNoteBox() {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !note.trim()) return;

    setSubmitting(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/visitor-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), note: note.trim() }),
      });

      if (!res.ok) throw new Error("Failed");
      setName("");
      setNote("");
      setStatus("ok");
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-[290px] rounded-3xl p-4 bg-white border border-slate-200 shadow-lg"
    >
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Drop Me A Note</h3>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        maxLength={50}
        className="w-full mb-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write something nice..."
        maxLength={500}
        rows={3}
        className="w-full mb-3 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <button
        type="submit"
        disabled={submitting || !name.trim() || !note.trim()}
        className="w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Sending..." : "Send"}
      </button>

      {status === "ok" && (
        <p className="mt-2 text-xs text-emerald-600">Sent. I will read this in admin inbox.</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-xs text-red-500">Could not send now. Please try again.</p>
      )}
    </form>
  );
}
