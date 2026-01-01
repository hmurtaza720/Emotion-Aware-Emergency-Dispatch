import sqlite3
import json
import os
from datetime import datetime
import uuid

DB_PATH = os.path.join(os.path.dirname(__file__), "calls.db")

class DatabaseManager:
    def __init__(self):
        self._init_db()

    def _init_db(self):
        """Creates the calls table if it doesn't exist."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS calls (
                id TEXT PRIMARY KEY,
                started_at DATETIME,
                ended_at DATETIME,
                caller_location TEXT,
                detected_emotion TEXT,
                transcript TEXT,
                duration_seconds INTEGER
            )
        ''')
        conn.commit()
        conn.close()
        print(f" [DB] Database initialized at {DB_PATH}")

    def save_call(self, transcript_list: list, emotion: str, location: str):
        """Saves a completed call to the database."""
        call_id = str(uuid.uuid4())
        ended_at = datetime.now()
        # Assume start time is roughly when the first message arrived, or just now for simplicity if list is empty
        # A better way would be to track start time in the session.
        # For now, we'll just set started_at to ended_at for simplicity unless we pass it in.
        started_at = ended_at # Simplified for now
        
        # Calculate duration? We'll leave it as 0 for now.
        
        transcript_json = json.dumps(transcript_list)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO calls (id, started_at, ended_at, caller_location, detected_emotion, transcript, duration_seconds)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (call_id, started_at, ended_at, location, emotion, transcript_json, 0))
        conn.commit()
        conn.close()
        print(f" [DB] Call saved: {call_id} | Emotion: {emotion}")
        return call_id

    def get_recent_calls(self, limit=10):
        """Retrieves the most recent calls."""
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM calls ORDER BY ended_at DESC LIMIT ?', (limit,))
        rows = cursor.fetchall()
        conn.close()
        
        calls = []
        for row in rows:
            calls.append(dict(row))
        return calls
