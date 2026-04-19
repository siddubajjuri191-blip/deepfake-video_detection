# Grad-CAM Explainable AI Features

## What You Get

### 1. **Verdict Card** (Top of Results)
- Large confidence gauge (0-100%)
- Clear DEEPFAKE vs AUTHENTIC classification
- Processing time and model version
- Frame count analyzed

### 2. **Grad-CAM Heatmap Visualization**
Left side of results shows:
- **Original Frame:** Clean video frame (toggle to view)
- **Heatmap Overlay:** Red/orange regions = suspicious areas
- **Bounding Boxes:** Top 5 highest-activation regions marked with intensity %
- Real-time toggle between original and heatmap views

**What the colors mean:**
- Red = High activation (very suspicious)
- Yellow = Medium activation (moderately suspicious)
- Blue = Low activation (less suspicious)

### 3. **Frame-by-Frame Timeline**
- **Thumbnail Grid:** 5-column interactive grid of all analyzed frames
- **Confidence Chart:** Visual timeline showing prediction confidence across frames
- **Per-Frame Metrics:** Click any frame to see suspicious region breakdown
- Hover over timestamps to identify which frame you're inspecting

### 4. **Explainable AI Panel** (Right side)
Shows 4 key metrics that triggered the "FAKE" classification:

1. **Facial Landmark Anomaly** (0-100%)
   - Measures deviation in key facial features
   - Eyes, mouth, nose positioning analysis

2. **Blending Artifacts** (0-100%)
   - Seam and boundary artifacts from GAN face synthesis
   - Higher = more visible blending imperfections

3. **Temporal Inconsistency** (0-100%)
   - Frame-to-frame variation patterns
   - Detects unnatural motion or flickering

4. **Spatial Artifact Density** (0-100%)
   - Count of high-intensity suspicious regions
   - Overall abnormality concentration

### 5. **Top Detection Reasons**
AI-generated explanations like:
- "Strong GAN-synthesis activation patterns around eye regions"
- "Facial boundary blending artifacts characteristic of deepfake generation"
- "Temporal inconsistencies detected across frame sequence"
- "Unnatural skin texture frequency signature in cheek regions"

## How to Interpret Results

### FAKE Prediction (High Confidence > 85%)
✗ Multiple artifact scores > 70%
✗ Concentrated red regions in face area
✗ Temporal inconsistency detected
→ **Action:** Treat as likely deepfake

### FAKE Prediction (Medium Confidence 50-85%)
⚠ Some artifact scores moderate
⚠ Scattered or weak heatmap activations
⚠ Minor temporal variations
→ **Action:** Requires manual review

### AUTHENTIC Prediction (Confidence < 50%)
✓ Low artifact scores
✓ Few or no heatmap activations
✓ Consistent temporal patterns
→ **Action:** Likely genuine video

## Technical Details

- **Model:** Trained on deepfake detection dataset
- **Analysis:** 10 frames extracted per video
- **Resolution:** 224×224 pixels (normalized)
- **Heatmap Method:** Gradient-weighted Class Activation Mapping (Grad-CAM)
- **Output:** Per-frame and overall confidence scores

## Common Patterns

### High Fake Detection:
- Red concentrations around eyes/eye whites
- Mouth boundary flickering
- Skin texture discontinuities
- Unnatural lighting in one region

### High Authentic Confidence:
- Uniform skin texture
- Natural eye reflections
- Consistent lighting
- Smooth motion between frames
