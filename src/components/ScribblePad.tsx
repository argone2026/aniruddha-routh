"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function ScribblePad() {
  const blobRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const [lineWidth, setLineWidth] = useState(3);
  const [isDark, setIsDark] = useState(true);

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
    ctx.fillStyle = isDark ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.08)";
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
    ctx.fillStyle = isDark ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.08)";
    ctx.fillRect(0, 0, w, h);
  }

  return (
    <div className="scribble-shell w-full overflow-hidden bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-600 px-5 py-5 text-white shadow-2xl shadow-indigo-200 dark:shadow-indigo-950/30">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-wide uppercase">Scribble Pad</h3>
        <button
          onClick={clearCanvas}
          className="rounded-full bg-white/15 px-3 py-1.5 text-xs transition-colors hover:bg-white/25"
        >
          Clear
        </button>
      </div>

      {/* Amoeba-shaped drawing area — border-radius morphs via CSS animation */}
      <div
        ref={blobRef}
        className="scribble-blob w-full overflow-hidden border border-white/20 bg-white/5"
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

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-indigo-100">Brush</span>
        {[2, 3, 5].map((size) => (
          <button
            key={size}
            onClick={() => setLineWidth(size)}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              lineWidth === size ? "bg-white/30" : "bg-white/15 hover:bg-white/25"
            }`}
          >
            {size}px
          </button>
        ))}
      </div>
    </div>
  );
}
