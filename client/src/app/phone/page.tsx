"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Phone, PhoneOff, Settings, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function PhonePage() {
    const [isCallActive, setIsCallActive] = useState(false);
    const [status, setStatus] = useState<"IDLE" | "LISTENING" | "SPEAKING" | "PROCESSING">("IDLE");
    const [transcript, setTranscript] = useState("");
    const [lastAiResponse, setLastAiResponse] = useState("");
    const [colabUrl, setColabUrl] = useState("");
    const [emotion, setEmotion] = useState("Neutral");
    const [debugLog, setDebugLog] = useState<string[]>([]);

    const addLog = (msg: string) => setDebugLog(prev => [msg, ...prev].slice(0, 5));

    const testConnection = async () => {
        addLog(`Testing: ${colabUrl}...`);
        try {
            // Note: Cloudflare tunnels usually point to root or specific paths. 
            // Our server has /docs, so we can try that or just the post endpoint with bad data to see 422
            const res = await fetch(`${colabUrl}/docs`);
            addLog(`Status: ${res.status}`);
            if (res.ok) addLog("Server Online! ✅");
            else addLog("Server Error ❌");
        } catch (e) {
            addLog(`Err: ${e}`);
        }
    };

    // Refs
    const wsRef = useRef<WebSocket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const isCallActiveRef = useRef(false); // Fix for closure trap

    // Load Colab URL from local storage
    useEffect(() => {
        const savedUrl = localStorage.getItem("colab_url");
        if (savedUrl) setColabUrl(savedUrl);
        if (typeof window !== "undefined") synthRef.current = window.speechSynthesis;
    }, []);

    const saveColabUrl = (url: string) => {
        setColabUrl(url);
        localStorage.setItem("colab_url", url);
    };

    // WebSocket to Local Dashboard (For Map/Dispatch updates)
    const connectWS = () => {
        const host = window.location.hostname;
        const ws = new WebSocket(`ws://${host}:8000/ws/call`);

        ws.onopen = () => console.log("Connected to Local Dashboard");
        ws.onmessage = (event) => {
            // We can still receive override commands from Dispatcher here if needed
            const data = JSON.parse(event.data);
            console.log("WS Message:", data);
        };
        wsRef.current = ws;
    };

    // Audio Recording Logic
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                addLog(`Blob Created: ${audioBlob.size} bytes`); // DEBUG
                audioChunksRef.current = []; // Reset

                // Check REF instead of state to avoid closure staleness
                if (isCallActiveRef.current) {
                    if (audioBlob.size < 1000) {
                        addLog("Blob too small, skipping.");
                        if (isCallActiveRef.current) startRecording();
                        return;
                    }
                    await sendToColab(audioBlob);
                } else {
                    addLog("Call ended, ignoring blob.");
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setStatus("LISTENING");

            // SIMPLIFICATION: We will record for fixed 7 seconds then process.
            setTimeout(() => {
                if (mediaRecorder.state === "recording") {
                    mediaRecorder.stop();
                    setStatus("PROCESSING");
                }
            }, 7000);

        } catch (err) {
            console.error("Mic Error:", err);
            addLog(`Mic Error: ${err}`);
            alert("Microphone access denied!");
        }
    };

    const sendToColab = async (audioBlob: Blob) => {
        if (!colabUrl) {
            alert("Please set Colab URL in settings!");
            return;
        }

        addLog(`Sending ${audioBlob.size}b to Colab...`);
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.wav");

        try {
            const response = await fetch(`${colabUrl}/process_emergency`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Colab ${response.status}: ${errText}`);
            }

            const data = await response.json();
            addLog("Response Rx! ✅");
            console.log("Colab Data:", data);

            // Update UI
            setTranscript(data.transcript);
            setLastAiResponse(data.response);
            setEmotion(data.acoustic_emotion);

            // 1. Speak Response (Browser TTS for now)
            speak(data.response);

            // 2. Update Dashboard (via Local WebSocket)
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                // We send a "proxy" message so the dashboard thinks it came from the server
                // Or we send a special event the server knows to broadcast
                wsRef.current.send(JSON.stringify({
                    event: "colab_update",
                    transcript: data.transcript,
                    emotion: data.acoustic_emotion,
                    ai_response: data.response
                }));
            }

        } catch (error) {
            console.error("Colab Connection Failed:", error);
            addLog(`Upload Err: ${error}`);
            // Try again?
            if (isCallActiveRef.current) {
                addLog("Retrying...");
                startRecording();
            }
        }
    };

    const speak = (text: string) => {
        if (!synthRef.current) return;
        setStatus("SPEAKING");

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.onend = () => {
            console.log("Finished Speaking");
            // Loop back to listing
            if (isCallActiveRef.current) startRecording();
        };

        synthRef.current.speak(utterance);
    };

    const startCall = () => {
        if (!colabUrl) {
            alert("Set Colab URL first!");
            return;
        }
        setIsCallActive(true);
        isCallActiveRef.current = true; // SYNC REF
        connectWS();
        startRecording();
    };

    const endCall = () => {
        setIsCallActive(false);
        isCallActiveRef.current = false; // SYNC REF
        setStatus("IDLE");
        if (wsRef.current) wsRef.current.close();
        if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
        if (synthRef.current) synthRef.current.cancel();
    };

    // Timer logic
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isCallActive) interval = setInterval(() => setSeconds(s => s + 1), 1000);
        else setSeconds(0);
        return () => clearInterval(interval);
    }, [isCallActive]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900 text-white font-sans">

            {/* Settings Dialog */}
            <div className="absolute top-4 right-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-gray-800 border-gray-700">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-slate-700 text-white">
                        <DialogHeader>
                            <DialogTitle>Hybrid Connection Setup</DialogTitle>
                            <div className="text-xs text-slate-400">
                                Enter the Pinggy URL from Colab to enable the AI Brain.
                            </div>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <label className="text-sm font-medium text-gray-400">Colab Tunnel URL (Pinggy)</label>
                            <Input
                                value={colabUrl}
                                onChange={(e) => saveColabUrl(e.target.value)}
                                placeholder="https://....pinggy.link"
                                className="bg-gray-950 border-gray-700 text-white"
                            />
                            <p className="text-xs text-gray-500">
                                Paste the URL from your Google Colab output here.
                                Ensure it starts with https://.
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Phone Screen Container */}
            <div className="relative flex h-[700px] w-[350px] flex-col overflow-hidden rounded-[40px] border-8 border-gray-800 bg-gray-950 shadow-2xl">
                {/* Dynamic Island */}
                <div className="absolute left-1/2 top-4 h-6 w-24 -translate-x-1/2 rounded-full bg-black z-20"></div>

                {/* Content */}
                <div className="flex flex-1 flex-col items-center justify-between px-6 py-12 relative z-10 transition-colors duration-500">

                    {/* Header Info */}
                    <div className="mt-8 text-center w-full">
                        <div className={cn(
                            "mx-auto flex h-24 w-24 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-500",
                            emotion === "Panic" && isCallActive ? "bg-red-500/20 animate-pulse" : "bg-gray-800/50"
                        )}>
                            <span className="text-4xl">
                                {emotion === "Panic" ? "⚠️" : "🚑"}
                            </span>
                        </div>
                        <h2 className="mt-4 text-2xl font-bold tracking-tight">Emergency Dispatch</h2>
                        <p className={cn("mt-1 text-sm font-medium",
                            isCallActive ? "text-green-400 animate-pulse" : "text-gray-500"
                        )}>
                            {isCallActive ? (status === "SPEAKING" ? "AI Speaking..." : formatTime(seconds)) : "Disconnected"}
                        </p>

                        {/* DEBUG PANEL */}
                        <div className="mt-2 w-full px-4">
                            <div className="bg-black/50 text-[10px] text-green-400 font-mono p-2 rounded h-20 overflow-y-auto w-full text-left">
                                {debugLog.map((log, i) => (
                                    <div key={i}>{log}</div>
                                ))}
                                {debugLog.length === 0 && <div className="text-gray-600">No logs yet...</div>}
                            </div>
                            <button onClick={testConnection} className="mt-1 text-[10px] bg-blue-900 px-2 rounded text-white">
                                Test Ping
                            </button>
                        </div>

                        {/* Emotion Badge */}
                        {isCallActive && (
                            <div className={cn(
                                "mx-auto mt-2 w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                emotion === "Panic" ? "bg-red-900 text-red-100" : "bg-slate-800 text-slate-400"
                            )}>
                                {emotion} Mode
                            </div>
                        )}
                    </div>

                    {/* Transcript Area */}
                    <div className="w-full space-y-4 text-center">
                        {isCallActive && (
                            <>
                                <div className="text-xs uppercase tracking-widest text-gray-500">
                                    {status === "LISTENING" && "Listening..."}
                                    {status === "PROCESSING" && "Transmitting to Colab..."}
                                    {status === "SPEAKING" && "Receiving Response..."}
                                </div>

                                <div className="min-h-[150px] w-full rounded-2xl bg-gray-900/50 p-4 text-sm text-gray-300 flex flex-col justify-end space-y-2">
                                    {transcript && (
                                        <p className="border-l-2 border-gray-600 pl-2 text-left italic text-gray-400">
                                            "{transcript}"
                                        </p>
                                    )}
                                    {lastAiResponse && (
                                        <p className="border-l-2 border-blue-500 pl-2 text-left text-blue-100 font-medium">
                                            {lastAiResponse}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="mb-4 flex w-full flex-col gap-4">
                        {!isCallActive ? (
                            <button
                                onClick={startCall}
                                className="group relative flex h-16 w-full items-center justify-center overflow-hidden rounded-full bg-green-600 transition-all hover:bg-green-500 active:scale-95"
                            >
                                <div className="absolute inset-0 bg-white/10 group-hover:animate-[shimmer_1s_infinite]"></div>
                                <div className="flex items-center gap-2 font-bold text-white">
                                    <Phone className="h-6 w-6" />
                                    <span>CALL 911</span>
                                </div>
                            </button>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-center">
                                    <div className={cn("h-3 w-3 rounded-full bg-red-500", status === "LISTENING" && "animate-ping")} />
                                </div>
                                <button
                                    onClick={endCall}
                                    className="flex h-16 w-full items-center justify-center rounded-full bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20"
                                >
                                    <PhoneOff className="h-6 w-6" />
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
