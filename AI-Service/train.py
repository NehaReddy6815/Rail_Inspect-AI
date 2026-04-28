from ultralytics import YOLO

def train_model():
    # load last checkpoint (resume point)
    model = YOLO("runs/detect/railway_crack_model/weights/last.pt")

    model.train(
        data="../data/railway-crack/data.yaml",
        epochs=30,      # total target epochs
        imgsz=640,
        batch=8,
        name="railway_crack_model",
        resume=True     # key line
    )

if __name__ == "__main__":
    train_model()