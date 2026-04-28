from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import shutil, os, cv2, base64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO("runs/detect/railway_crack_model/weights/best.pt")

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    results = model(temp_path, save=False)

    detections = []
    for r in results:
        for box in r.boxes:
            detections.append({
                "label": "crack",
                "confidence": float(box.conf[0])
            })

    annotated = results[0].plot()
    _, buffer = cv2.imencode(".jpg", annotated)
    img_base64 = base64.b64encode(buffer).decode("utf-8")

    if os.path.exists(temp_path):
        os.remove(temp_path)

    return {
        "total_defects": len(detections),
        "detections": detections,
        "image_base64": img_base64
    }