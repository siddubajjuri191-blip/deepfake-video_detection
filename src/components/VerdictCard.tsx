import { ShieldAlert, ShieldCheck, Clock, Cpu } from "lucide-react";
import { AnalysisResult } from "../types";

interface Props {
  result: AnalysisResult;
}

export default function VerdictCard({ result }: Props) {
  const isFake = result.overallPrediction === "fake";
  const pct = Math.round(result.overallConfidence * 100);
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference * (1 - result.overallConfidence);

  return (
    <div className={`
      relative overflow-hidden rounded-2xl border p-8
      ${isFake
        ? "border-red-500/30 bg-gradient-to-br from-red-950/40 to-slate-900/80"
        : "border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-900/80"}
      backdrop-blur-sm
    `}>
      <div className={`
        absolute inset-0 opacity-[0.03]
        ${isFake ? "bg-red-500" : "bg-emerald-500"}
      `} style={{ backgroundImage: "radial-gradient(circle at 30% 50%, currentColor 0%, transparent 70%)" }} />

      <div className="relative flex items-center gap-8">
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke={isFake ? "#ef4444" : "#10b981"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold tabular-nums ${isFake ? "text-red-400" : "text-emerald-400"}`}>
              {pct}%
            </span>
            <span className="text-xs text-slate-500 mt-0.5">confidence</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {isFake
              ? <ShieldAlert className="w-8 h-8 text-red-400" />
              : <ShieldCheck className="w-8 h-8 text-emerald-400" />
            }
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-medium mb-0.5">
                Classification
              </p>
              <h2 className={`text-4xl font-black tracking-tight ${isFake ? "text-red-400" : "text-emerald-400"}`}>
                {isFake ? "DEEPFAKE" : "AUTHENTIC"}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <Stat icon={<Clock className="w-3.5 h-3.5" />} label="Processing time" value={`${result.processingTime}s`} />
            <Stat icon={<Cpu className="w-3.5 h-3.5" />} label="Model" value={result.modelVersion} />
            <Stat icon={null} label="Frames analyzed" value={`${result.frameAnalyses.length}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-slate-400">
      {icon}
      <span className="text-xs text-slate-500">{label}:</span>
      <span className="text-xs font-semibold text-slate-300">{value}</span>
    </div>
  );
}
