# 🚔 EAEDS Control
**Emotion-Aware Emergency Dispatch System (Open Source Edition)**

> *System Status: ONLINE* | *Theme: Midnight Command*

## 🚨 Overview
**EAEDS Control** is a next-generation 911 dispatch interface that uses Artificial Intelligence to analyze live emergency calls.
*   **Real-Time Transcription:** Converts caller voice to text instantly.
*   **Emotion Detection:** identifying Fear, Panic, Confusion, or Calmness.
*   **Automated Dispatch:** Recommends Police, Fire, or EMS based on context.
*   **Privacy First:** designed to run **100% Offline** on a GPU.

## 🌗 The "Midnight Command" UI
The latest update introduces a professional, high-contrast dark theme designed for low-light command centers.
*   **Deep Navy / Slate** backgrounds for reduced eye strain.
*   **Electric Blue** accents for active system elements.
*   **Critical Red** alerts for life-threatening emergencies.

## 🚀 Deployment Guides
### 💻 Laptop Mode (Development)
The default mode uses **Groq Cloud API** and **Browser Speech APIs** to simulate the full experience on a standard laptop.
1.  `cd server` -> `python -m uvicorn main:app --reload`
2.  `cd client` -> `npm run dev`

### ⚡ GPU Mode (Production/Offline)
For the full privacy-preserving "Brain Transplant" (replacing Cloud APIs with local Llama 3 & Whisper models), please refer to the specialized guide:
👉 **[GPU DEPLOYMENT GUIDE](./GPU_DEPLOYMENT_GUIDE.md)**

## 🛠️ Tech Stack
*   **Frontend:** Next.js 14, Tailwind CSS, Shadcn UI, Lucide React.
*   **Backend:** Python FastAPI, WebSockets.
*   **AI Engine:** Groq (Cloud) / Llama 3 + Whisper (Local GPU Target).

---
*Built for the Future of Emergency Response.*
