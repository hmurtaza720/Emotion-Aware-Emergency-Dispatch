import asyncio
import random

class MockAIService:
    """
    A Fake AI Brain for development on non-GPU laptops.
    Simulates the behavior of the real Mistral model + Whisper + TTS.
    """
    
    def __init__(self):
        print(" [MockAI] Initialized. Running in LAPTOP MODE (No GPU required).")
        self.system_prompt = "You are an empathetic 911 dispatcher."

    async def process_text(self, text: str):
        """
        Takes input text (simulating what Whisper would output)
        and returns a fake AI response.
        """
        print(f" [MockAI] Thinking about: '{text}'...")
        
        # Simulate "Thinking" time (Latency)
        await asyncio.sleep(1.5)
        
        # Simple keyword matching to fake intelligence
        text_lower = text.lower()
        
        response = "9-1-1, I'm here. Can you tell me your location?"
        
        if "fire" in text_lower:
            response = "I understand there is a fire. Are you in a safe place right now?"
        elif "hurt" in text_lower or "blood" in text_lower:
            response = "I am sending medical help. Apply pressure to the wound if possible."
        elif "hello" in text_lower or "hi" in text_lower:
            response = "9-1-1, what is your emergency?"
            
        print(f" [MockAI] Responded: '{response}'")
        return response

    async def detect_emotion(self, text: str):
        """
        Randomly returns an emotion tag for UI testing.
        """
        emotions = ["Neutral", "Panic", "Fear", "Calm"]
        return random.choice(emotions)
