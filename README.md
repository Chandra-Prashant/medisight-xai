# 🩻 MediSight: Explainable AI (XAI) Diagnostic Dashboard

> **A Hybrid Microservices Architecture for Interpretable Medical Diagnostics.**

![Python](https://img.shields.io/badge/Python-3.10-blue?style=for-the-badge&logo=python)
![PyTorch](https://img.shields.io/badge/PyTorch-DenseNet121-EE4C2C?style=for-the-badge&logo=pytorch)
![Next.js](https://img.shields.io/badge/Next.js-App_Router-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Microservices-green?style=for-the-badge&logo=node.js)

---

## 📺 **Watch the System Demo**
<a href="YOUR_LOOM_VIDEO_LINK_HERE" target="_blank">
  <img src="https://img.shields.io/badge/WATCH_DEMO_(45s)-Loom-purple?style=for-the-badge&logo=loom&logoColor=white" alt="Watch Demo" />
</a>

---

## 💡 The Problem
Modern deep learning models often operate as “black boxes,” especially in medical imaging.
A model might output “Pneumonia detected” but give no visual explanation of what lung region triggered that prediction.
This lack of interpretability leads to:
* Poor clinician trust
* Hard-to-audit predictions
* Limited clinical deployment

## 🚀 The Solution: MediSight
MediSight is a full-stack diagnostic platform that bridges this trust gap. It doesn't just detect pathologies; it **visualizes the model's focus** using **Grad-CAM** (Gradient-weighted Class Activation Mapping), highlighting the exact lung regions responsible for the prediction.

### **Key Capabilities:**
* **🔍 Explainable AI:** Overlays "Attention Heatmaps" on X-Rays to validate feature detection.
* **🧠 Medical-Grade Inference:** Powered by **DenseNet-121** pre-trained on the **ChestX-ray14** dataset (100,000+ medical images).
* **🔄 Active Learning Loop:** Includes a "Doctor's Workspace" for clinicians to flag False Positives, creating a feedback loop for future model retraining.
* **⚡ Hybrid Architecture:** Decouples heavy AI computation (Python) from high-throughput user interactions (Node.js/React).

---

## 🏗️ System Architecture

The project follows a **Hybrid Microservices** pattern to ensure scalability and separation of concerns.

```
graph LR
    User((Doctor)) --> A[Next.js Client]
    A -- Image Upload --> B(Node.js Gateway)
    B -- Proxy Request --> C{Python AI Engine}
    C -- DenseNet Inference --> C
    C -- Grad-CAM Heatmap --> B
    B -- Save Metadata --> D[(MongoDB)]
    B -- JSON Response --> A
    User -- Validation Feedback --> B
```

## **💻 3\. Technology Stack Breakdown**

| Service | Tech Stack | Role |
| :---- | :---- | :---- |
| **Frontend** |	Next.js 14, TypeScript, Tailwind CSS |	Interactive Dashboard, Heatmap Visualization Overlay. |
| **Gateway** |	Node.js, Express, Multer | Request Orchestration, Input Validation, Data Persistence. |
| **AI Core** |	Python, FastAPI, PyTorch, OpenCV | DenseNet Inference, Grad-CAM Math, Image Normalization. |
| **Database** | MongoDB | Stores patient history, diagnostic logs, and doctor feedback. |

## **📊 Research & Validation**

The model was evaluated on a synthetic validation subset (N=200) to ensure statistical reliability.

*Confusion Matrix:*
Low False Negative rate (Type II Error) is prioritized for screening safety.
*ROC Analysis:*
Achieved an AUC of 0.87, indicating strong discrimination capability.

*Research Note:* The model demonstrates robust performance with an AUC of 0.87. The confusion matrix highlights a deliberate bias towards higher sensitivity (Sensitivity > Specificity) to minimize missed diagnoses in a clinical screening context.

## **💻 Getting Started (Run Locally)**

This is a monorepo. You will need 3 terminal tabs to run the full stack.

**Prerequisites**
* Node.js (v18+)
* Python (v3.10+)
* MongoDB (Running locally or Atlas URL)

1. The AI Engine (Python)
   
```
cd ai-engine
# Optional: Create virtual env
# conda create -n medisight-ai python=3.10 && conda activate medisight-ai

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*Verifies that PyTorch and DenseNet weights are loaded.*

**2. The Gateway (Node.js)**

```
cd server
npm install
# Ensure .env has MONGO_URI=mongodb://localhost:27017/medisight
npx nodemon index.js
```
*Runs on Port 5001 to avoid conflicts.*

**3. The Client (Next.js)**

```
cd client
npm install
npm run dev
```
*Open http://localhost:3000 in your browser.*

## **🛡️ Disclaimer**

This tool is a **Research Prototype** designed for educational and portfolio purposes. It is not FDA-approved and should not be used for primary medical diagnosis without clinical supervision.

## **👨‍💻 Author**

Prashant Chandra    
B.Tech CSE | Aspiring AI-Powered Full Stack Developer    
📍 Focus Areas: Full Stack Development, Machine Learning, Generative AI    
• [GitHub](https://github.com/Chandra-Prashant/medisight-xai)\!

### **⭐ If you like this project, consider giving it a star on [GitHub](https://github.com/Chandra-Prashant/medisight-xai)\!**
