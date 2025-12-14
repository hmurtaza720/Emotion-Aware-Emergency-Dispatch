# 🚔 dispatchAI (EAEDS)
**Emotion-Aware Emergency Dispatch System** | *Hybrid Cloud Edition*

> *Status: OPERATIONAL* | *Architecture: Hybrid (Local + Colab GPU)*

## 🚨 Overview
**dispatchAI** is an autonomous 911 dispatcher that uses AI to Listen, Feel, and Reason in real-time.

It solves the problem of running heavy AI models on standard laptops by splitting the workload:
*   **The Body (Local):** Your laptop runs the sleek React UI (Phone + Map).
*   **The Brain (Cloud):** A Google Colab T4 GPU runs the AI models.

## 🧠 AI Capabilities
1.  **Hearing (Whisper):** Instant, accurate speech-to-text.
2.  **Feeling (OpenSMILE):** Detects if a caller is **Calm** or **Panicking** (Acoustic Analysis).
3.  **Thinking (Mistral-7B):** Follows 911 protocols to ask the right questions (Police/Fire/Medical).

## 🛠️ Tech Stack
*   **Frontend:** Next.js 14, Tailwind CSS, Shadcn UI, Lucide React.
*   **Backend:** Python FastAPI, WebSockets.
*   **AI Engine:** Google Colab (Free Tier), Cloudflare Tunnel.

## 🚀 Quick Start
### 1. Start the Local System
1.  **Backend:** `cd server` -> `python -m uvicorn main:app --reload`
2.  **Frontend:** `cd client` -> `npm run dev`

### 2. Connect the Brain
1.  Open the `DispatchAI_Colab_Server.ipynb` in Google Colab.
2.  Run All Cells.
3.  Copy the **Cloudflare Tunnel URL** (e.g., `https://cat-fact.trycloudflare.com`).
4.  Paste it into the **Phone Settings** on your Local Frontend (`localhost:3000/phone`).

---
*Built as a Final Year Project (FYP)*
