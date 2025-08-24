import cv2  # OpenCV library for computer vision tasks
import numpy as np  # Numpy for numerical operations

# Load YOLO model (You Only Look Once - real-time object detection)
# 'readNet' loads the pre-trained weights and configuration for YOLOv3
net = cv2.dnn.readNet("yolov3.weights", "yolov3.cfg")

# Load class names (COCO dataset contains 80 common object classes)
with open("coco.names", "r") as f:
    classes = [line.strip() for line in f.readlines()]

# Get output layer names from the YOLO model
# These layers provide the final detection results
layer_names = net.getLayerNames()
output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]

# Assign random colors for each class for visualization
colors = np.random.uniform(0, 255, size=(len(classes), 3))

# Start webcam capture (device 0 is usually the default camera)
cap = cv2.VideoCapture(0)


# Main loop: Read frames from webcam and process them
while True:
    ret, frame = cap.read()  # Capture frame-by-frame
    if not ret:
        break  # Exit loop if frame not captured


    # Get frame dimensions
    height, width, channels = frame.shape


    # Convert image to blob (preprocessing for YOLO)
    # BlobFromImage resizes, normalizes, and formats the image for the network
    blob = cv2.dnn.blobFromImage(frame, 0.00392, (416, 416), (0, 0, 0), True, crop=False)
    net.setInput(blob)  # Set the input to the network
    outs = net.forward(output_layers)  # Run forward pass to get detections


    # Lists to store detection info for each object
    class_ids = []  # Detected class IDs
    confidences = []  # Confidence scores
    boxes = []  # Bounding box coordinates


    # Process network outputs (detections)
    # Each detection contains class scores and bounding box info
    for out in outs:
        for detection in out:
            scores = detection[5:]  # Class probabilities
            class_id = np.argmax(scores)  # Get class with highest score
            confidence = scores[class_id]  # Confidence for that class
            if confidence > 0.5:  # Only consider detections above threshold
                # Extract bounding box coordinates (relative to image size)
                center_x = int(detection[0] * width)
                center_y = int(detection[1] * height)
                w = int(detection[2] * width)
                h = int(detection[3] * height)

                # Convert center coordinates to top-left corner
                x = int(center_x - w / 2)
                y = int(center_y - h / 2)

                # Store detection info
                boxes.append([x, y, w, h])
                confidences.append(float(confidence))
                class_ids.append(class_id)


    # Non-max suppression (NMS) to remove overlapping boxes
    # NMS keeps only the best bounding box for each detected object
    indexes = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)


    # Draw bounding boxes and labels on the frame
    for i in range(len(boxes)):
        if i in indexes:
            x, y, w, h = boxes[i]
            label = str(classes[class_ids[i]])  # Object class name
            conf = round(confidences[i] * 100, 1)  # Confidence percentage
            color = colors[class_ids[i]]  # Color for this class
            # Draw rectangle around detected object
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
            # Put class label and confidence above the box
            cv2.putText(frame, f"{label} {conf}%", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)


    # Show the frame with detections
    cv2.imshow("YOLO Detection", frame)


    # Exit loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break


# Release webcam and close all OpenCV windows
cap.release()
cv2.destroyAllWindows()
