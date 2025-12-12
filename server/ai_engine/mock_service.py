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
        await asyncio.sleep(1.5)
        
        text_lower = text.lower()
        
        if "fire" in text_lower:
            return "I understand there is a fire. Are you in a safe place right now?"
        elif "hurt" in text_lower or "blood" in text_lower:
            return "I am sending medical help. Apply pressure to the wound if possible."
        elif "hello" in text_lower or "hi" in text_lower:
            return "9-1-1, what is your emergency?"
            
        return "9-1-1, I'm here. Can you tell me your location?"

    async def detect_emotion(self, text: str):
        """
        Randomly returns an emotion tag for UI testing.
        """
        emotions = ["Neutral", "Panic", "Fear", "Calm"]
        return random.choice(emotions)

    async def detect_location(self, text: str):
        """
        Extracts location coordinates.
        For Mock, we'll return None now (demo over).
        """
        return None
