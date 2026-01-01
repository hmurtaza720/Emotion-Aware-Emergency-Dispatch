# 🚀 DispatchAI Team Onboarding

## Welcome to the Team! 👋
We are building an **AI 911 Operator** using a "Hybrid Architecture".
This allows us to use state-of-the-art AI models (that usually cost $2000 in hardware) for **FREE** using Google Colab.

---

## 🏗 The Architecture
We don't run everything on one machine. We split it up:

| Component | Runs On | Tech Stack | Role |
| :--- | :--- | :--- | :--- |
| **Frontend** | 💻 Laptop (Local) | Next.js (React) | The "Phone" interface & "Dashboard" map. |
| **Backend** | 💻 Laptop (Local) | FastAPI (Python) | Relays messages between Phone and Dashboard. |
| **AI Brain** | ☁️ Google Colab | Python (GPU) | Runs Whisper, Mistral, and OpenSMILE. |

---

## ⚡ How to Run the Project (Daily Workflow)

You need to start **3 things** to make the system work.

### Step 1: Start the Local Backend 🐍
This is the bridge that connects everything.
```bash
cd "FYP MAIN PROJECT/server"
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*   *Check:* Open `http://localhost:8000` -> "Status: Online"

### Step 2: Start the Local Frontend ⚛️
This is the visual interface.
```bash
cd "FYP MAIN PROJECT/client"
npm run dev -- -p 3000 -H 0.0.0.0
```
*   *Check:* Open `http://localhost:3000` -> You should see the Dashboard.

### Step 3: Wake up the Brain 🧠
1.  Go to **Google Colab** and upload `DispatchAI_Colab_Server.ipynb`.
2.  **Runtime -> Run All**.
3.  Wait for the logs to say: **"🔗 CONNECT TO THIS URL: https://..."**
4.  Copy that URL.
5.  Go to your Laptop: `http://localhost:3000/phone`.
6.  Click **Settings (Gear Icon)** and paste the URL.

**🎉 You are now connected!**

---

## 🧪 Testing Checklist
1.  **Call 911:** Open the Phone page and click Call.
2.  **Speak:** Say "Help, there is a fire!" (Speak for ~7 seconds).
3.  **Watch:**
    *   The Phone should speak back.
    *   The **Dashboard (`/live`)** should update the Map and Transcript instantly.

---
*Questions? Ask the Lead Developer.*
