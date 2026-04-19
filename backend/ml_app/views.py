import os
import json
import tempfile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .predictor import analyze_video

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def analyze(request):
    if request.method == "OPTIONS":
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    if "video" not in request.FILES:
        return _cors(JsonResponse({"error": "No video file provided"}, status=400))

    video_file = request.FILES["video"]
    allowed_types = ["video/mp4", "video/avi", "video/quicktime", "video/x-msvideo", "video/webm"]
    if video_file.content_type not in allowed_types:
        return _cors(JsonResponse({"error": "Unsupported file type"}, status=400))

    suffix = os.path.splitext(video_file.name)[1] or ".mp4"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        for chunk in video_file.chunks():
            tmp.write(chunk)
        tmp_path = tmp.name

    try:
        result = analyze_video(tmp_path, models_dir=MODELS_DIR)
        return _cors(JsonResponse(result))
    except FileNotFoundError as e:
        return _cors(JsonResponse({"error": str(e)}, status=503))
    except Exception as e:
        return _cors(JsonResponse({"error": f"Analysis failed: {str(e)}"}, status=500))
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def _cors(response):
    response["Access-Control-Allow-Origin"] = "*"
    return response
