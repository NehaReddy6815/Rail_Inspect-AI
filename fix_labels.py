import os

base_path = "E:/Rail_Inspect-AI/data/railway-crack"

folders = ["train", "valid", "test"]

for folder in folders:
    labels_path = os.path.join(base_path, folder, "labels")

    for file in os.listdir(labels_path):
        if file.endswith(".txt"):
            file_path = os.path.join(labels_path, file)

            with open(file_path, "r") as f:
                lines = f.readlines()

            new_lines = []
            for line in lines:
                parts = line.strip().split()
                if len(parts) > 0:
                    parts[0] = "0"   # force class = 0
                new_lines.append(" ".join(parts) + "\n")

            with open(file_path, "w") as f:
                f.writelines(new_lines)

print("✅ All labels converted to class 0")