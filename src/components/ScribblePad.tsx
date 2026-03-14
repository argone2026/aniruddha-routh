"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Loader } from "lucide-react";

export default function ScribblePad() {
  const blobRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const hasContentRef = useRef(false);
  const [lineWidth, setLineWidth] = useState(3);
  const [isDark, setIsDark] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);

  // Sync dark mode
  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setIsDark(root.classList.contains("dark"));
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Init canvas to match its rendered size (called via ResizeObserver so it
  // always runs after layout — fixes the "canvas escapes container" bug).
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const blob = blobRef.current;
    if (!canvas || !blob) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = blob.offsetWidth;
    const cssH = blob.offsetHeight;
    if (cssW === 0 || cssH === 0) return;

    // Set backing-store resolution
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = lineWidth;
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(0, 0, cssW, cssH);
  }, [lineWidth, isDark]);

  // Observe blob container so canvas stays in sync after layout / resize
  useEffect(() => {
    const blob = blobRef.current;
    if (!blob) return;
    const ro = new ResizeObserver(initCanvas);
    ro.observe(blob);
    initCanvas();
    return () => ro.disconnect();
  }, [initCanvas]);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPoint(e);
    drawingRef.current = true;
    canvas.setPointerCapture(e.pointerId);
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPoint(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Mark that drawing has occurred
    if (!hasContentRef.current) {
      hasContentRef.current = true;
      setHasDrawn(true);
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawingRef.current = false;
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const blob = blobRef.current;
    if (!canvas || !blob) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = blob.offsetWidth;
    const h = blob.offsetHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(0, 0, w, h);

    // Reset drawing state for new doodle
    hasContentRef.current = false;
    setHasDrawn(false);
    setHasBeenSaved(false);
  }

  async function saveDoodle() {
    const canvas = canvasRef.current;
    if (!canvas || hasBeenSaved || !hasDrawn) return;

    setIsSaving(true);
    try {
      const imageData = canvas.toDataURL("image/png");
      const response = await fetch("/api/doodles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData,
          title: `Doodle from ${new Date().toLocaleDateString()}`,
        }),
      });

      if (response.ok) {
        alert("Doodle saved! 🎨");
        setHasBeenSaved(true);
      } else {
        alert("Failed to save doodle");
      }
    } catch (error) {
      console.error("Error saving doodle:", error);
      alert("Error saving doodle");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-slate-700/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-5 py-5 text-slate-100 shadow-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.26em] text-slate-400">Doodle</span>
        <div className="flex gap-2">
          <button
            onClick={saveDoodle}
            disabled={isSaving || !hasDrawn || hasBeenSaved}
            className="rounded-full border border-slate-700 bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-xs text-white transition-all hover:shadow-lg disabled:opacity-50 flex items-center gap-1"
            title={hasBeenSaved ? "Already saved in this session" : !hasDrawn ? "Draw something first" : "Save your doodle"}
          >
            {isSaving ? <Loader className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            {isSaving ? "Saving..." : hasBeenSaved ? "Saved" : "Save"}
          </button>
          <button
            onClick={clearCanvas}
            className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-200 transition-colors hover:bg-slate-800"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Drawing area */}
      <div
        ref={blobRef}
        className="w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/80"
        style={{ height: "210px" }}
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full touch-none cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-slate-700 bg-slate-900/70 px-3 py-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">Brush Size</span>
          <span className="text-xs text-slate-300">{lineWidth}px</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
        {[2, 3, 5].map((size) => (
          <button
            key={size}
            onClick={() => setLineWidth(size)}
            className={`rounded-full border px-3 py-1.5 font-medium transition-colors ${
              lineWidth === size
                ? "border-indigo-400 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white"
                : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {size}px
          </button>
        ))}
        </div>
      </div>
    </div>
  );
}
