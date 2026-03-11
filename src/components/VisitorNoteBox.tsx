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
      className="note-shell w-full border border-slate-700/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-5 py-5 shadow-xl text-slate-100"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.26em] text-slate-400">Note</span>
        <span className="text-[11px] text-slate-500">Inbox only</span>
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name, @, or alter ego"
        maxLength={50}
        className="mb-2 w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Drop your wildest take. If it slaps, it stays. If it flops, we pretend this never happened."
        maxLength={500}
        rows={4}
        className="mb-3 w-full resize-none rounded-[1.75rem] border border-slate-700 bg-slate-900/80 px-3 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      <button
        type="submit"
        disabled={submitting || !name.trim() || !note.trim()}
        className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Sending..." : "Send"}
      </button>

      {status === "ok" && (
        <p className="mt-2 text-xs text-emerald-400">Sent.</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">Try again.</p>
      )}
    </form>
  );
}
