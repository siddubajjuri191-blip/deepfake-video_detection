import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FrameAnalysis } from "../types";
import GradCAMViewer from "./GradCAMViewer";

interface Props {
  frames: FrameAnalysis[];
}

export default function FrameTimeline({ frames }: Props) {
  const [selected, setSelected] = useState(0);

  if (frames.length === 0) return null;

  const activeFrame = frames[selected];

  return (
    <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-slate-200">Frame-by-Frame Analysis</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {frames.length} frames analyzed — click a frame to inspect Grad-CAM heatmap
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            Fake
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Real
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <GradCAMViewer frame={activeFrame} />
          <div className="mt-3 bg-slate-800/60 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2.5">
              Activation Summary — Frame {activeFrame.frameIndex + 1}
            </p>
            <div className="space-y-1.5">
              {activeFrame.suspiciousRegions.map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Region {i + 1}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${Math.round(r.intensity * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-red-400 w-8 text-right">
                      {Math.round(r.intensity * 100)}%
                    </span>
                  </div>
                </div>
              ))}
              {activeFrame.suspiciousRegions.length === 0 && (
                <p className="text-xs text-slate-600">No significant anomalous regions detected</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-3">
              <button
                onClick={() => setSelected(s => Math.max(0, s - 1))}
                disabled={selected === 0}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
              <span className="text-xs text-slate-500 flex-1 text-center">
                {selected + 1} / {frames.length}
              </span>
              <button
                onClick={() => setSelected(s => Math.min(frames.length - 1, s + 1))}
                disabled={selected === frames.length - 1}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {frames.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`
                    relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200
                    ${i === selected
                      ? "border-teal-400 scale-105 shadow-lg shadow-teal-900/40"
                      : "border-slate-700/50 hover:border-slate-500"}
                  `}
                >
                  <img
                    src={`data:image/jpeg;base64,${f.gradcamImage ?? f.originalImage}`}
                    alt={`Frame ${i}`}
                    className="w-full h-full object-cover"
                  />
                  <div className={`
                    absolute bottom-0 left-0 right-0 h-0.5
                    ${f.prediction === "fake" ? "bg-red-500" : "bg-emerald-500"}
                  `} />
                  <span className="absolute top-0.5 right-0.5 text-[8px] font-mono text-white bg-black/50 px-0.5 rounded">
                    {Math.round(f.confidence * 100)}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto bg-slate-800/60 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-3">
              Confidence Timeline
            </p>
            <div className="flex items-end gap-1 h-16">
              {frames.map((f, i) => {
                const h = Math.max(4, Math.round(f.confidence * 64));
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className="flex-1 flex flex-col items-center justify-end group"
                  >
                    <div
                      className={`w-full rounded-sm transition-all ${
                        i === selected ? "opacity-100" : "opacity-60 group-hover:opacity-80"
                      } ${f.prediction === "fake" ? "bg-red-500" : "bg-emerald-500"}`}
                      style={{ height: `${h}px` }}
                    />
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-slate-600">0s</span>
              <span className="text-[9px] text-slate-600">
                {frames[frames.length - 1]?.timestamp}s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
