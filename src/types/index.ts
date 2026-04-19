export interface SuspiciousRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  intensity: number;
}

export interface FrameAnalysis {
  frameIndex: number;
  timestamp: number;
  prediction: "fake" | "real";
  confidence: number;
  originalImage: string;
  gradcamImage: string | null;
  suspiciousRegions: SuspiciousRegion[];
}

export interface ExplanationData {
  topReasons: string[];
  artifactScore: number;
  temporalInconsistencyScore: number;
  blendingArtifactScore: number;
  facialLandmarkScore: number;
}

export interface AnalysisResult {
  overallPrediction: "fake" | "real";
  overallConfidence: number;
  frameAnalyses: FrameAnalysis[];
  processingTime: number;
  modelVersion: string;
  explanation: ExplanationData;
}

export type AnalysisStatus = "idle" | "uploading" | "analyzing" | "complete" | "error";
