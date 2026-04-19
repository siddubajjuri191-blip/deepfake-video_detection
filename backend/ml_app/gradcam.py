import torch
import torch.nn.functional as F
import numpy as np
import cv2
import base64
import io
from PIL import Image


class GradCAMExtractor:
    def __init__(self, model, target_layer_name="layer4"):
        self.model = model
        self.model.eval()
        self.gradients = None
        self.activations = None
        self.hook_handles = []
        self._register_hooks(target_layer_name)

    def _register_hooks(self, target_layer_name):
        target = None
        for name, module in self.model.named_modules():
            if name == target_layer_name or name.endswith(target_layer_name):
                target = module
                break
        if target is None:
            for name, module in self.model.named_modules():
                if isinstance(module, torch.nn.Conv2d):
                    target = module
        if target is not None:
            h1 = target.register_forward_hook(self._save_activation)
            h2 = target.register_full_backward_hook(self._save_gradient)
            self.hook_handles.extend([h1, h2])

    def _save_activation(self, module, input, output):
        self.activations = output.detach()

    def _save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate_heatmap(self, input_tensor, target_class=None):
        self.model.zero_grad()
        output = self.model(input_tensor)

        if target_class is None:
            target_class = output.argmax(dim=1).item()

        score = output[:, target_class]
        score.backward(retain_graph=True)

        if self.gradients is None or self.activations is None:
            return None, output

        weights = self.gradients.mean(dim=[2, 3], keepdim=True)
        cam = (weights * self.activations).sum(dim=1, keepdim=True)
        cam = F.relu(cam)
        cam = F.interpolate(
            cam,
            size=(input_tensor.shape[2], input_tensor.shape[3]),
            mode="bilinear",
            align_corners=False,
        )
        cam = cam.squeeze().cpu().numpy()
        cam_min, cam_max = cam.min(), cam.max()
        if cam_max > cam_min:
            cam = (cam - cam_min) / (cam_max - cam_min)

        return cam, output

    def overlay_heatmap(self, original_rgb, heatmap, alpha=0.45):
        heatmap_u8 = np.uint8(255 * heatmap)
        heatmap_colored = cv2.applyColorMap(heatmap_u8, cv2.COLORMAP_JET)
        heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
        if original_rgb.shape[:2] != heatmap_colored.shape[:2]:
            heatmap_colored = cv2.resize(
                heatmap_colored, (original_rgb.shape[1], original_rgb.shape[0])
            )
        overlay = cv2.addWeighted(original_rgb, 1 - alpha, heatmap_colored, alpha, 0)
        return overlay

    def extract_suspicious_regions(self, heatmap, threshold=0.6):
        binary = (heatmap > threshold).astype(np.uint8) * 255
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        regions = []
        h, w = heatmap.shape
        for cnt in contours:
            if cv2.contourArea(cnt) < 50:
                continue
            x, y, bw, bh = cv2.boundingRect(cnt)
            intensity = float(heatmap[y : y + bh, x : x + bw].mean())
            regions.append(
                {
                    "x": round(x / w, 4),
                    "y": round(y / h, 4),
                    "width": round(bw / w, 4),
                    "height": round(bh / h, 4),
                    "intensity": round(intensity, 4),
                }
            )
        regions.sort(key=lambda r: r["intensity"], reverse=True)
        return regions[:5]

    @staticmethod
    def numpy_to_base64(image_np):
        pil_img = Image.fromarray(image_np.astype(np.uint8))
        buf = io.BytesIO()
        pil_img.save(buf, format="JPEG", quality=88)
        return base64.b64encode(buf.getvalue()).decode("utf-8")

    def cleanup(self):
        for h in self.hook_handles:
            h.remove()
        self.hook_handles.clear()
