from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from server.ai_engine.mock_service import MockAIService
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

@app.get("/")
def health_check():
    return {"status": "online", "mode": "mock_cpu", "message": "System is ready for development."}

@app.websocket("/ws/call")
async def websocket_endpoint(websocket: WebSocket):
    """
    Handles the real-time connection between the Dashboard and the AI.
    """
    await websocket.accept()
    print(" [Server] Client connected.")
    
    try:
        while True:
            # Receive message from Client (Frontend)
            data = await websocket.receive_text()
            message_data = json.loads(data)
            user_input = message_data.get("text", "")
            
            if not user_input:
                continue
                
            # 1. Ask the AI Brain
            ai_response = await ai_engine.process_text(user_input)
            
            # 2. Check Emotion (Mock)
            emotion = await ai_engine.detect_emotion(user_input)
            
            # 3. Send back to Client
            response_payload = {
                "event": "ai_response",
                "text": ai_response,
                "emotion": emotion
            }
            await websocket.send_text(json.dumps(response_payload))
            
    except WebSocketDisconnect:
        print(" [Server] Client disconnected.")
