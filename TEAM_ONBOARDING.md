# DispatchAI Team Onboarding Guide 🚀

## Welcome aboard!
This guide explains how we are building the **Emotion-Aware Emergency Dispatch System (FYP)**. 
We are building a local, open-source version of 911 DispatchAI using **Mistral-7B**, **Whisper**, and **Mozilla TTS**.

---

## 🏗 The "Hybrid" Strategy (Read This First!)
Our biggest constraint is **Hardware**. The AI models (Mistral) need a GPU, but our laptops are CPU-only.
To solve this, we split development into two modes:

### 1. Laptop Mode (Current Phase) 💻
*   **What we do:** Build the UI (Dashboard), Server Logic, Database, and Maps.
*   **The AI:** We use a **"Mock AI"**. It's a fake script that *pretends* to clearly understand "Fire" or "Injury" so we can test the frontend without crashing our laptops.
*   **Files:** `server/ai_engine/mock_service.py`

### 2. GPU Mode (The "Brain Transplant") 🖥
*   **What we do:** We move the code to the High-Spec PC (Friend's House).
*   **The AI:** We replace `MockAIService` with `RealAIService` which loads the 15GB Mistral Model.
*   **Files:** `server/ai_engine/real_service.py` (To be created)

---

## 📂 Project Structure
```text
FYP MAIN PROJECT/
├── client/                 # The Frontend (Next.js 14)
│   ├── src/app/page.tsx    # The Main Dashboard UI
│   └── ...
├── server/                 # The Backend (Python FastAPI)
│   ├── main.py             # Connects Frontend <-> Backend
│   ├── ai_engine/          
│   │   └── mock_service.py # The "Fake Brain" (Logic lives here for now)
│   └── ...
```

---

---

## ⚡ How to Run the Project
You need **two terminal windows** open at the same time.

**Terminal 1: The Backend (Python)**
```bash
cd "FYP MAIN PROJECT"
python -m uvicorn server.main:app --reload --port 8000
```
*   *Verification:* Open `http://localhost:8000/` and see `{"status": "online"}`.

**Terminal 2: The Frontend (Next.js)**
```bash
cd "FYP MAIN PROJECT/client"
npm run dev -- -p 3000
```
*   *Verification:* Open `http://localhost:3000/`. You should see the black Dashboard.

## 🛠 Useful Commands
**Test the Database & Map Logic:**
```bash
python test_db.py
```
*(Runs a simulation to verify data is saving to `calls.db`)*

---

## 🧪 How to Test functions
Since we are in **Laptop Mode**, use these keywords in the chat to trigger specific behaviors:

1.  **"Hello"** -> AI asks for emergency.
2.  **"Fire"** -> AI gives fire safety instructions.
3.  **"Hurt" or "Blood"** -> AI gives medical instructions.

*(Note: The Emotion Gauge changes randomly for testing purposes right now)*
