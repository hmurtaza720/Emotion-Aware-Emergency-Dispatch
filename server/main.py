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

# Connection Manager for Broadcasting
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/call")
async def websocket_endpoint(websocket: WebSocket):
    """
    Handles the real-time connection between the Dashboard and the AI.
    """
    await manager.connect(websocket)
    print(" [Server] Client connected.")
    
    # Session Data (Per socket, but ideally should be shared if we want shared state, 
    # but for loopback broadcast, just broadcasting the response is enough)
    transcript = []
    current_emotion = "Neutral"
    current_location = "Unknown"
    
    try:
        while True:
            # Receive message from Client (Frontend)
            data = await websocket.receive_text()
            message_data = json.loads(data)
            user_input = message_data.get("text", "")
            
            # If it's a "ping" or "get_db" event, just ignore or handle separately
            if message_data.get("event") == "get_db":
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
        if len(transcript) > 0:
            db.save_call(transcript, current_emotion, current_location)
        print(" [Server] Call saved.")
