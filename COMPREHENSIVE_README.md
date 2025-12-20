# 🚔 Emotion-Aware Emergency Dispatch System (EAEDS)
## Complete Application Documentation

---

## 📋 Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Application Flow](#application-flow)
5. [Features & Functionality](#features--functionality)
6. [Component Breakdown](#component-breakdown)
7. [Installation & Setup](#installation--setup)
8. [Usage Guide](#usage-guide)
9. [API Documentation](#api-documentation)
10. [Database Schema](#database-schema)
11. [AI Engine Details](#ai-engine-details)
12. [Deployment Options](#deployment-options)

---

## Executive Summary

The **Emotion-Aware Emergency Dispatch System (EAEDS)** is an AI-powered 911 dispatch platform designed to address the critical shortage of emergency call center operators (82% understaffed globally). The system provides an autonomous first-responder layer that can:

- **Listen**: Convert speech to text using advanced STT models
- **Feel**: Detect caller emotions (Panic, Fear, Calm, Neutral) through acoustic analysis
- **Reason**: Use Large Language Models to follow 911 protocols and ask appropriate questions
- **Locate**: Extract and visualize emergency locations on an interactive map
- **Dispatch**: Provide real-time updates to human dispatchers through a command center dashboard

### Key Innovation: Hybrid Cloud Architecture

Unlike traditional solutions requiring expensive GPU hardware ($2000+), EAEDS uses a **hybrid architecture** that splits workload between:
- **Local Machine** (Laptop/Desktop): Runs the UI and orchestration backend
- **Cloud GPU** (Google Colab - FREE): Runs heavy AI models (Whisper, Mistral-7B, OpenSMILE)

This makes state-of-the-art AI accessible for emergency services with limited budgets.

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACES                          │
├──────────────────────┬──────────────────────────────────────────┤
│   📱 Phone UI        │        🖥️  Dispatcher Dashboard          │
│  (Emergency Caller)  │      (Live Command Center)               │
│  - Call 911 Button   │  - Real-time Map                         │
│  - Voice Recording   │  - Emotion Analytics                     │
│  - AI Responses      │  - Transcript Panel                      │
│  - Emotion Display   │  - Event Management                      │
└──────────┬───────────┴────────────┬─────────────────────────────┘
           │                        │
           │    WebSocket (Real-time Communication)
           │                        │
           ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND SERVER                        │
│                    (Orchestration Layer)                         │
├─────────────────────────────────────────────────────────────────┤
│  - WebSocket Manager (Bi-directional messaging)                 │
│  - Connection Manager (Multi-client support)                    │
│  - Database Manager (SQLite - Call logging)                     │
│  - AI Service Abstraction (Mock/Groq/Local modes)               │
└──────────┬──────────────────────────────────────────────────────┘
           │
           │ (Dependency Injection - Mode Selection)
           │
    ┌──────┴──────┬──────────────┬──────────────┐
    │             │              │              │
    ▼             ▼              ▼              ▼
┌────────┐  ┌─────────┐  ┌──────────┐  ┌──────────────┐
│ MOCK   │  │  GROQ   │  │  LOCAL   │  │ GOOGLE COLAB │
│ Service│  │ Service │  │ Service  │  │  (Hybrid)    │
├────────┤  ├─────────┤  ├──────────┤  ├──────────────┤
│CPU-only│  │Cloud API│  │Local GPU │  │Cloud GPU     │
│Dev Mode│  │Fast LLM │  │Self-host │  │FREE Tier     │
└────────┘  └─────────┘  └──────────┘  └──────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │  AI MODELS       │
                                    ├──────────────────┤
                                    │ - Whisper (STT)  │
                                    │ - Mistral-7B     │
                                    │ - OpenSMILE      │
                                    │ - TTS Engine     │
                                    └──────────────────┘
```

### Architecture Layers

#### 1. **Frontend Layer** (Next.js 14 - React)
- **Landing Page** (`/`): Marketing page with hero section, problem statement, and solution showcase
- **Phone Interface** (`/phone`): Emergency caller simulation with voice recording and AI interaction
- **Live Dashboard** (`/live`): Real-time command center for dispatchers

#### 2. **Backend Layer** (FastAPI - Python)
- **WebSocket Server**: Real-time bi-directional communication
- **AI Service Abstraction**: Pluggable AI backends (Mock, Groq, Local, Colab)
- **Database Manager**: SQLite for call logging and history
- **Configuration Manager**: Environment-based mode selection

#### 3. **AI Engine Layer** (Pluggable Architecture)
- **Mock Service**: CPU-only development mode with simulated responses
- **Groq Service**: Cloud-based LLM (Llama 3.3 70B) for fast inference
- **Local Service**: Self-hosted GPU inference (future implementation)
- **Colab Hybrid**: Google Colab GPU with Cloudflare tunnel

---

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14.2.35 | React framework with SSR and routing |
| **React** | 18.2.0 | UI component library |
| **TypeScript** | 5.1.6 | Type-safe JavaScript |
| **Tailwind CSS** | 3.3.5 | Utility-first CSS framework |
| **Shadcn UI** | Latest | Pre-built accessible components |
| **Leaflet.js** | 1.9.4 | Interactive map library (OpenStreetMap) |
| **Framer Motion** | 11.2.11 | Animation library |
| **Lucide React** | 0.396.0 | Icon library |

### Backend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **FastAPI** | 0.111.0 | High-performance async web framework |
| **Uvicorn** | 0.30.1 | ASGI server |
| **WebSockets** | 12.0 | Real-time communication |
| **Python Dotenv** | 1.0.1 | Environment variable management |
| **SQLite** | 3.x | Embedded database |

### AI/ML Technologies

| Technology | Purpose |
|-----------|---------|
| **Whisper** (OpenAI) | Speech-to-Text conversion |
| **Mistral-7B** | Large Language Model for dialogue |
| **Llama 3.3 70B** (via Groq) | Cloud-based LLM alternative |
| **OpenSMILE** | Acoustic emotion detection |
| **Groq API** | Fast cloud inference |

---

## Application Flow

### Complete User Journey: From Emergency Call to Resolution

#### **Phase 1: Emergency Call Initiation**

```
Step 1: Caller Opens Phone Interface
┌─────────────────────────────────────┐
│  Phone UI (/phone)                  │
│  - Shows "Emergency Dispatch" logo  │
│  - "CALL 911" green button          │
│  - Settings gear icon (top-right)   │
└─────────────────────────────────────┘
                 │
                 ▼
Step 2: Caller Clicks "CALL 911"
┌─────────────────────────────────────┐
│  Actions Triggered:                 │
│  1. Request microphone access       │
│  2. Connect WebSocket to backend    │
│  3. Start MediaRecorder             │
│  4. Display call timer (00:00)      │
│  5. Show "LISTENING..." status      │
└─────────────────────────────────────┘
```

#### **Phase 2: Voice Recording & Processing**

```
Step 3: Caller Speaks (7-second chunks)
┌─────────────────────────────────────┐
│  Recording Process:                 │
│  - MediaRecorder captures audio     │
│  - Auto-stop after 7 seconds        │
│  - Create audio blob (WAV format)   │
│  - Status: "PROCESSING..."          │
└─────────────────────────────────────┘
                 │
                 ▼
Step 4: Send Audio to AI Brain
┌─────────────────────────────────────┐
│  If MOCK Mode:                      │
│  → Send text to local backend       │
│                                     │
│  If GROQ Mode:                      │
│  → Send text to Groq API            │
│                                     │
│  If COLAB Mode:                     │
│  → Send audio blob to Colab URL     │
│  → Colab processes with Whisper     │
│  → Returns: transcript + emotion    │
└─────────────────────────────────────┘
```

#### **Phase 3: AI Processing & Response**

```
Step 5: AI Brain Processes Request
┌─────────────────────────────────────┐
│  AI Pipeline (Colab/Groq):          │
│  1. Speech-to-Text (Whisper)        │
│     "Help! There's a fire!"         │
│                                     │
│  2. Emotion Detection (OpenSMILE)   │
│     Acoustic features → "Fear"      │
│                                     │
│  3. LLM Response (Mistral-7B)       │
│     Protocol: Fire Emergency        │
│     Response: "I understand there   │
│     is a fire. Are you in a safe    │
│     place right now?"               │
│                                     │
│  4. Location Extraction (NLP)       │
│     Parse text for addresses        │
└─────────────────────────────────────┘
                 │
                 ▼
Step 6: Return Response to Phone
┌─────────────────────────────────────┐
│  Response Payload:                  │
│  {                                  │
│    "transcript": "Help! Fire!",     │
│    "response": "I understand...",   │
│    "acoustic_emotion": "Fear",      │
│    "location": [37.8199, -122.478]  │
│  }                                  │
└─────────────────────────────────────┘
```

#### **Phase 4: Real-time Dashboard Update**

```
Step 7: Phone Sends Update to Backend via WebSocket
┌─────────────────────────────────────┐
│  WebSocket Message:                 │
│  {                                  │
│    "event": "colab_update",         │
│    "transcript": "Help! Fire!",     │
│    "emotion": "Fear",               │
│    "ai_response": "I understand..." │
│  }                                  │
└─────────────────────────────────────┘
                 │
                 ▼
Step 8: Backend Broadcasts to Dashboard
┌─────────────────────────────────────┐
│  All Connected Clients Receive:     │
│  - Dispatcher Dashboard (/live)     │
│  - Any other monitoring screens     │
└─────────────────────────────────────┘
                 │
                 ▼
Step 9: Dashboard Updates in Real-time
┌─────────────────────────────────────┐
│  Dashboard Components Update:       │
│  1. Map: Pin added at location      │
│  2. Event Panel: New call appears   │
│  3. Transcript: Messages displayed  │
│  4. Emotion Card: Shows "Fear"      │
│  5. Details Panel: Call metadata    │
└─────────────────────────────────────┘
```

#### **Phase 5: Phone Speaks Response**

```
Step 10: Text-to-Speech (Browser TTS)
┌─────────────────────────────────────┐
│  Phone UI Actions:                  │
│  1. Status: "SPEAKING..."           │
│  2. SpeechSynthesis speaks response │
│  3. Display AI text in chat bubble  │
│  4. After speech ends:              │
│     → Loop back to Step 3           │
│     → Start new 7-second recording  │
└─────────────────────────────────────┘
```

#### **Phase 6: Call Resolution**

```
Step 11: Dispatcher Takes Action
┌─────────────────────────────────────┐
│  Dashboard Actions Available:       │
│  1. "Resolve" button → Mark done    │
│  2. "Transfer" button → Human agent │
│  3. View full transcript            │
│  4. See emotion analytics           │
│  5. Export call data                │
└─────────────────────────────────────┘
                 │
                 ▼
Step 12: Call Saved to Database
┌─────────────────────────────────────┐
│  When call ends (phone hangs up):   │
│  - Save transcript to SQLite        │
│  - Log emotion data                 │
│  - Record location                  │
│  - Generate unique call ID          │
│  - Timestamp: start & end times     │
└─────────────────────────────────────┘
```

---

## Features & Functionality

### 1. **Landing Page** (`/`)

**Purpose**: Marketing and information page

**Features**:
- Hero section with tagline: "The AI dispatcher eliminating 911 wait times"
- Problem statement: 82% of call centers understaffed
- Solution showcase with feature cards:
  - **Action**: Immediate AI response
  - **Communicate**: Real-time caller interaction
  - **Moderate**: Human-in-the-loop oversight
- Call-to-action buttons linking to `/live` dashboard
- Responsive design with fade-in animations

### 2. **Phone Interface** (`/phone`)

**Purpose**: Simulates emergency caller experience

**Features**:
- **iPhone-style UI**: Rounded corners, dynamic island, realistic phone design
- **Call Button**: Large green "CALL 911" button to initiate
- **Live Timer**: Shows call duration (MM:SS format)
- **Status Indicators**:
  - IDLE: Disconnected
  - LISTENING: Recording audio
  - PROCESSING: Sending to AI
  - SPEAKING: AI responding
- **Emotion Display**: Visual badge showing detected emotion (Panic/Fear/Calm/Neutral)
- **Transcript View**: Shows user input and AI responses in chat format
- **Settings Dialog**: Configure Colab/Pinggy tunnel URL
- **Debug Panel**: Real-time logs for troubleshooting
- **Test Connection**: Ping button to verify AI brain connectivity

**Technical Details**:
- Uses `MediaRecorder` API for audio capture
- Records in 7-second chunks
- Sends audio as `FormData` with WAV blob
- WebSocket connection to backend for dashboard updates
- Browser `SpeechSynthesis` for TTS playback
- Auto-loops: Listen → Process → Speak → Repeat

### 3. **Live Dashboard** (`/live`)

**Purpose**: Real-time command center for dispatchers

**Components**:

#### A. **Header**
- Connection status indicator (green = connected, red = disconnected)
- City selector dropdown (San Francisco, Berkeley, Oakland)
- Logo and branding

#### B. **Event Panel** (Left Sidebar)
- Lists all active emergency calls
- Color-coded severity:
  - 🔴 CRITICAL (red)
  - 🟡 MODERATE (yellow)
  - 🟢 RESOLVED (green)
- Shows:
  - Call title
  - Caller name
  - Location
  - Time received
  - Emergency type (Police/Fire/Medical)
- Click to select and view details

#### C. **Interactive Map** (Center)
- OpenStreetMap via Leaflet.js
- Pins for each emergency location
- Click pin to see popup with call details
- Auto-centers on selected call
- City-based filtering (changes map center)

#### D. **Details Panel** (Right - when call selected)
- **Call Metadata**:
  - Call ID
  - Severity badge
  - Emergency type
  - Time received
  - Caller name & phone
- **Location Info**:
  - Full address
  - Coordinates
  - Street view image (if available)
- **Emotion Analytics**:
  - Primary emotion with intensity bar
  - Secondary emotion
  - Visual emotion icon
- **AI Recommendation**:
  - Suggested action (e.g., "Send emergency services immediately")
- **Action Buttons**:
  - "Resolve" → Mark call as handled
  - "Transfer" → Send to human agent

#### E. **Transcript Panel** (Far Right - when call selected)
- Full conversation history
- User messages (gray bubbles)
- AI responses (blue bubbles)
- Timestamps
- Scroll to view full transcript
- "Transfer to Human Agent" button

**Real-time Features**:
- WebSocket connection for live updates
- Auto-selects new incoming calls
- Updates map pins dynamically
- Emotion analytics refresh in real-time
- No page refresh needed

### 4. **AI Service Modes**

#### **MOCK Mode** (Development)
- **Purpose**: CPU-only development without GPU
- **Features**:
  - Simulated AI responses based on keywords
  - "fire" → Fire emergency protocol
  - "hurt"/"blood" → Medical protocol
  - Random emotion assignment
  - Mock location extraction
- **Latency**: 1.5 second artificial delay
- **Use Case**: Local development, testing UI

#### **GROQ Mode** (Cloud LLM)
- **Purpose**: Fast cloud-based AI without local GPU
- **Features**:
  - Uses Groq API with Llama 3.3 70B model
  - Ultra-fast inference (<1 second)
  - Text-based emotion classification
  - Requires API key in `.env.local`
- **Limitations**: No speech-to-text, no acoustic emotion
- **Use Case**: Production-ready without GPU hardware

#### **COLAB Mode** (Hybrid Cloud)
- **Purpose**: Full AI pipeline with free GPU
- **Features**:
  - Whisper for speech-to-text
  - Mistral-7B for dialogue
  - OpenSMILE for acoustic emotion
  - Runs on Google Colab T4 GPU (FREE)
  - Cloudflare/Pinggy tunnel for public URL
- **Setup**: Upload Jupyter notebook to Colab, run all cells
- **Use Case**: Full-featured demo, production alternative

---

## Component Breakdown

### Backend Components

#### 1. **main.py** (FastAPI Application)
```python
Key Endpoints:
- GET  /              → Health check
- GET  /calls         → Retrieve call history
- WebSocket /ws/call  → Real-time communication

WebSocket Events:
- "get_db"           → Request call history
- "colab_update"     → Hybrid mode update from phone
- "ai_response"      → AI response to broadcast
```

#### 2. **config.py** (Configuration Manager)
```python
Environment Variables:
- AI_MODE           → "MOCK" | "GROQ" | "LOCAL"
- GROQ_API_KEY      → API key for Groq service

Loads from:
- .env              → Default config
- .env.local        → Local overrides
```

#### 3. **database/db_manager.py** (SQLite Manager)
```python
Database Schema:
Table: calls
- id (TEXT PRIMARY KEY)
- started_at (DATETIME)
- ended_at (DATETIME)
- caller_location (TEXT)
- detected_emotion (TEXT)
- transcript (TEXT - JSON)
- duration_seconds (INTEGER)

Methods:
- save_call()        → Store completed call
- get_recent_calls() → Fetch last 10 calls
```

#### 4. **ai_engine/base.py** (Abstract Interface)
```python
Abstract Methods:
- process_text()     → Generate AI response
- detect_emotion()   → Classify emotion
- detect_location()  → Extract coordinates
```

#### 5. **ai_engine/mock_service.py**
```python
Mock Responses:
- Keyword-based logic
- Random emotion selection
- Hardcoded location (Golden Gate Bridge)
```

#### 6. **ai_engine/groq_service.py**
```python
Groq Integration:
- Model: llama-3.3-70b-versatile
- Temperature: 0.5 (balanced creativity)
- Max tokens: 100 (concise responses)
- System prompt: "Empathetic 911 dispatcher"
```

### Frontend Components

#### 1. **app/page.tsx** (Landing Page)
- Hero section with CTA
- Problem/solution showcase
- Feature cards with images
- Navigation to `/live`

#### 2. **app/phone/page.tsx** (Phone Interface)
- State management for call status
- Audio recording logic
- WebSocket connection
- TTS integration
- Settings dialog

#### 3. **app/live/page.tsx** (Dashboard)
- WebSocket connection
- State management for calls
- City filtering logic
- Call selection handling

#### 4. **components/live/Header.tsx**
- Connection indicator
- City dropdown
- Logo display

#### 5. **components/live/EventPanel.tsx**
- Call list rendering
- Severity color coding
- Selection handling
- Scroll area

#### 6. **components/live/DetailsPanel.tsx**
- Call metadata display
- Emotion analytics
- Location information
- Action buttons

#### 7. **components/live/TranscriptPanel.tsx**
- Message list rendering
- User/AI message styling
- Transfer button

#### 8. **components/live/map/Map.tsx**
- Leaflet map initialization
- Pin rendering
- Popup handling
- Center updates

---

## Installation & Setup

### Prerequisites
- **Node.js**: v18+ (v24.11.0 recommended)
- **npm**: v9+ (v11.6.1 recommended)
- **Python**: 3.10-3.13 (3.13.7 recommended)
- **pip**: Latest version

### Step 1: Clone Repository
```bash
git clone https://github.com/hmurtaza720/Emotion-Aware-Emergency-Dispatch.git
cd Emotion-Aware-Emergency-Dispatch
```

### Step 2: Backend Setup
```bash
cd server

# Create virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip3 install -r requirements.txt

# Create .env.local file
echo "AI_MODE=MOCK" > .env.local
# For Groq mode, add: GROQ_API_KEY=your_api_key_here
```

### Step 3: Frontend Setup
```bash
cd ../client

# Install dependencies
npm install --legacy-peer-deps

# Note: --legacy-peer-deps resolves react-fade-in version conflict
```

### Step 4: Run Application

**Terminal 1 - Backend:**
```bash
cd server
PYTHONPATH=/Users/YOUR_USERNAME/path/to/Emotion-Aware-Emergency-Dispatch python3 -m uvicorn server.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

**Access Points:**
- Landing Page: http://localhost:3000
- Phone Interface: http://localhost:3000/phone
- Live Dashboard: http://localhost:3000/live
- Backend API: http://127.0.0.1:8000
- API Docs: http://127.0.0.1:8000/docs

### Step 5: (Optional) Setup Google Colab Brain

1. Open `EAEDS_AI_Colab_Server.ipynb` in Google Colab
2. Runtime → Run All
3. Wait for Cloudflare/Pinggy tunnel URL
4. Copy URL (e.g., `https://abc123.trycloudflare.com`)
5. Go to http://localhost:3000/phone
6. Click Settings (gear icon)
7. Paste URL and save
8. Test connection with "Test Ping" button

---

## Usage Guide

### For Emergency Callers (Phone Interface)

1. **Open Phone**: Navigate to http://localhost:3000/phone
2. **Configure AI** (first time):
   - Click Settings icon (top-right)
   - Paste Colab tunnel URL
   - Click outside to save
3. **Make Call**:
   - Click green "CALL 911" button
   - Allow microphone access
   - Speak clearly for 7 seconds
   - Wait for AI response
   - Continue conversation
4. **End Call**: Click red phone icon

### For Dispatchers (Dashboard)

1. **Open Dashboard**: Navigate to http://localhost:3000/live
2. **Monitor Calls**:
   - View all active calls in left panel
   - Click call to see details
   - Map auto-centers on selected call
3. **Analyze Emotion**:
   - Check emotion card in details panel
   - View intensity bars
4. **Read Transcript**:
   - Full conversation in right panel
   - Scroll to see history
5. **Take Action**:
   - Click "Resolve" to mark handled
   - Click "Transfer" to send to human agent
6. **Filter by City**:
   - Use dropdown (top-right)
   - Map and calls update automatically

---

## API Documentation

### REST Endpoints

#### GET `/`
**Description**: Health check endpoint

**Response**:
```json
{
  "status": "online",
  "mode": "mock_cpu",
  "message": "System is ready for development."
}
```

#### GET `/calls`
**Description**: Retrieve recent call history

**Response**:
```json
[
  {
    "id": "uuid-string",
    "started_at": "2024-01-15T10:30:00",
    "ended_at": "2024-01-15T10:35:00",
    "caller_location": "123 Main St",
    "detected_emotion": "Fear",
    "transcript": "[{\"role\":\"user\",\"content\":\"Help!\"}]",
    "duration_seconds": 300
  }
]
```

### WebSocket Protocol

#### Connection
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/call');
```

#### Client → Server Messages

**Get Database**:
```json
{
  "event": "get_db"
}
```

**Colab Update** (from Phone):
```json
{
  "event": "colab_update",
  "transcript": "Help! There's a fire!",
  "emotion": "Fear",
  "ai_response": "I understand there is a fire..."
}
```

**Text Input** (Mock/Groq mode):
```json
{
  "text": "Help! There's a fire!"
}
```

#### Server → Client Messages

**AI Response**:
```json
{
  "event": "ai_response",
  "user_text": "Help! Fire!",
  "text": "I understand there is a fire. Are you safe?",
  "emotion": "Fear",
  "location": [37.8199, -122.4783]
}
```

---

## Database Schema

### Table: `calls`

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PRIMARY KEY | Unique UUID for call |
| `started_at` | DATETIME | Call start timestamp |
| `ended_at` | DATETIME | Call end timestamp |
| `caller_location` | TEXT | Address or coordinates |
| `detected_emotion` | TEXT | Primary emotion (Fear/Panic/Calm/Neutral) |
| `transcript` | TEXT | JSON array of messages |
| `duration_seconds` | INTEGER | Call length in seconds |

### Transcript JSON Format
```json
[
  {
    "role": "user",
    "content": "Help! There's a fire!",
    "timestamp": "2024-01-15T10:30:15"
  },
  {
    "role": "ai",
    "content": "I understand. Are you in a safe place?",
    "timestamp": "2024-01-15T10:30:18"
  }
]
```

---

## AI Engine Details

### Mock Service (Development Mode)

**Keyword-based Responses**:
- `"fire"` → "I understand there is a fire. Are you in a safe place right now?"
- `"hurt"` or `"blood"` → "I am sending medical help. Apply pressure to the wound if possible."
- `"hello"` or `"hi"` → "9-1-1, what is your emergency?"
- Default → "9-1-1, I'm here. Can you tell me your location?"

**Emotion Logic**:
- `"fire"`, `"help"`, `"blood"` → "Fear"
- `"calm"` → "Calm"
- Random selection from: Neutral, Panic, Fear, Calm

**Location**:
- `"fire"` → Golden Gate Bridge coordinates [37.8199, -122.4783]
- Otherwise → None

### Groq Service (Cloud LLM)

**Model**: Llama 3.3 70B Versatile

**System Prompt**:
```
You are an empathetic 911 dispatcher. Your goal is to extract location 
and emotion while keeping the caller calm. Keep responses short and reassuring.
```

**Parameters**:
- Temperature: 0.5 (balanced)
- Max Tokens: 100 (concise)

**Emotion Classification Prompt**:
```
Classify the emotion of this text into ONE word 
(Fear, Panic, Calm, Neutral, Anger). Text: '{user_text}'
```

### Colab Hybrid Service

**AI Pipeline**:
1. **Whisper** (faster-whisper): Audio → Text
2. **Mistral-7B**: Text → AI Response
3. **OpenSMILE**: Audio → Acoustic Emotion
4. **TTS** (optional): Text → Speech

**Tunnel Setup**:
- Cloudflare Tunnel or Pinggy
- Public HTTPS URL
- Endpoint: `/process_emergency`

**Request Format**:
```
POST /process_emergency
Content-Type: multipart/form-data

audio: <WAV blob>
```

**Response Format**:
```json
{
  "transcript": "Help! There's a fire!",
  "response": "I understand there is a fire...",
  "acoustic_emotion": "Fear"
}
```

---

## Deployment Options

### Option 1: Local Development (Current)
- **Backend**: http://127.0.0.1:8000
- **Frontend**: http://localhost:3000
- **AI**: MOCK mode (no GPU needed)

### Option 2: Cloud LLM (Groq)
- **Backend**: Same as local
- **Frontend**: Same as local
- **AI**: Groq API (requires API key)
- **Cost**: Free tier available

### Option 3: Hybrid Cloud (Colab)
- **Backend**: Same as local
- **Frontend**: Same as local
- **AI**: Google Colab T4 GPU (FREE)
- **Tunnel**: Cloudflare/Pinggy

### Option 4: Full Self-Hosted (GPU Required)
- **Backend**: Deploy on server with GPU
- **Frontend**: Deploy on Vercel/Netlify
- **AI**: Local GPU inference
- **Requirements**: NVIDIA GPU (8GB+ VRAM), CUDA 12.1

### Option 5: Production Deployment
- **Backend**: AWS EC2 / Google Cloud with GPU
- **Frontend**: Vercel / Netlify
- **Database**: PostgreSQL (migrate from SQLite)
- **AI**: Dedicated GPU instance
- **Monitoring**: Sentry, DataDog

---

## Troubleshooting

### Common Issues

**1. Backend Import Error: "No module named 'server'"**
- **Solution**: Set PYTHONPATH to project root
```bash
PYTHONPATH=/path/to/Emotion-Aware-Emergency-Dispatch python3 -m uvicorn server.main:app --reload
```

**2. Frontend npm install fails**
- **Solution**: Use `--legacy-peer-deps` flag
```bash
npm install --legacy-peer-deps
```

**3. WebSocket connection fails**
- **Check**: Backend is running on port 8000
- **Check**: No firewall blocking WebSocket
- **Solution**: Verify `ws://localhost:8000/ws/call` is accessible

**4. Colab tunnel not working**
- **Check**: Colab notebook is running
- **Check**: Tunnel URL is correct (starts with https://)
- **Solution**: Click "Test Ping" button in phone settings

**5. Microphone not working**
- **Check**: Browser has microphone permission
- **Check**: Using HTTPS or localhost (required for mic access)
- **Solution**: Allow microphone in browser settings

---

## Future Enhancements

### Planned Features
- [ ] Multi-language support (Spanish, Mandarin, etc.)
- [ ] Advanced emotion analytics dashboard
- [ ] Call recording and playback
- [ ] Integration with CAD (Computer-Aided Dispatch) systems
- [ ] SMS/text-based emergency reporting
- [ ] Mobile app (React Native)
- [ ] Advanced location detection (GPS, cell tower triangulation)
- [ ] Automatic unit dispatch based on AI assessment
- [ ] Historical analytics and reporting
- [ ] Role-based access control (dispatcher, supervisor, admin)

### Technical Improvements
- [ ] Migrate to PostgreSQL for production
- [ ] Add Redis for caching and session management
- [ ] Implement JWT authentication
- [ ] Add comprehensive test suite (Jest, Pytest)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Docker containerization
- [ ] Kubernetes orchestration
- [ ] Load balancing for high traffic
- [ ] CDN for static assets
- [ ] Monitoring and alerting (Prometheus, Grafana)

---

## License
MIT License - See LICENSE file for details

## Contributors
- Hassan Murtaza - Lead Developer
- [Team Members] - Contributors

## Support
For issues, questions, or contributions:
- GitHub Issues: https://github.com/hmurtaza720/Emotion-Aware-Emergency-Dispatch/issues
- Email: [Your Email]

---

**Last Updated**: December 2024
**Version**: 1.0.0
