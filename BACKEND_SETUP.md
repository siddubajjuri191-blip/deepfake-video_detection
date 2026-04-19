# DeepFake Detector - Backend Setup Guide

## Quick Start

The frontend is ready at `http://localhost:5173` (when running `npm run dev`). To enable real video analysis with Grad-CAM visualization, set up the Django backend:

### Prerequisites
- Python 3.8+
- NVIDIA GPU with CUDA (recommended for performance)
- 8GB+ RAM

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Note:** This will install PyTorch, TorchVision, OpenCV, and Django. The requirements.txt includes GPU support.

### Step 2: Set Up Directories

```bash
mkdir -p models uploaded_videos
```

Place your trained `.pt` model file in the `models/` directory. The filename should follow this format:
```
model_<num_frames>_frames_final.pt
```

Example: `model_10_frames_final.pt`

### Step 3: Run the Server

```bash
python manage.py runserver
```

The backend will start at `http://localhost:8000`.

### Step 4: Verify Connection

- Open the frontend at `http://localhost:5173`
- Try uploading a video
- The frontend will automatically connect to the backend

## API Endpoint

**POST** `http://localhost:8000/api/analyze/`

**Request:** Multipart form-data with a `video` file

**Response:**
```json
{
  "overallPrediction": "fake",
  "overallConfidence": 0.87,
  "frameAnalyses": [
    {
      "frameIndex": 0,
      "timestamp": 0.0,
      "prediction": "fake",
      "confidence": 0.92,
      "originalImage": "base64_encoded_image",
      "gradcamImage": "base64_encoded_heatmap",
      "suspiciousRegions": [
        {
          "x": 0.25,
          "y": 0.3,
          "width": 0.15,
          "height": 0.12,
          "intensity": 0.95
        }
      ]
    }
  ],
  "processingTime": 3.42,
  "modelVersion": "DeepFake-v1",
  "explanation": {
    "topReasons": [...],
    "artifactScore": 0.82,
    "temporalInconsistencyScore": 0.74,
    "blendingArtifactScore": 0.91,
    "facialLandmarkScore": 0.88
  }
}
```

## Demo Mode

If the backend isn't available, click **"Run Demo"** in the frontend to see the full Grad-CAM interface with synthetic sample data.

## Troubleshooting

**ModuleNotFoundError for torch/cv2:**
```bash
pip install torch torchvision opencv-python
```

**Model not found:**
- Ensure `backend/models/` directory exists
- Check that model filename ends with `.pt`
- Model filename must contain frame count (e.g., `_10_frames_`)

**CUDA/GPU issues:**
- Install NVIDIA CUDA drivers
- Verify PyTorch installation: `python -c "import torch; print(torch.cuda.is_available())"`
- If False, PyTorch is using CPU (slower but functional)

**Port 8000 already in use:**
```bash
python manage.py runserver 8001
# Then update VITE_API_URL in .env to http://localhost:8001/api
```

## Frontend Configuration

Backend URL is configured in `.env`:
```
VITE_API_URL=http://localhost:8000/api
```

Change this if running the Django server on a different port or remote host.

## Features

- **Grad-CAM Visualization:** See exactly which facial regions triggered the deepfake classification
- **Frame-by-Frame Analysis:** Per-frame confidence scores and heatmaps
- **Artifact Scoring:** 4 metrics:
  - Facial Landmark Anomaly
  - Blending Artifacts
  - Temporal Inconsistency
  - Spatial Artifact Density
- **Explainable AI:** Top detection reasons for each prediction
- **Real-time Progress:** Upload progress and analysis status
