"use client";

import { useState } from "react";
import { Maximize2, ExternalLink, Image as ImageIcon } from "lucide-react";

export function ScreenshotViewer({ screenshot }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!screenshot || !screenshot.urls) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center">
        <ImageIcon className="h-8 w-8 text-slate-600 mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-400">No Screenshot Attached</p>
        <p className="text-[11px] text-slate-500 mt-1">This report was submitted without a visual capture.</p>
      </div>
    );
  }

  const { urls, width, height, bytes, format } = screenshot;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold text-slate-300">Viewport Screenshot</span>
        <div className="flex items-center gap-3 text-[11px]">
          <span>{width} × {height} px</span>
          <span>•</span>
          <span>{(bytes / 1024).toFixed(1)} KB ({format.toUpperCase()})</span>
          <button
            onClick={() => setIsFullscreen(true)}
            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 ml-2"
          >
            <Maximize2 className="h-3 w-3" />
            <span>Expand</span>
          </button>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group cursor-pointer" onClick={() => setIsFullscreen(true)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={urls.detail || urls.original}
          alt="Bug screenshot"
          className="w-full h-auto object-contain max-h-[500px] transition-transform duration-200 group-hover:scale-[1.01]"
        />
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <span className="bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 shadow-xl flex items-center gap-1.5">
            <Maximize2 className="h-3.5 w-3.5 text-indigo-400" />
            Click to expand
          </span>
        </div>
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-6 flex flex-col items-center justify-center cursor-zoom-out"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-7xl max-h-full overflow-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urls.original}
              alt="Fullscreen bug screenshot"
              className="rounded-lg shadow-2xl border border-slate-800"
            />
          </div>
          <span className="text-xs text-slate-400 mt-3">Click anywhere to close</span>
        </div>
      )}
    </div>
  );
}

export default ScreenshotViewer;
