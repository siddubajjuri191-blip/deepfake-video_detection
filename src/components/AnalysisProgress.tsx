import { Cpu, Layers, ScanSearch, CheckCircle2 } from "lucide-react";
import { AnalysisStatus } from "../types";

interface Props {
  status: AnalysisStatus;
  progress: number;
}

const STEPS = [
  { id: "uploading", label: "Uploading video", icon: Layers },
  { id: "analyzing", label: "Extracting frames", icon: Cpu },
  { id: "gradcam", label: "Computing Grad-CAM", icon: ScanSearch },
  { id: "complete", label: "Analysis complete", icon: CheckCircle2 },
];

export default function AnalysisProgress({ status, progress }: Props) {
  const stepIndex =
    status === "uploading" ? 0
    : status === "analyzing" && progress < 70 ? 1
    : status === "analyzing" ? 2
    : 3;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-400">Processing</span>
            <span className="text-sm font-mono text-teal-400">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 text-center">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                  ${done ? "bg-teal-500/20 text-teal-400"
                    : active ? "bg-teal-500/10 text-teal-300 animate-pulse"
                    : "bg-slate-800 text-slate-600"}
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium leading-tight transition-colors
                  ${done ? "text-teal-400" : active ? "text-slate-300" : "text-slate-600"}
                `}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
