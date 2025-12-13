# 🚀 GPU Command Center: Deployment Guide
**For deploying EAEDS Control on a High-Performance GPU Machine.**

---

## 1. What is this project? (Quick Summary)
**EAEDS Control** is an **Emotion-Aware Emergency Dispatch System**.
*   **What it does:** It listens to 911 calls, detects the caller's emotion (Fear, Panic, Calm), identifies the emergency location, and automatically dispatches the right units (Police/Fire/EMS).
*   **Current State:** It runs on a laptop using "Cloud Brains" (Groq) and Browser Voice tools.
*   **The Mission:** Move the "Brain" to a local GPU so it runs **100% Offline** and **Securely**.

## 2. What is working vs. What is left?
| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Dispatcher Dashboard** | ✅ **Done** | Midnight Command Theme, Real-time Updates. |
| **Cloud AI (Groq)** | ✅ **Done** | Fast, but requires internet. |
| **Browser Voice** | ✅ **Done** | Uses Chrome's built-in STT/TTS. |
| **Local LLM (Llama 3)** | ⏳ **Pending** | Needs GPU (Friend's PC). |
| **Local STT (Whisper)** | ⏳ **Pending** | Needs GPU. |
| **Local TTS (Coqui)** | ⏳ **Pending** | Needs GPU. |

---

## 3. The Flow (Architecture)
### Current (Laptop/Cloud Mode)
1.  **Microphone** (Browser) 🎤
2.  **Chrome STT** converts Audio ➡️ Text.
3.  **FASTAPI Server** receives Text.
4.  **Groq Cloud API** thinks 🧠.
5.  **Dashboard** updates (Map/Emotion).
6.  **Chrome TTS** speaks response 🔊.

### Future (GPU Mode - Target)
1.  **Microphone** (Python Stream) 🎤
2.  **Local Whisper AI** converts Audio ➡️ Text (On GPU).
3.  **Local Llama 3** thinks 🧠 (On GPU).
4.  **Local TTS AI** generates Audio 🔊 (On GPU).
5.  **Dashboard** updates.
*Result: 100% Offline, Privacy-First System.*

---

## 4. Step-by-Step GPU Installation Guide
**Follow these exact steps on your friend's PC.**

### Step 1: Pre-requisites (Download these first)
1.  **Python 3.10 or 3.11** (Check "Add to PATH" during install).
2.  **Git** (For downloading the code).
3.  **NVIDIA CUDA Toolkit 12.1** (Crucial for GPU acceleration).
4.  **Visual Studio Code** (To edit code).

### Step 2: Get the Code
Open a terminal (PowerShell) and run:
```powershell
git clone https://github.com/hmurtaza720/Emotion-Aware-Emergency-Dispatch.git
cd Emotion-Aware-Emergency-Dispatch
```
*(Or just copy your project folder via USB)*

### Step 3: The Environment Setup
1.  **Create Virtual Env:**
    ```powershell
    python -m venv venv
    .\venv\Scripts\activate
    ```
2.  **Install GPU Dependencies (The Heavy Stuff):**
    *This is the most important part.*
    ```powershell
    # Install PyTorch with CUDA support
    pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
    
    # Install AI Libraries
    pip install transformers accelerate bitsandbytes
    pip install faster-whisper
    pip install TTS
    ```
3.  **Install App Dependencies:**
    ```powershell
    pip install -r requirements.txt
    ```

### Step 4: The Config Switch
Open `server/config.py` in VS Code.
Change this line:
```python
# Change from "GROQ" or "MOCK" to "LOCAL"
AI_MODE = "LOCAL" 
```
*Note: We will need to write the `LocalService` code when we are there, but this is the switch.*

### Step 5: Launch!
1.  **Start Backend (Terminal 1):**
    ```powershell
    cd server
    python -m uvicorn main:app --reload
    ```
2.  **Start Frontend (Terminal 2):**
    ```powershell
    cd client
    npm run dev
    ```

### Troubleshooting (Friend's PC)
*   **"CUDA not found":** Run `nvidia-smi` in terminal to check if GPU is detected.
*   **"Out of Memory":** If the GPU has < 8GB VRAM, use a smaller model (e.g., `distil-whisper` or `TinyLlama`).

---
**Good Luck, Commander.** 🚔
