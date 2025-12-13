"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Phone, PhoneOff, Waveform } from "lucide-react";
import { cn } from "@/lib/utils";

// Types for Web Speech API
interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

export default function PhonePage() {
    const [isCallActive, setIsCallActive] = useState(false);
    const [status, setStatus] = useState<"IDLE" | "LISTENING" | "SPEAKING" | "PROCESSING">("IDLE");
    const [transcript, setTranscript] = useState("");
    const [lastAiResponse, setLastAiResponse] = useState("");

    // Refs
    const wsRef = useRef<WebSocket | null>(null);
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    // Initialize Speech Setup on Mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const { webkitSpeechRecognition } = window as unknown as IWindow;
            const SpeechRecognition = webkitSpeechRecognition;

            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true; // Keep listening
                recognition.interimResults = false; // Only final results
                recognition.lang = "en-US";

                recognition.onstart = () => {
                    console.log("Mic on");
                    if (status !== "SPEAKING") setStatus("LISTENING");
                };

                recognition.onend = () => {
                    console.log("Mic off");
                    // Auto-restart if call is still active and not speaking
                    if (isCallActive && status !== "SPEAKING") {
                        try {
                            recognition.start();
                        } catch (e) {
                            console.error("Restart error", e);
                        }
                    }
                };

                recognition.onresult = (event: any) => {
                    const current = event.resultIndex;
                    const text = event.results[current][0].transcript;
                    console.log("Heard:", text);
                    setTranscript(text);

                    // Send to Backend
                    sendMessage(text);
                };

                recognitionRef.current = recognition;
            }

            synthRef.current = window.speechSynthesis;
        }
    }, [isCallActive, status]);

    // WebSocket Logic
    const connectWS = () => {
        const ws = new WebSocket("ws://localhost:8002/ws/call"); // Backend port 8000 usually? Wait user said 8000. 
        // Need to check previous steps. The user said python runs on 8000. 
        // Nextjs runs on 3000/3001/3002.

        ws.onopen = () => {
            console.log("Connected to Dispatch System");
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.event === "ai_response" && data.text) {
                setLastAiResponse(data.text);
                speak(data.text);
            }
        };

        wsRef.current = ws;
    };

    const sendMessage = (text: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            setStatus("PROCESSING");
            wsRef.current.send(JSON.stringify({ text }));
        }
    };

    // TTS Logic
    const speak = (text: string) => {
        if (!synthRef.current) return;

        // Stop listening while speaking to avoid hearing itself
        if (recognitionRef.current) recognitionRef.current.stop();
        setStatus("SPEAKING");

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
            console.log("Finished speaking");
            setStatus("LISTENING");
            // Resume listening
            if (isCallActive && recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                } catch (e) { console.error(e) }
            }
        };

        synthRef.current.speak(utterance);
    };

    // Handlers
    const startCall = () => {
        setIsCallActive(true);
        setStatus("LISTENING");

        // Connect WS
        const host = window.location.hostname;
        const ws = new WebSocket(`ws://${host}:8000/ws/call`);
        ws.onopen = () => console.log("WS Connected");
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Handle AI Response
            if (data.event === "ai_response" && data.text) {
                setLastAiResponse(data.text);
                speak(data.text);
            }
        };
        wsRef.current = ws;

        // Start Mic
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e) { console.error(e) }
        }
    };

    const endCall = () => {
        setIsCallActive(false);
        setStatus("IDLE");

        if (wsRef.current) wsRef.current.close();
        if (recognitionRef.current) recognitionRef.current.stop();
        if (synthRef.current) synthRef.current.cancel();
    };

    // Timer logic
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isCallActive) {
            interval = setInterval(() => setSeconds(s => s + 1), 1000);
        } else {
            setSeconds(0);
        }
        return () => clearInterval(interval);
    }, [isCallActive]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900 text-white font-sans">
            {/* Phone Screen Container */}
            <div className="relative flex h-[700px] w-[350px] flex-col overflow-hidden rounded-[40px] border-8 border-gray-800 bg-gray-950 shadow-2xl">

                {/* Dynamic Island / Notch */}
                <div className="absolute left-1/2 top-4 h-6 w-24 -translate-x-1/2 rounded-full bg-black"></div>

                {/* Content */}
                <div className="flex flex-1 flex-col items-center justify-between px-6 py-12">

                    {/* Header Info */}
                    <div className="mt-8 text-center">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-800/50 backdrop-blur-sm">
                            <span className="text-4xl">🚑</span>
                        </div>
                        <h2 className="mt-4 text-2xl font-bold tracking-tight">Emergency Dispatch</h2>
                        <p className={cn("mt-1 text-sm font-medium",
                            isCallActive ? "text-green-400 animate-pulse" : "text-gray-500"
                        )}>
                            {isCallActive ? (status === "SPEAKING" ? "AI Speaking..." : formatTime(seconds)) : "Disconnected"}
                        </p>
                    </div>

                    {/* Visualizer / Status Area */}
                    <div className="w-full space-y-6 text-center">
                        {isCallActive && (
                            <>
                                <div className="text-sm text-gray-400">
                                    {status === "LISTENING" && "Listening..."}
                                    {status === "PROCESSING" && "Thinking..."}
                                    {status === "SPEAKING" && "Responding..."}
                                </div>
                                <div className="h-32 w-full rounded-2xl bg-gray-900/50 p-4 text-xs text-gray-300">
                                    <p className="font-semibold text-gray-500 mb-2">TRANSCRIPT</p>
                                    <p className="italic">"{transcript || "..."}"</p>
                                    {lastAiResponse && (
                                        <p className="mt-2 text-blue-400">AI: "{lastAiResponse}"</p>
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
                                className="group relative flex h-16 w-full items-center justify-center overflow-hidden rounded-full bg-green-500 transition-all hover:bg-green-400 active:scale-95"
                            >
                                <div className="absolute inset-0 bg-white/20 group-hover:animate-[shimmer_1s_infinite]"></div>
                                <div className="flex items-center gap-2 font-bold text-white">
                                    <Phone className="h-6 w-6" />
                                    <span>CALL 911</span>
                                </div>
                            </button>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex h-16 w-full items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700">
                                    <Mic className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={endCall}
                                    className="flex h-16 w-full items-center justify-center rounded-full bg-red-500 hover:bg-red-400"
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
