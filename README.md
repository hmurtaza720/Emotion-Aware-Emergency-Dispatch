# 🚨 Emotion-Aware Emergency Dispatch System  
### AI-Powered Emergency Response Assistance  
**DHA Suffa University — Final Year Project**

---

## 👥 Team Members
- **Abdullah Shaikh** (DS221042) — Team Lead  
- **Murtaza Hassan** (DS221026)  
- **Muhammad Baqar** (DS221043)  
- **Tahir Mehdi** (DS221011)

**Supervisor:** Miss Shella  
**Co-Supervisor:** Mashal Tariq  

---

# 📌 Project Overview

The **Emotion-Aware Emergency Dispatch System** is an AI-powered solution designed to support emergency helplines (like 911).  
It analyzes **live voice calls & text**, detects emotions, and provides **real-time intelligent recommendations** to human dispatchers.

This system **does not replace operators** — it assists them by improving speed, accuracy, and decision-making under heavy workload.

---

# 🎯 1. Introduction

- Converts **live emergency voice calls** into real-time text using speech recognition (Whisper).  
- Detects caller’s **emotional state** using both **voice & text analysis**.  
- Generates **appropriate response suggestions** using a fine-tuned LLM (Mistral).  
- Helps solve the problem of **overloaded emergency response centers** with too many calls and too few operators.  
- Fully AI-assisted system designed to support human workflow.

---

# ❗ 2. Problem Statement

Emergency dispatch centers face major challenges:

- Overload during crises  
- Limited human operators  
- High call volumes  
- Delayed decision-making  
- Reduced effectiveness of emergency response  

**Keywords:** AI, Automation, Smart Dispatch, Real-Time Prediction, Emergency Response

---

# 📘 3. Project Scope

### ✔ Scope Includes
- Real-time speech-to-text conversion (**Whisper**)  
- Multimodal emotion detection:  
  - **Text-based:** BERT  
  - **Voice-based:** OpenSMILE  
- AI-driven response generation using **fine-tuned Mistral LLM**  
- Dispatcher dashboard  
  - Live transcript  
  - Map view  
  - Alerts & chat  
- 100% Open-source implementation  
- No paid APIs  

### ✖ Scope Excludes
- Real ambulance dispatch  
- Integration with official 911/15 systems  
- Multilingual support  
- Government-controlled system integrations  

---

# 🛠 4. Project Methodology (Agile)

We adopted **Agile methodology** for iterative development and testing.

### Project Modules
1. Speech Transcription  
2. Emotion Detection (Audio + Text)  
3. LLM Response Engine  
4. Frontend Dashboard  
5. Backend APIs & Integrations  

### Team Roles
- **Abdullah Shaikh:** LLM & BERT Fine-Tuning  
- **Murtaza Hassan:** Backend (FastAPI), API Development  
- **Muhammad Baqar:** Frontend Dashboard (React/Next.js)  
- **Tahir Mehdi:** Voice Pipeline, Whisper, TTS  

---

# 📅 5. Tentative Project Timeline

| Phase | Weeks | Key Activities |
|-------|--------|----------------|
| **1. Planning & Setup** | 1–5 | Tool research, requirements gathering, dataset review |
| **2. Data & Preprocessing** | 6–11 | Collect 911 audio/text, preprocess for Whisper & OpenSMILE |
| **3. Speech & Emotion Modules** | 12–17 | Whisper STT, BERT text emotion, OpenSMILE audio emotion |
| **4. LLM Fine-Tuning** | 18–22 | Fine-tune Mistral using Intel DevCloud |
| **5. Dashboard & Integration** | 23–27 | Build UI, map integration, connect AI modules |
| **6. Testing & Finalization** | 28–30 | System testing, feedback, report writing & defense prep |

---

# 🧰 6. Tools & Technologies

### Programming
- Python  
- JavaScript  

### AI / ML
- Hugging Face Transformers  
- BERT / DistilBERT  
- OpenSMILE  
- Faster-Whisper  

### Frontend
- React  
- Next.js  
- Tailwind CSS  

### Backend
- FastAPI  

### Datasets
- RAVDESS  
- GoEmotions  
- 911 Emergency Calls  

### Other Tools
- Leaflet.js (Maps)  
- Mozilla TTS  
- Asterisk (Live calling)  
- Intel DevCloud (Compute resources)  

---

# 📦 7. FYP Deliverables

- Whisper Speech-to-Text Module  
- Emotion Detection Engine (BERT + OpenSMILE)  
- Fine-Tuned Emergency LLM  
- Dispatcher Dashboard (UI + Map + Transcript)  
- Dataset Documentation  
- Final Project Report  
- Complete Code Repository  

---

# 📚 8. References

- Reddy, S., & Kompalli, S. (2022). *Emotion Detection using Multimodal Analysis*. Journal of AI & Ethics.  
- Rajput, D., & Singh, H. (2023). *BERT for Emotion Classification*. Procedia Computer Science.  
- Huang, J., et al. (2020). *Whisper and ASR Systems*. arXiv preprint.  
- OpenSMILE Documentation — AudEERING GmbH (2020).  

---

# ⭐ Support  
If you like this project, give the repo a ⭐ to support our work!
