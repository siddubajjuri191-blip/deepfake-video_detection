import { Brain, Zap, Activity, Layers, Eye } from "lucide-react";
import { ExplanationData } from "../types";

interface Props {
  explanation: ExplanationData;
  isFake: boolean;
}

const METRICS = [
  {
    key: "facialLandmarkScore" as const,
    label: "Facial Landmark Anomaly",
    icon: Eye,
    desc: "Deviation in key facial feature positioning",
  },
  {
    key: "blendingArtifactScore" as const,
    label: "Blending Artifacts",
    icon: Layers,
    desc: "Seam artifacts at face boundary regions",
  },
  {
    key: "temporalInconsistencyScore" as const,
    label: "Temporal Inconsistency",
    icon: Activity,
    desc: "Frame-to-frame variation signatures",
  },
  {
    key: "artifactScore" as const,
    label: "Spatial Artifact Density",
    icon: Zap,
    desc: "Count and intensity of spatial anomalies",
  },
];

export default function ExplanationPanel({ explanation, isFake }: Props) {
  const accent = isFake ? "red" : "emerald";

  return (
    <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
          <Brain className="w-5 h-5 text-teal-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-200">Explainable AI Analysis</h3>
          <p className="text-xs text-slate-500">Why the model made this prediction</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {METRICS.map(({ key, label, icon: Icon, desc }) => {
          const score = explanation[key];
          const pct = Math.round(score * 100);
          const color = score > 0.7 ? "red" : score > 0.4 ? "amber" : "slate";
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 text-${color}-400`} />
                  <span className="text-sm font-medium text-slate-300">{label}</span>
                </div>
                <span className={`text-sm font-mono font-bold text-${color}-400`}>{pct}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 delay-100 ${
                    color === "red" ? "bg-red-500" : color === "amber" ? "bg-amber-500" : "bg-slate-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 mt-1">{desc}</p>
            </div>
          );
        })}
      </div>

      {explanation.topReasons.length > 0 && (
        <div className="border-t border-slate-700/50 pt-5">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-3">
            Key Detection Signals
          </p>
          <ul className="space-y-2">
            {explanation.topReasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-${accent}-500`} />
                <span className="text-sm text-slate-400 leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
