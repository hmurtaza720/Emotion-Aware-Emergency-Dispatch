from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from server.ai_engine.mock_service import MockAIService
from server.database.db_manager import DatabaseManager
from datetime import datetime
from server.database.db_manager import DatabaseManager
import json

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

# Initialize the Brain (Mock for now)
ai_engine = MockAIService()
# Initialize Database
db = DatabaseManager()

@app.get("/")
def health_check():
    return {"status": "online", "mode": "mock_cpu", "message": "System is ready for development."}

@app.get("/calls")
def get_history():
    return db.get_recent_calls()

@app.websocket("/ws/call")
async def websocket_endpoint(websocket: WebSocket):
    """
    Handles the real-time connection between the Dashboard and the AI.
    """
    await websocket.accept()
    print(" [Server] Client connected.")
    
    # Session Data
    transcript = []
    current_emotion = "Neutral"
    current_location = "Unknown"
    
    try:
        while True:
            # Receive message from Client (Frontend)
            data = await websocket.receive_text()
            message_data = json.loads(data)
            user_input = message_data.get("text", "")
            
            if not user_input:
                continue
                
            # Log User Input
            transcript.append({"role": "user", "content": user_input, "timestamp": str(datetime.now())})

            # 1. Ask the AI Brain
            ai_response = await ai_engine.process_text(user_input)
            
            # Log AI Response
            transcript.append({"role": "ai", "content": ai_response, "timestamp": str(datetime.now())})

            # 2. Check Emotion (Mock)
            # Update session emotion to the latest one detected
            current_emotion = await ai_engine.detect_emotion(user_input)
            
            # 3. Check Location (Mock)
            # If coordinates are found, update the map
            coords = await ai_engine.detect_location(user_input)
            if coords:
                current_location = str(coords) # Save logic
            
            # 4. Send back to Client
            response_payload = {
                "event": "ai_response",
                "text": ai_response,
                "emotion": current_emotion,
                "location": coords # Will be [lat, lng] or None
            }
            await websocket.send_text(json.dumps(response_payload))
            
    except WebSocketDisconnect:
        print(" [Server] Client disconnected. Saving call to DB...")
        if len(transcript) > 0:
            db.save_call(transcript, current_emotion, current_location)
        print(" [Server] Call saved.")
