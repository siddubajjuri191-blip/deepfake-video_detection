import { useState, useCallback } from "react";
import { ScanSearch, RefreshCw, Github, AlertTriangle } from "lucide-react";
import { useAnalysis } from "./hooks/useAnalysis";
import { generateMockResult } from "./utils/mockData";
import UploadZone from "./components/UploadZone";
import AnalysisProgress from "./components/AnalysisProgress";
import VerdictCard from "./components/VerdictCard";
import ExplanationPanel from "./components/ExplanationPanel";
import FrameTimeline from "./components/FrameTimeline";
import HeatmapLegend from "./components/HeatmapLegend";
import { AnalysisResult } from "./types";

export default function App() {
  const { status, result: apiResult, error, progress, analyze, reset } = useAnalysis();
  const [demoResult, setDemoResult] = useState<AnalysisResult | null>(null);

  const result = apiResult ?? demoResult;
  const isLoading = status === "uploading" || status === "analyzing";
  const showResults = (status === "complete" || demoResult !== null) && result !== null;

  const handleDemo = useCallback(() => {
    setDemoResult(generateMockResult());
  }, []);

  const handleReset = useCallback(() => {
    reset();
    setDemoResult(null);
  }, [reset]);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(20,184,166,0.08) 0%, transparent 60%)",
        }}
      />

      <header className="relative z-10 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-900/40">
              <ScanSearch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100 tracking-tight">DeepFake Detector</h1>
              <p className="text-[10px] text-teal-400/80 font-medium uppercase tracking-widest">
                Explainable AI &bull; Grad-CAM
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {showResults && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>New Analysis</span>
              </button>
            )}
            <a
              href="https://github.com/abhijitjadhav1998/Deepfake_detection_using_deep_learning"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              <Github className="w-4 h-4 text-slate-400" />
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {!showResults && !isLoading && (
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-100 tracking-tight mb-3">
              Detect Deepfakes with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                Explainable AI
              </span>
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
              Upload a video to receive a full Grad-CAM analysis — showing exactly
              which facial regions triggered the deepfake classification.
            </p>
          </div>
        )}

        {!showResults && !isLoading && (
          <div className="flex flex-col items-center gap-8">
            <UploadZone status={status} onFile={analyze} onDemo={handleDemo} />

            {error && (
              <div className="w-full max-w-2xl flex items-start gap-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl px-5 py-4 text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold mb-2">Backend Connection Failed</p>
                  <p className="text-red-400/80 mb-3">{error}</p>
                  <div className="bg-slate-900/60 rounded p-3 text-xs text-red-400/90 font-mono space-y-1 mb-3">
                    <p>To run the backend locally:</p>
                    <p className="ml-2">cd backend</p>
                    <p className="ml-2">pip install -r requirements.txt</p>
                    <p className="ml-2">python manage.py runserver</p>
                  </div>
                  <p className="text-red-500/60">You can also use the <strong>Run Demo</strong> button above to see the UI with sample data.</p>
                </div>
              </div>
            )}

            <div className="w-full max-w-2xl grid grid-cols-3 gap-4">
              {[
                { label: "Grad-CAM Heatmaps", desc: "Visual explanation of suspicious regions" },
                { label: "Frame-by-Frame", desc: "Per-frame confidence and artifact mapping" },
                { label: "Artifact Scoring", desc: "Temporal, spatial & blending metrics" },
              ].map(({ label, desc }) => (
                <div
                  key={label}
                  className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-center"
                >
                  <p className="text-sm font-semibold text-slate-300 mb-1">{label}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center gap-8 py-10">
            <AnalysisProgress status={status} progress={progress} />
          </div>
        )}

        {showResults && result && (
          <div className="space-y-6">
            <VerdictCard result={result} />

            <HeatmapLegend />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <FrameTimeline frames={result.frameAnalyses} />
              </div>
              <div className="lg:col-span-2">
                <ExplanationPanel
                  explanation={result.explanation}
                  isFake={result.overallPrediction === "fake"}
                />
              </div>
            </div>

            {demoResult && (
              <div className="flex items-center gap-2 text-xs text-amber-500/80 bg-amber-950/30 border border-amber-500/20 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Demo mode — showing synthetic sample data. Connect the Django backend for real video analysis.
                </span>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
