import { AnalysisResult } from "../types";

function makeFakeBase64Frame(isFake: boolean, index: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(112, 100, 10, 112, 100, 120);
  grad.addColorStop(0, isFake ? "#c97b5a" : "#7ba6c9");
  grad.addColorStop(1, "#1a1a2e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 224, 224);

  ctx.beginPath();
  ctx.arc(112, 95, 55, 0, Math.PI * 2);
  ctx.fillStyle = isFake ? "#d4946a" : "#8ab4d4";
  ctx.fill();

  ctx.fillStyle = "#333";
  ctx.fillRect(55, 80, 20, 14);
  ctx.fillRect(149, 80, 20, 14);

  ctx.beginPath();
  ctx.arc(112, 115, 18, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 2;
  ctx.stroke();

  if (isFake) {
    ctx.strokeStyle = `rgba(255,${50 + index * 20},50,0.6)`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(112 + (i - 1) * 15, 95 + (i % 2) * 10, 8 + i * 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  return canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
}

function makeGradCAMBase64(confidence: number, index: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#0a0a1a";
  ctx.fillRect(0, 0, 224, 224);

  const faceGrad = ctx.createRadialGradient(112, 100, 5, 112, 100, 80);
  faceGrad.addColorStop(0, `rgba(0,120,255,0.3)`);
  faceGrad.addColorStop(1, "transparent");
  ctx.fillStyle = faceGrad;
  ctx.fillRect(0, 0, 224, 224);

  const hotspots = [
    { x: 65, y: 82, r: 22, intensity: confidence * 0.95 },
    { x: 159, y: 82, r: 22, intensity: confidence * 0.9 },
    { x: 112, y: 130, r: 18, intensity: confidence * 0.85 },
    { x: 85, y: 58, r: 14, intensity: confidence * 0.7 + (index % 3) * 0.05 },
    { x: 140, y: 58, r: 12, intensity: confidence * 0.65 },
  ];

  hotspots.forEach(({ x, y, r, intensity }) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const red = Math.round(255 * intensity);
    const green = Math.round(255 * (1 - intensity) * 0.6);
    g.addColorStop(0, `rgba(${red},${green},0,0.92)`);
    g.addColorStop(0.5, `rgba(${Math.round(red * 0.7)},${Math.round(green * 0.5)},0,0.5)`);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = "rgba(255,80,80,0.7)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  hotspots.slice(0, 3).forEach(({ x, y, r, intensity }) => {
    if (intensity > 0.6) {
      ctx.beginPath();
      ctx.arc(x, y, r + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  return canvas.toDataURL("image/jpeg", 0.88).split(",")[1];
}

export function generateMockResult(): AnalysisResult {
  const overallConfidence = 0.87 + Math.random() * 0.1;
  const frameCount = 10;

  const frameAnalyses = Array.from({ length: frameCount }, (_, i) => {
    const conf = Math.min(0.99, overallConfidence - 0.1 + Math.random() * 0.2);
    return {
      frameIndex: i,
      timestamp: parseFloat((i * 0.5).toFixed(2)),
      prediction: "fake" as const,
      confidence: parseFloat(conf.toFixed(4)),
      originalImage: makeFakeBase64Frame(true, i),
      gradcamImage: makeGradCAMBase64(conf, i),
      suspiciousRegions: [
        { x: 0.25, y: 0.3, width: 0.15, height: 0.12, intensity: conf * 0.95 },
        { x: 0.6, y: 0.3, width: 0.14, height: 0.11, intensity: conf * 0.88 },
        { x: 0.42, y: 0.52, width: 0.12, height: 0.09, intensity: conf * 0.8 },
      ],
    };
  });

  return {
    overallPrediction: "fake",
    overallConfidence: parseFloat(overallConfidence.toFixed(4)),
    frameAnalyses,
    processingTime: 3.42,
    modelVersion: "DeepFake-v1 (Demo)",
    explanation: {
      topReasons: [
        "Strong GAN-synthesis activation patterns around eye regions",
        "Temporal inconsistencies detected across frame sequence",
        "Face boundary blending artifacts characteristic of deepfake generation",
        "Unnatural skin texture frequency signature in cheek regions",
      ],
      artifactScore: 0.82,
      temporalInconsistencyScore: 0.74,
      blendingArtifactScore: 0.91,
      facialLandmarkScore: 0.88,
    },
  };
}
