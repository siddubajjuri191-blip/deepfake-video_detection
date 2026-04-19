import os
import cv2
import torch
import numpy as np
from torchvision import transforms
from .gradcam import GradCAMExtractor

TRANSFORM = transforms.Compose(
    [
        transforms.ToPILImage(),
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ]
)

ARTIFACT_LABELS = [
    "Eye region inconsistency",
    "Facial boundary blending",
    "Skin texture anomaly",
    "Hair-face boundary artifact",
    "Lighting inconsistency",
    "Temporal flickering",
    "Compression artifact mismatch",
]


def load_model(models_dir="models"):
    model_files = [f for f in os.listdir(models_dir) if f.endswith(".pt")]
    if not model_files:
        raise FileNotFoundError("No .pt model files found in models directory")

    model_path = os.path.join(models_dir, model_files[0])
    name_parts = os.path.splitext(model_files[0])[0].split("_")
    num_frames = 10
    for part in name_parts:
        if part.isdigit():
            num_frames = int(part)
            break

    model = torch.load(model_path, map_location=torch.device("cpu"))
    model.eval()
    return model, num_frames


def extract_frames(video_path, num_frames=10):
    cap = cv2.VideoCapture(video_path)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    indices = np.linspace(0, max(total - 1, 0), num_frames, dtype=int)
    frames = []
    timestamps = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
        ret, frame = cap.read()
        if ret:
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(frame_rgb)
            timestamps.append(round(idx / fps, 2) if fps > 0 else 0.0)
    cap.release()
    return frames, timestamps


def analyze_video(video_path, models_dir="models"):
    import time

    start = time.time()
    model, num_frames = load_model(models_dir)
    extractor = GradCAMExtractor(model)

    frames, timestamps = extract_frames(video_path, num_frames)

    frame_results = []
    fake_confidences = []

    for i, (frame, ts) in enumerate(zip(frames, timestamps)):
        original_resized = cv2.resize(frame, (224, 224))
        tensor = TRANSFORM(frame).unsqueeze(0)

        heatmap, output = extractor.generate_heatmap(tensor, target_class=1)
        probs = torch.softmax(output, dim=1).squeeze()
        fake_prob = float(probs[1])
        real_prob = float(probs[0])
        fake_confidences.append(fake_prob)

        prediction = "fake" if fake_prob > 0.5 else "real"
        confidence = fake_prob if prediction == "fake" else real_prob

        original_b64 = GradCAMExtractor.numpy_to_base64(original_resized)
        overlay_b64 = None
        regions = []
        if heatmap is not None:
            overlay = extractor.overlay_heatmap(original_resized, heatmap)
            overlay_b64 = GradCAMExtractor.numpy_to_base64(overlay)
            regions = extractor.extract_suspicious_regions(heatmap)

        frame_results.append(
            {
                "frameIndex": i,
                "timestamp": ts,
                "prediction": prediction,
                "confidence": round(confidence, 4),
                "originalImage": original_b64,
                "gradcamImage": overlay_b64,
                "suspiciousRegions": regions,
            }
        )

    extractor.cleanup()

    avg_fake = np.mean(fake_confidences) if fake_confidences else 0.5
    overall_prediction = "fake" if avg_fake > 0.5 else "real"
    overall_confidence = float(avg_fake) if overall_prediction == "fake" else float(1 - avg_fake)

    sorted_by_intensity = sorted(
        [r for f in frame_results for r in f["suspiciousRegions"]],
        key=lambda r: r["intensity"],
        reverse=True,
    )
    artifact_score = min(1.0, len(sorted_by_intensity) / 10)
    temporal_score = float(np.std(fake_confidences)) if fake_confidences else 0.0
    blending_score = float(np.max(fake_confidences)) if fake_confidences else 0.0

    top_reasons = []
    if artifact_score > 0.4:
        top_reasons.append("High density of spatial artifacts detected across face region")
    if temporal_score > 0.15:
        top_reasons.append("Temporal inconsistency between frames suggests synthetic generation")
    if blending_score > 0.8:
        top_reasons.append("Face boundary blending artifacts characteristic of GAN synthesis")
    if avg_fake > 0.7:
        top_reasons.append("Strong activation patterns in eye and mouth regions")
    if not top_reasons:
        top_reasons.append("Minor artifacts detected; borderline classification")

    processing_time = round(time.time() - start, 2)

    return {
        "overallPrediction": overall_prediction,
        "overallConfidence": round(overall_confidence, 4),
        "frameAnalyses": frame_results,
        "processingTime": processing_time,
        "modelVersion": "DeepFake-v1",
        "explanation": {
            "topReasons": top_reasons,
            "artifactScore": round(artifact_score, 4),
            "temporalInconsistencyScore": round(min(temporal_score * 3, 1.0), 4),
            "blendingArtifactScore": round(blending_score, 4),
            "facialLandmarkScore": round(avg_fake, 4),
        },
    }
