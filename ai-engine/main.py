# /ai-engine/main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
import torchxrayvision as xrv # <--- THE MAGIC LIBRARY
from torchvision import transforms
from PIL import Image
import io
import numpy as np
from utils.grad_cam import generate_gradcam_heatmap

app = FastAPI(title="MediSight AI Engine")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. LOAD RESEARCH MODEL
# We use DenseNet121 because it is the STANDARD for ChestX-ray14 (matches the famous CheXNet paper)
# If you strictly want ResNet, xrv has it, but DenseNet is more "medically accurate" for this specific dataset.
device = torch.device("cpu") # M2 Mac is fast enough on CPU for inference
print(f"Loading ChestX-ray14 Weights...")
model = xrv.models.DenseNet(weights="densenet121-res224-all") # Downloads weights automatically
model.eval()
model.to(device)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # A. READ IMAGE
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # B. PREPROCESS FOR MEDICAL AI (1 Channel)
        image = image.convert('L') 
        img_array = np.array(image)
        img_array = xrv.datasets.normalize(img_array, 255) 
        
        transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((224, 224)),
            transforms.ToTensor()
        ])
        
        input_tensor = transform(img_array).unsqueeze(0).to(device)
        input_tensor.requires_grad = True # Critical for Grad-CAM
        
        # C. INFERENCE & GRAD-CAM
        # We call our utility function here
        heatmap_b64, idx, score = generate_gradcam_heatmap(model, input_tensor, image)
        
        # D. LABELS
        pathologies = model.pathologies
        predicted_class = pathologies[idx]
        
        # Nice logging for your terminal
        print(f"Prediction: {predicted_class} | Score: {score:.4f}")

        return {
            "diagnosis": predicted_class,
            "confidence": float(score),
            "heatmap": heatmap_b64,
            "full_analysis": "Success"
        }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)