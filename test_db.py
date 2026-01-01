import asyncio
import websockets
import json
import sqlite3
import os

async def test_call_save():
    uri = "ws://localhost:8000/ws/call"
    
    print(f" [TEST] Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            # 1. Send "Hello"
            msg = {"text": "Hello, this is a test for the database."}
            await websocket.send(json.dumps(msg))
            print(f" [TEST] Sent: {msg['text']}")
            
            # 2. Wait for response
            response = await websocket.recv()
            print(f" [TEST] Received: {response}")
            
            # 3. Disconnect (This should trigger the DB save)
            print(" [TEST] Disconnecting now to force DB save...")
    
    except Exception as e:
        print(f" [TEST] Connection Error: {e}")

    # 4. Verification
    print(" [TEST] Verifying Database...")
    await asyncio.sleep(1) # Wait for async write
    
    db_path = "server/database/calls.db"
    if not os.path.exists(db_path):
        print(" [FAIL] Database file not found!")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM calls ORDER BY ended_at DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    
    if row:
        print(f" [PASS] Call found in DB!")
        print(f"   - ID: {row[0]}")
        print(f"   - Emotion: {row[4]}")
        print(f"   - Transcript: {row[5][:50]}...")
    else:
        print(" [FAIL] No calls found in DB.")

if __name__ == "__main__":
    asyncio.run(test_call_save())
