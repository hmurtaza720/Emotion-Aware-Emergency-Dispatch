# 🚑 DispatchAI: Intelligent Emergency Response System
**Final Year Project (FYP)**

> **One-Line Summary:** An AI-powered 911 operator that listens to calls, detects panic in the user's voice, and instantly updates a dashboard for human dispatchers.

---

## 📖 1. The Concept (For Non-Techies)
Imagine a 911 call center where the operator is an AI.
1.  **It Listens:** You speak naturally ("Help, there is a fire!").
2.  **It Feels:** It detects if you are **Calm** or **Panicking** by analyzing your voice tone (not just words).
3.  **It Acts:** It instantly puts the incident on a map for the police/fire department.

This project proves that we can run this powerful AI on a **standard student laptop** by using a "Hybrid Cloud" trick.

---

## ⚙️ 2. How It Works (The "Flow")
Here is the step-by-step journey of a single 911 call in our system:

### **Step 1: The Call (The "Ear")**
*   **User Action:** A user opens the **Phone App** on their laptop and clicks "Emergency Call".
*   **What Happens:** They speak. The browser records their voice.
*   **Technical:** The laptop captures 7 seconds of audio.

### **Step 2: The Transport (The "Tunnel")**
*   **Problem:** The powerful AI is too big to run on the laptop. It lives in the Google Cloud (Colab).
*   **Action:** The laptop sends the audio file through a secure **Cloudflare Tunnel** to our AI Server.

### **Step 3: The Brain (AI Processing)**
Once the audio reaches the Cloud Server, three things happen instantly:
1.  **Transcription (Whisper):** The AI converts the sound file into text.
    *   *Input:* Audio File -> *Output:* "My kitchen is on fire."
2.  **Emotion Analysis (OpenSMILE):** The AI measures the pitch and loudness.
    *   *Result:* "User is screaming -> Emotion: PANIC."
3.  **Response Generation (LLM):** The AI reads the text and decides what to say.
    *   *Logic:* It hears "Fire" -> It responds: "Stay calm, what is your address?"

### **Step 4: The Dispatch (The "dashboard")**
*   **The Bridge:** The Cloud Server sends the Data (Text + Emotion) back to the Laptop.
*   **Visual Update:** The **Live Dashboard** on the laptop screen instantly updates:
    *   A pin drops on the map.
    *   An "Emergency Card" appears (e.g., "House Fire - Critical").
    *   A "Panic Meter" goes up to 90%.

---

## 🏗️ 3. System Architecture
We use a **"Hybrid"** approach to make this free and fast.

| Component | Role | Where it Runs | Technology |
| :--- | :--- | :--- | :--- |
| **Frontend Phone** | The Caller Interface | Your Laptop | Next.js (React) |
| **Frontend Dashboard** | The 911 Center Map | Your Laptop | Next.js (React) |
| **Local Backend** | The Messenger | Your Laptop | Python FastAPI |
| **Remote Brain** | The Heavy AI | Google Colab (Cloud) | Whisper, Mistral |

---

## 🚀 4. How to Run It
Since this is a hybrid system, you must start **Three Parts** in order:

1.  **The Backend (Messenger):**
    *   Open Terminal -> `cd "FYP MAIN PROJECT/server"`
    *   Run: `python -m uvicorn main:app --reload`
2.  **The Frontend (Screens):**
    *   Open Terminal -> `cd "FYP MAIN PROJECT/client"`
    *   Run: `npm run dev`
3.  **The AI Brain (Cloud):**
    *   Open `DispatchAI_Colab_Server.ipynb` in Google Colab.
    *   Run All Cells.
    *   Copy the **Cloudflare URL** it gives you.
    *   Paste it into the **Settings** menu on the Phone App (`localhost:3000/phone`).

---
*Documentation generated for FYP Supervisor Review.*
