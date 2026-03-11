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
      className="w-[290px] rounded-3xl p-4 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-xl text-slate-100"
    >
      <h3 className="text-sm font-semibold mb-1">Drop A Savage Note</h3>
      <p className="text-xs text-slate-400 mb-3">One sharp line. No fluff. No cap.</p>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name / Alias"
        maxLength={50}
        className="w-full mb-2 px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Drop your hottest take. Roast me, challenge me, or leave a wild idea..."
        maxLength={500}
        rows={3}
        className="w-full mb-3 px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-sm text-slate-100 placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      <button
        type="submit"
        disabled={submitting || !name.trim() || !note.trim()}
        className="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {submitting ? "Sending..." : "Send The Heat"}
      </button>

      {status === "ok" && (
        <p className="mt-2 text-xs text-emerald-400">Received. It landed in my admin inbox.</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">Network folded. Try again in a sec.</p>
      )}
    </form>
  );
}
