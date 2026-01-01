from abc import ABC, abstractmethod

class AIService(ABC):
    """
    Abstract Base Class for the DispatchAI Brain.
    Ensures all AI implementations (Mock, Groq, Local) speak the same language.
    """

    @abstractmethod
    async def process_text(self, text: str) -> str:
        """
        Takes raw user text and returns the AI's conversational response.
        Example: "Help fire!" -> "I understand. Where is the fire?"
        """
        pass

    @abstractmethod
    async def detect_emotion(self, text: str) -> str:
        """
        Analyzes text and returns an emotion label (e.g., "Panic", "Fear").
        """
        pass

    @abstractmethod
    async def detect_location(self, text: str) -> list[float] | None:
        """
        Analyzes text to find a location.
        Returns [lat, lng] or None if no location found.
        """
        pass
