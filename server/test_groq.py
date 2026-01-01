import os
from dotenv import load_dotenv

from pathlib import Path

# Robustly find .env.local relative to this script
base_dir = Path(__file__).parent
env_local_path = base_dir / ".env.local"
load_dotenv(dotenv_path=env_local_path)

api_key = os.getenv("GROQ_API_KEY")
print(f"DEBUG: Loaded API Key: {api_key[:5]}...{api_key[-4:] if api_key else 'None'}")

import sys
print(f"DEBUG: Python Executable: {sys.executable}")
try:
    from groq import Groq
    print("DEBUG: Groq module imported successfully.")
    
    client = Groq(api_key=api_key)
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": "Say 'Groq is working!'",
            }
        ],
        model="llama-3.3-70b-versatile",
    )
    print(f"DEBUG: Groq Response: {chat_completion.choices[0].message.content}")

except ImportError:
    print("DEBUG: ERROR - 'groq' module not found. Run 'pip install groq'")
except Exception as e:
    print(f"DEBUG: ERROR - Connection failed: {e}")
