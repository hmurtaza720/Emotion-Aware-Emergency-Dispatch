from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from server.database.db_manager import DatabaseManager
from datetime import datetime
import json
from server.config import AI_MODE

# Initialize App
app = FastAPI(title="DispatchAI (FYP Edition)")

# CORS (Allow Frontend to talk to Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Brain (Dynamic Loading)
print(f" [System] Booting in {AI_MODE} mode...")
ai_engine = None

if AI_MODE == "GROQ":
    # Debugging: Check if key is actually loaded
    from server.config import GROQ_API_KEY
    print(f" [Debug] GROQ_API_KEY Linked: {'YES' if GROQ_API_KEY else 'NO'}")
    
    # REMOVED TRY-EXCEPT TO SEE ACTUAL ERROR
    from server.ai_engine.groq_service import GroqService
    ai_engine = GroqService()
else:
    from server.ai_engine.mock_service import MockAIService
    ai_engine = MockAIService()
# Initialize Database
db = DatabaseManager()

@app.get("/")
def health_check():
    return {"status": "online", "mode": "mock_cpu", "message": "System is ready for development."}

@app.get("/calls")
def get_history():
    return db.get_recent_calls()

@app.get("/lookup/{number}")
def lookup_location(number: str):
    # Mock Lookup Logic for Demo
    area_code = number[:3]
    if area_code == "415": return {"city": "San Francisco", "state": "CA"}
    if area_code == "212": return {"city": "New York", "state": "NY"}
    if area_code == "312": return {"city": "Chicago", "state": "IL"}
    if area_code == "512": return {"city": "Austin", "state": "TX"}
    return {"city": "Unknown", "state": "USA"}

# Connection Manager for Broadcasting
class ConnectionManager:
    # ... (existing init/connect/disconnect)
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str, exclude: WebSocket = None):
        for connection in self.active_connections:
            if connection != exclude:
                await connection.send_text(message)

manager = ConnectionManager()
# ... (existing WS endpoint)
@app.websocket("/ws/call")
async def websocket_endpoint(websocket: WebSocket):
    # ...
    # Session Data
    transcript = []
    current_emotion = "Neutral"
    current_location = "Unknown"
    is_manual_mode = False
    
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # --- PHASE 2.0: START CALL LOGIC ---
            if message_data.get("event") == "start_call":
                phone = message_data.get("phone")
                loc_manual = message_data.get("location_manual")
                
                print(f" [Server] Incoming Call: {phone} from {loc_manual}")
                
                # Broadcast 'incoming_call' to Dashboard
                # This ensures the dashboard explicitly handles it as a new session
                await manager.broadcast(json.dumps({
                    "event": "incoming_call",
                    "phone": phone,
                    "location_manual": loc_manual,
                    "timestamp": str(datetime.now())
                }))
                
                # Also send an initial AI greeting to the phone (optional, but good for feedback)
                # await websocket.send_text(...) 
                continue

            # --- TRANSFER TO HUMAN / AUDIO RELAY LOGIC ---
            # ...
            
            # 1. Toggle Manual Mode
            if message_data.get("event") == "manual_mode_toggle":
                is_manual_mode = message_data.get("active", False)
                print(f" [Server] Manual Mode: {is_manual_mode}")
                # Broadcast state change so all clients (User & Operator) know the state
                await manager.broadcast(json.dumps({
                    "event": "system_update", 
                    "manual_mode": is_manual_mode
                }))
                continue

            # 2. Audio Relay (Pure Bridge)
            # If we receive an audio chunk, just broadcast it to everyone else
            if message_data.get("event") == "audio_relay":
                if is_manual_mode:
                    await manager.broadcast(data, exclude=websocket)
                continue
                
            # --- AI PROCESSING ---

            # If in manual mode, SKIP all AI processing
            if is_manual_mode:
                continue

            user_input = message_data.get("text", "")
            
            # If it's a "ping" or "get_db" event, just ignore or handle separately
            if message_data.get("event") == "get_db":
                continue

            # HANDLE COLAB HYBRID UPDATES
            if message_data.get("event") == "colab_update":
                # Remap fields for Dashboard
                dashboard_payload = {
                    "event": "ai_response",
                    "user_text": message_data.get("transcript", ""),
                    "text": message_data.get("ai_response", ""),
                    "emotion": message_data.get("emotion", "Neutral"),
                    "location": None # Colab doesn't do location yet
                }
                print(f" [Server] Broadcasting Colab Update: {dashboard_payload['emotion']}")
                await manager.broadcast(json.dumps(dashboard_payload))
                continue

            if not user_input:
                continue
                
            # Log User Input
            transcript.append({"role": "user", "content": user_input, "timestamp": str(datetime.now())})

            # 1. Ask the AI Brain
            ai_response = await ai_engine.process_text(user_input)
            
            # Log AI Response
            transcript.append({"role": "ai", "content": ai_response, "timestamp": str(datetime.now())})

            # 2. Check Emotion (Mock)
            current_emotion = await ai_engine.detect_emotion(user_input)
            
            # 3. Check Location (Mock)
            coords = await ai_engine.detect_location(user_input)
            if coords:
                current_location = str(coords)
            
            # 4. Broadcast to ALL Clients (Phone + Dashboard)
            response_payload = {
                "event": "ai_response",
                "user_text": user_input,
                "text": ai_response,
                "emotion": current_emotion,
                "location": coords
            }
            await manager.broadcast(json.dumps(response_payload))
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(" [Server] Client disconnected. Saving call to DB...")
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from server.database import models
from server.database.database import get_db
from pydantic import BaseModel

# Pydantic Model for Settings Update
class SettingsUpdate(BaseModel):
    theme: str
    notifications_enabled: bool
    auto_connect: bool
    default_state: str
    mic_sensitivity: int
    speaker_volume: int

@app.get("/settings/{user_id}")
def get_settings(user_id: int, db: Session = Depends(get_db)):
    settings = db.query(models.UserSettings).filter(models.UserSettings.user_id == user_id).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return settings

@app.put("/settings/{user_id}")
def update_settings(user_id: int, settings_update: SettingsUpdate, db: Session = Depends(get_db)):
    settings = db.query(models.UserSettings).filter(models.UserSettings.user_id == user_id).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    settings.theme = settings_update.theme
    settings.notifications_enabled = settings_update.notifications_enabled
    settings.auto_connect = settings_update.auto_connect
    settings.default_state = settings_update.default_state
    settings.mic_sensitivity = settings_update.mic_sensitivity
    settings.speaker_volume = settings_update.speaker_volume
    
    db.commit()
    db.refresh(settings)
    return settings
