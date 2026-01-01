# Emotion-Aware Emergency Dispatch System
**Final Year Project Documentation**

---

## 1. Project Abstract
The **Emotion-Aware Emergency Dispatch System** is an AI-powered platform designed to augment 911 operations. It addresses the critical issue of call center understaffing (82% global shortage) by providing an automated first-responder layer. The system utilizes **Large Language Models (LLMs)** for decision support, **Speech-to-Text (STT)** for transcription, and **Audio Analysis** for emotion detection (panic, fear, neutral). Unlike commercial solutions relying on paid cloud APIs, this project is architected as a fully **Self-Hosted, Open-Source** solution ensuring data privacy and operational autonomy.

---

## 2. System Architecture

### 2.1 High-Level Overview
The system follows a microservices-based architecture decoupled into three primary layers:
1.  **Frontend Interface (The Dispatcher Consoles)**
2.  **Orchestator Backend (The API Layer)**
3.  **AI Engine (The Inference Layer)**

### 2.2 Tech Stack
| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14 (React)** | Server-Side Rendering for dashboard performance; Real-time WebSocket capabilities. |
| **Backend** | **FastAPI (Python)** | High-performance async support critical for handling audio streams. |
| **LLM Inference** | **Mistral-7B (Peft/LoRA)** | Efficient open-source model capable of running on consumer GPUs; Fine-tuned for emergency dialogue. |
| **Speech-to-Text** | **Faster-Whisper** | State-of-the-art accuracy with optimized inference speed. |
| **Emotion Engine** | **BERT + OpenSMILE** | Multimodal analysis (Text Sentiment + Audio Prosody). |

---

## 3. Methodology

### 3.1 The Hybrid Development Approach
To mitigate hardware constraints during the development lifecycle, the project utilizes a **Mock-Service Abstraction Pattern**:
*   **Development Environment (CPU):** The system core (UI, Websockets, Database) is developed using a `MockAIService`. This service emulates the latency and data structure of the real AI models without requiring GPU resources, enabling parallel development.
*   **Production Environment (GPU):** The same interface is implemented by `RealAIService`, which loads the Mistral and Whisper models. Switching between modes is handled via dependency injection based on hardware availability.

### 3.2 Implementation Phases
1.  **Phase I: Core Skeleton (Completed)**
    *   Establishment of bi-directional WebSocket communication.
    *   Implementation of the Dispatcher Dashboard UI.
    *   Integration of the Mock Inference Engine for logic validation.
2.  **Phase II: Data Persistence & Mapping (In Progress)**
    *   Integration of Leaflet.js for OpenStreetMap support (No Google Maps API).
    *   SQLite schema design for call logging and audit trails.
3.  **Phase III: Model Integration**
    *   Deployment of the Fine-Tuned Mistral 7B Adapter.
    *   Integration of the Local Audio Pipeline (Whisper + TTS).

---

## 4. Hardware Requirements
*   **Minimum Specs:** NVIDIA GPU (8GB+ VRAM), 16GB RAM.
*   **Target Environment:** Intel DevCloud or Local Workstation with CUDA support.

## 5. Deliverables
*   Fully functional 911 Dispatch Dashboard.
*   Self-hosted AI Model capable of handling voice conversations.
*   Real-time emotion analysis visualization.
