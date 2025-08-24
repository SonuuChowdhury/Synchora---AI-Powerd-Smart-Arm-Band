from transformers import DetrImageProcessor, DetrForObjectDetection
import torch
from PIL import Image, ImageDraw

# ----------------------
# Load model + processor
# ----------------------
processor = DetrImageProcessor.from_pretrained("facebook/detr-resnet-50")
model = DetrForObjectDetection.from_pretrained("facebook/detr-resnet-50")

# ----------------------
# Load image (local file)
# ----------------------
image_path = "street.png"   # replace with your local image path
image = Image.open(image_path)

# ----------------------
# Preprocess + Run model
# ----------------------
inputs = processor(images=image, return_tensors="pt")
outputs = model(**inputs)

# ----------------------
# Post-process results
# ----------------------
# Target size = (height, width)
target_sizes = torch.tensor([image.size[::-1]])
results = processor.post_process_object_detection(
    outputs, target_sizes=target_sizes, threshold=0.9
)[0]

# ----------------------
# Draw bounding boxes
# ----------------------
draw = ImageDraw.Draw(image)

for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
    box = [round(i, 2) for i in box.tolist()]
    label_text = model.config.id2label[label.item()]
    draw.rectangle(box, outline="red", width=3)
    draw.text((box[0], box[1]), f"{label_text}: {round(score.item(), 3)}", fill="red")

# ----------------------
# Show / Save result
# ----------------------
image.show()
# image.save("output.jpg")  # uncomment to save result


import json

# Convert results into JSON-friendly format, this will be feeded to summarisation and text giving model
detections = [
    {
        "label": model.config.id2label[label.item()],
        "score": round(score.item(), 3),
        "box": [round(i, 2) for i in box.tolist()]
    }
    for score, label, box in zip(results["scores"], results["labels"], results["boxes"])
]

print(json.dumps(detections, indent=2))
