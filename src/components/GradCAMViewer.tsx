import { useState } from "react";
import { ToggleLeft, ToggleRight, ScanSearch, MapPin } from "lucide-react";
import { FrameAnalysis } from "../types";

interface Props {
  frame: FrameAnalysis;
}

export default function GradCAMViewer({ frame }: Props) {
  const [showOverlay, setShowOverlay] = useState(true);

  const displayImage = showOverlay && frame.gradcamImage
    ? `data:image/jpeg;base64,${frame.gradcamImage}`
    : `data:image/jpeg;base64,${frame.originalImage}`;

  const isFake = frame.prediction === "fake";
  const pct = Math.round(frame.confidence * 100);

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="relative bg-black aspect-square">
        <img
          src={displayImage}
          alt={`Frame ${frame.frameIndex}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {showOverlay && frame.suspiciousRegions.map((region, i) => (
          <div
            key={i}
            className="absolute border border-red-400/70 rounded"
            style={{
              left: `${region.x * 100}%`,
              top: `${region.y * 100}%`,
              width: `${region.width * 100}%`,
              height: `${region.height * 100}%`,
              boxShadow: `0 0 ${Math.round(region.intensity * 12)}px rgba(239,68,68,${region.intensity * 0.5})`,
            }}
          >
            {i === 0 && (
              <span className="absolute -top-5 left-0 text-[9px] text-red-400 font-mono bg-slate-900/80 px-1 py-0.5 rounded whitespace-nowrap">
                {Math.round(region.intensity * 100)}% anomaly
              </span>
            )}
          </div>
        ))}

        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className={`
            text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider
            ${isFake ? "bg-red-500/90 text-white" : "bg-emerald-500/90 text-white"}
          `}>
            {frame.prediction}
          </span>
          <span className="text-[10px] font-mono text-white bg-black/60 px-1.5 py-0.5 rounded">
            {pct}%
          </span>
        </div>

        <div className="absolute top-2 right-2 text-[10px] font-mono text-slate-400 bg-black/60 px-1.5 py-0.5 rounded">
          {frame.timestamp}s
        </div>
      </div>

      <div className="px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          {showOverlay
            ? <ScanSearch className="w-3.5 h-3.5 text-teal-400" />
            : <MapPin className="w-3.5 h-3.5 text-slate-500" />
          }
          <span>{showOverlay ? "Grad-CAM overlay" : "Original frame"}</span>
        </div>
        {frame.gradcamImage && (
          <button
            onClick={() => setShowOverlay(v => !v)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors"
          >
            {showOverlay
              ? <ToggleRight className="w-4 h-4 text-teal-400" />
              : <ToggleLeft className="w-4 h-4" />
            }
            <span>Toggle</span>
          </button>
        )}
      </div>
    </div>
  );
}
