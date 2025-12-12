'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const DispatchMap = dynamic(() => import('@/components/Map'), { ssr: false });

// Types for our chat messages
interface Message {
  role: 'user' | 'ai' | 'system';
  content: string;
  emotion?: string;
  timestamp: string;
}

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'System Initialized. Connected to Mock AI.', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('Neutral');
  const [mapLocation, setMapLocation] = useState<[number, number] | undefined>(undefined);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket on mount
    const ws = new WebSocket('ws://localhost:8000/ws/call');

    ws.onopen = () => {
      setIsConnected(true);
      addLog('system', 'Connected to Dispatch Server');
    };

    ws.onclose = () => {
      setIsConnected(false);
      addLog('system', 'Disconnected from Server');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'ai_response') {
        addLog('ai', data.text, data.emotion);
        if (data.emotion) setCurrentEmotion(data.emotion);
        if (data.location) setMapLocation(data.location); // Update map if location found
      }
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  const addLog = (role: 'user' | 'ai' | 'system', content: string, emotion?: string) => {
    setMessages(prev => [...prev, {
      role,
      content,
      emotion,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    if (!wsRef.current) return;

    // Send to Backend
    wsRef.current.send(JSON.stringify({ text: inputText }));
    addLog('user', inputText);
    setInputText('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center font-bold">911</div>
          <h1 className="text-xl font-semibold tracking-wide">DispatchAI <span className="text-xs text-slate-400 font-normal">FYP Edition v1.0</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            {isConnected ? 'SYSTEM ONLINE' : 'DISCONNECTED'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">

        {/* Left Panel: Live Transcript */}
        <div className="w-1/3 border-r border-slate-800 flex flex-col bg-slate-925">
          <div className="p-3 border-b border-slate-800 bg-slate-900/50">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Live Transcript</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[90%] rounded-lg p-3 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' :
                  msg.role === 'system' ? 'bg-slate-800 text-slate-400 italic text-xs' :
                    'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}>
                  {msg.content}
                </div>
                {msg.role !== 'system' && (
                  <span className="text-[10px] text-slate-500 mt-1">{msg.role === 'user' ? 'Caller' : 'Dispatcher AI'} • {msg.timestamp}</span>
                )}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-800 bg-slate-900">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type operator message (or simulate caller)..."
                className="flex-1 bg-slate-800 border-none rounded-md px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-slate-200 placeholder:text-slate-600"
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Map & Analytics */}
        <div className="flex-1 flex flex-col bg-slate-950 p-6 gap-6 overflow-y-auto">

          {/* Top Cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Emotion Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
              <div className="text-xs text-slate-500 uppercase font-semibold mb-2">Caller Emotion</div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-3xl">{currentEmotion === 'Panic' || currentEmotion === 'Fear' ? '😰' : '😐'}</span>
                {currentEmotion}
              </div>
              <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${currentEmotion === 'Panic' ? 'bg-red-500 w-[90%]' : 'bg-emerald-500 w-[40%]'}`}
                ></div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg col-span-2">
              <div className="text-xs text-slate-500 uppercase font-semibold mb-2">Identified Location</div>
              <div className="flex items-center gap-4">
                <div className="bg-slate-800 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <div className="text-lg font-medium text-white">Detecting...</div>
                  <div className="text-sm text-slate-500">Waiting for address in call...</div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Interface */}
          <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative group">
            <DispatchMap />
          </div>

        </div>
      </main>
    </div>
  );
}
