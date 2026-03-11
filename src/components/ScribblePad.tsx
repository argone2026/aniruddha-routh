"use client";

import { useEffect, useRef, useState } from "react";

export default function ScribblePad() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const [lineWidth, setLineWidth] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = 260;
    const cssHeight = 220;

    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = lineWidth;

    // Fill subtle translucent board background once.
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(0, 0, cssWidth, cssHeight);
  }, [lineWidth]);

  function getPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getPoint(event);
    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getPoint(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawingRef.current = false;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cssWidth = parseFloat(canvas.style.width || "260");
    const cssHeight = parseFloat(canvas.style.height || "220");
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(0, 0, cssWidth, cssHeight);
  }

  return (
    <div className="w-[290px] rounded-3xl p-4 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-200 text-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold tracking-wide uppercase">Scribble Pad</h3>
        <button
          onClick={clearCanvas}
          className="text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-md transition-colors"
        >
          Clear
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="rounded-xl border border-white/20 touch-none cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className="text-indigo-100">Brush</span>
        {[2, 3, 5].map((size) => (
          <button
            key={size}
            onClick={() => setLineWidth(size)}
            className={`px-2 py-1 rounded-md transition-colors ${
              lineWidth === size ? "bg-white/35" : "bg-white/20 hover:bg-white/30"
            }`}
          >
            {size}px
          </button>
        ))}
      </div>
    </div>
  );
}
