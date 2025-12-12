# Emotion-Aware 911 Dispatch System (FYP) 🚑

> **A Self-Hosted, Open-Source AI Emergency Response Platform.**
> *Replacing paid APIs with local intelligence.*

---

## 📖 About The Project
This is the Final Year Project (FYP) repository for the **Emotion-Aware Emergency Dispatch System**.
Unlike traditional AI dispatch systems that rely on expensive, privacy-invasive cloud APIs (like OpenAI or Twilio), this project is built to run **entirely on-premise** using open-source models.

### Key Features
*   **🧠 Local Intelligence:** Uses fine-tuned **Mistral-7B** (running locally via Peft/LoRA).
*   **🗣️ Voice Pipeline:** Real-time speech-to-text using **Faster-Whisper** and text-to-speech via **Mozilla TTS**.
*   **❤️ Emotion Detection:** Analyzes caller audio (tone/pitch) and text logic to detect Panic, Fear, or Distress.
*   **🖥️ Modern Dashboard:** A dark-mode, high-contrast Dispatcher Console built with **Next.js 14**.

---

## 🚀 Getting Started

### For Developers / Team Members
If you are a team member (Devi, etc.) and want to run the project on your laptop, please read the Onboarding Guide first.
👉 **[Read the TEAM ONBOARDING GUIDE](./TEAM_ONBOARDING.md)**
*(It explains how to run the project in "Laptop Mode" without a GPU)*

### For Supervisors / Jury
For a detailed technical breakdown of the System Architecture, Methodology, and Hardware Requirements:
👉 **[Read the TECHNICAL DOCUMENTATION](./PROJECT_DOCUMENTATION.md)**

---

## 🛠️ Tech Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14, TailwindCSS | The Dispatcher Dashboard UI |
| **Backend** | Python FastAPI, WebSockets | Orchestrates audio streams and logic |
| **LLM** | Mistral-7B (Fine-Tuned) | Generates empathetic, tactical responses |
| **STT/TTS** | Faster-Whisper / Coqui TTS | Handles Voice <-> Text conversion |
| **Emotion** | OpenSMILE + BERT | Detects emotional state of caller |

---

## 📅 Development Phases
- [x] **Phase 1: The Skeleton** (UI, Server, and Logic Core implemented)
- [ ] **Phase 2: Logic Layers** (Database & Mapping integration)
- [ ] **Phase 3: The "Brain Transplant"** (Moving to GPU hardware & real models)
- [ ] **Phase 4: Integration** (Final System Polish)

---
*Built by [Abdullah, Murtaza, Baqar, Tahir] - DHA Suffa University (FYP Session 2024-25)*
