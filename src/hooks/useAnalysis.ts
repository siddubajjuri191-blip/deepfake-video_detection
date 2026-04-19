import { useState, useCallback } from "react";
import { AnalysisResult, AnalysisStatus } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export function useAnalysis() {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const analyze = useCallback(async (file: File) => {
    setStatus("uploading");
    setResult(null);
    setError(null);
    setProgress(10);

    const formData = new FormData();
    formData.append("video", file);

    try {
      setProgress(30);
      setStatus("analyzing");

      const res = await fetch(`${API_BASE}/analyze/`, {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errBody.error ?? `Server error ${res.status}`);
      }

      const data: AnalysisResult = await res.json();
      setProgress(100);
      setResult(data);
      setStatus("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setStatus("error");
      setProgress(0);
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  return { status, result, error, progress, analyze, reset };
}
