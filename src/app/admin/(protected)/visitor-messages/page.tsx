"use client";

import { useEffect, useState } from "react";
import { Mailbox, Loader2, Trash2 } from "lucide-react";

type VisitorMessage = {
  id: string;
  name: string;
  note: string;
  createdAt: string;
};

export default function VisitorMessagesPage() {
  const [messages, setMessages] = useState<VisitorMessage[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchMessages() {
    setLoading(true);
    const res = await fetch("/api/visitor-messages");
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/visitor-messages/${id}`, { method: "DELETE" });
    fetchMessages();
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Visitor Inbox</h1>
        <p className="text-slate-500 mt-1">Messages sent from the website note box</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-24 text-slate-400 bg-white rounded-2xl border border-slate-100">
          <Mailbox className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p>No visitor messages yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-slate-900">{message.name}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {new Date(message.createdAt).toLocaleString()}
                  </div>
                  <p className="text-slate-600 mt-3 leading-relaxed whitespace-pre-wrap">
                    {message.note}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(message.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
