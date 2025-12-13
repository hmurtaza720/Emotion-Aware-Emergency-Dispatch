import os
from groq import Groq
from .base import AIService

class GroqService(AIService):
    """
    Real AI Brain using Groq's super-fast API.
    Perfect for laptops (intelligence runs in the cloud).
    """

    def __init__(self):
        print(" [GroqAI] Initializing Cloud Brain...")
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError(" [GroqAI] Error: GROQ_API_KEY not found in .env file!")
        
        self.client = Groq(api_key=api_key)
        self.system_prompt = (
            "You are an empathetic 911 dispatcher. "
            "Your goal is to extract location and emotion while keeping the caller calm. "
            "Keep responses short and reassuring."
        )

    async def process_text(self, text: str) -> str:
        """
        Sends user text to Llama3/Mistral via Groq.
        """
        print(f" [GroqAI] Sending to Cloud: '{text}'")
        
        completion = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": text}
            ],
            temperature=0.5,
            max_tokens=100,
        )
        
        response = completion.choices[0].message.content
        print(f" [GroqAI] Received: '{response}'")
        return response

    async def detect_emotion(self, text: str) -> str:
        """
        Asks AI to classify emotion from text.
        """
        prompt = f"Classify the emotion of this text into ONE word (Fear, Panic, Calm, Neutral, Anger). Text: '{text}'"
        
        completion = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=10,
        )
        return completion.choices[0].message.content.strip()

    async def detect_location(self, text: str) -> list[float] | None:
        """
        Extracts location. For now, strict extraction or None.
        Real implementation would call a Geocoding API.
        We will return None here and rely on Mock logic or client logic for demo if needed, 
        or we can ask LLM to extract "City, Street" and geocode it.
        For simplicity in Phase 4 Step 1: Return None (Let UI handle it or add geocoding later).
        """
        return None
