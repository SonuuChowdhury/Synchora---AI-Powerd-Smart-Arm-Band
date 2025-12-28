#!/usr/bin/env python3
import sys
import json
import io
import os
import numpy as np
from PIL import Image
from ultralytics import YOLO

# Load YOLOv8 model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "yolov8n.pt")

try:
    model = YOLO(MODEL_PATH)
except Exception as e:
    print(json.dumps({"error": f"Failed to load YOLOv8 model: {str(e)}"}))
    sys.exit(1)


def main():
    try:
        # Read image from stdin
        image_data = sys.stdin.buffer.read()
        if not image_data:
            print(json.dumps({"error": "No image data received"}))
            sys.exit(1)

        # Convert to image
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        img_np = np.array(image)

        # Run detection
        results = model(img_np, verbose=False)[0]

        detections = []

        if results.boxes is not None:
            for box in results.boxes:
                conf = float(box.conf[0])
                if conf < 0.5:
                    continue

                cls_id = int(box.cls[0])
                class_name = model.names[cls_id]

                x1, y1, x2, y2 = box.xyxy[0]
                x = int(x1)
                y = int(y1)
                w = int(x2 - x1)
                h = int(y2 - y1)

                detections.append({
                    "class": class_name,
                    "confidence": round(conf, 2),
                    "bbox": {
                        "x": x,
                        "y": y,
                        "width": w,
                        "height": h
                    }
                })

        result = {
            "success": True,
            "detections": detections,
            "count": len(detections)
        }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": f"Detection failed: {str(e)}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
