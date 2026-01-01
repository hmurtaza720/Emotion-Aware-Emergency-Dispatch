"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import EventPanel from "@/components/live/EventPanel";
import Header, { US_STATES } from "@/components/live/Header";
import TranscriptPanel from "@/components/live/TranscriptPanel";
import { ChevronRight, ChevronLeft, Info, BrainCircuit, Siren, FireExtinguisher, Ambulance } from "lucide-react";
import EmotionCard from "@/components/live/EmotionCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const Map = dynamic(() => import("@/components/live/map/Map"), {
    loading: () => <p>Rendering Map...</p>,
    ssr: false,
});

interface ServerMessage {
    event: "db_response" | "ai_response";
    data?: Record<string, Call>;
    text?: string;
    user_text?: string;
    emotion?: string;
    location?: [number, number];
}

export type Call = {
    emotions?: {
        emotion: string;
        intensity: number;
    }[];
    id: string;
    location_name: string;
    location_coords?: {
        lat: number;
        lng: number;
    };
    street_view?: string; // base 64
    name: string;
    phone: string;
    recommendation: string;
    severity?: "CRITICAL" | "MODERATE" | "RESOLVED";
    summary: string;
    time: string; // ISO Date String
    title?: string;
    transcript: {
        role: "assistant" | "user" | "agent";
        content: string;
    }[];
    type: string;
};

export interface CallProps {
    call?: Call;
    selectedId: string | undefined;
}

const getWsUrl = () => {
    if (typeof window === "undefined") return "ws://127.0.0.1:8000/ws/call";
    const host = window.location.hostname;
    return `ws://${host}:8000/ws/call`;
};

let wss: WebSocket | null = null;

const MESSAGES: Record<string, Call> = {
    CA22ccebaacd73dcefa23f9b41a9bce0b3: {
        id: "CA22ccebaacd73dcefa23f9b41a9bce0b3",
        time: "2024-06-23T22:46:37.335108",
        transcript: [
            { role: "agent", content: "9-1-1, what's your emergency?" },
            { role: "user", content: "Um, there's current earthquakes. Um, send help, please." },
            { role: "agent", content: "What's your location?" },
            { role: "user", content: "I am currently at the Golden Gate Bridge, there's a lot of people injured. Please send help." },
            { role: "agent", content: "Is there immediate danger where you are?" },
            { role: "agent", content: "Anything changed?" },
            { role: "user", content: "Um, I'm currently at the Golden Gate Bridge. And we need help. A lot of people here that are injured." },
            { role: "agent", content: "Is there immediate danger where you are?" },
        ],
        emotions: [
            { emotion: "Fear", intensity: 0.3548029899331076 },
            { emotion: "Confusion", intensity: 0.2665824613400868 },
            { emotion: "Anxiety", intensity: 0.21041041083766945 },
        ],
        recommendation: "Send emergency services immediately for medical assistance and disaster relief.",
        severity: "CRITICAL",
        type: "Police",
        name: "",
        phone: "",
        title: "Earthquake Emergency at Golden Gate Bridge",
        summary: "Caller reports current earthquakes and requests immediate assistance. Location: Golden Gate Bridge with many people injured.",
        location_name: "Golden Gate Bridge, San Francisco, CA",
        location_coords: { lat: 37.8199109, lng: -122.4785598 },
        street_view: "", // Shortened for initial creation
    },
};

const emptyCall: Call = {
    emotions: [],
    id: "",
    location_name: "",
    location_coords: { lat: 0, lng: 0 },
    street_view: "",
    name: "",
    phone: "",
    recommendation: "",
    severity: "RESOLVED",
    summary: "",
    time: "",
    title: "",
    transcript: [],
    type: "",
};

const Page = () => {
    const [connected, setConnected] = useState(false);
    const [data, setData] = useState<Record<string, Call>>(MESSAGES);
    const [selectedId, setSelectedId] = useState<string | undefined>();
    const [resolvedIds, setResolvedIds] = useState<string[]>([]);
    const [city, setCity] = useState("CA");
    const [isOverlayOpen, setIsOverlayOpen] = useState(true);
    const { toast } = useToast();

    const [center, setCenter] = useState<{ lat: number; lng: number }>({
        lat: 37.867989,
        lng: -122.271507,
    });

    const filteredData = Object.entries(data).reduce((acc, [key, call]) => {
        if (key === "live_session_1") {
            acc[key] = call;
            return acc;
        }

        let match = true;
        const loc = call.location_name || "";

        const stateInfo = US_STATES.find(s => s.code === city);
        if (stateInfo) {
            match = loc.includes(` ${stateInfo.code}`) ||
                loc.includes(`, ${stateInfo.code}`) ||
                loc.toLowerCase().includes(stateInfo.name.toLowerCase());
        }

        if (match) acc[key] = call;
        return acc;
    }, {} as Record<string, Call>);

    useEffect(() => {
        const firstCallWithCoords = Object.entries(filteredData).find(([_, c]) => c.location_coords)?.[1];
        if (firstCallWithCoords && firstCallWithCoords.location_coords && !selectedId) {
            setCenter(firstCallWithCoords.location_coords);
        }
    }, [city, filteredData, selectedId]);

    const handleSelect = (id: string) => {
        setSelectedId(id === selectedId ? undefined : id);
    };

    const handleResolve = (id: string) => {
        setResolvedIds((prev) => {
            const newResolvedIds = [...prev, id];
            const newData = { ...data };
            Object.keys(newData).forEach((key) => {
                if (newResolvedIds.includes(newData[key].id)) {
                    newData[key].severity = "RESOLVED";
                }
            });
            setData(newData);
            return newResolvedIds;
        });
    };

    const handleTransfer = (id: string) => {
        if (wss) {
            wss.send(JSON.stringify({ event: "transfer", id: id }));
        }
    };

    useEffect(() => {
        if (!selectedId || !data[selectedId]?.location_coords) return;
        setCenter(data[selectedId].location_coords as { lat: number; lng: number });
    }, [selectedId, data]);

    useEffect(() => {
        if (selectedId && data[selectedId]) {
            const locName = data[selectedId].location_name;
            if (locName) {
                const matchedState = US_STATES.find(s =>
                    locName.includes(` ${s.code}`) ||
                    locName.includes(`, ${s.code}`) ||
                    locName.toLowerCase().includes(s.name.toLowerCase())
                );
                if (matchedState && matchedState.code !== city) {
                    setCity(matchedState.code);
                }
            }
        }
    }, [selectedId, data, city]);

    useEffect(() => {
        if (!wss) {
            wss = new WebSocket(getWsUrl());
        }
        wss.onopen = () => {
            setConnected(true);
            wss!.send(JSON.stringify({ event: "get_db" }));
            wss!.onmessage = (event: MessageEvent) => {
                const message = JSON.parse(event.data) as ServerMessage;
                if (message.event === "ai_response") {
                    setData(prevData => {
                        const liveCallId = "live_session_1";
                        const currentCall = prevData[liveCallId] || {
                            ...emptyCall,
                            id: liveCallId,
                            title: "Live Incoming Call",
                            name: "Caller (Unknown)",
                            severity: "CRITICAL",
                            location_name: "Detecting...",
                            type: "Emergency",
                            time: new Date().toISOString(),
                            transcript: []
                        };
                        const newEntries = [];
                        if (message.user_text) newEntries.push({ role: "user" as const, content: message.user_text });
                        if (message.text) newEntries.push({ role: "assistant" as const, content: message.text });
                        const newTranscript = [...currentCall.transcript, ...newEntries];
                        let newEmotions = currentCall.emotions || [];
                        if (message.emotion) {
                            let intensity = 0.5;
                            if (message.emotion === "Panic" || message.emotion === "Fear") intensity = 0.9;
                            if (message.emotion === "Calm" || message.emotion === "Neutral") intensity = 0.2;
                            newEmotions = [
                                { emotion: message.emotion, intensity: intensity },
                                { emotion: "Confidence", intensity: 1.0 - intensity }
                            ];
                        }
                        let newLocation = currentCall.location_coords;
                        let newLocationName = currentCall.location_name;
                        if (message.location && Array.isArray(message.location)) {
                            newLocation = { lat: message.location[0], lng: message.location[1] };
                            newLocationName = "Detected Location";
                        }
                        return {
                            ...prevData,
                            [liveCallId]: {
                                ...currentCall,
                                transcript: newTranscript,
                                emotions: newEmotions,
                                location_coords: newLocation,
                                location_name: newLocationName
                            }
                        };
                    });
                    if (selectedId !== "live_session_1") setSelectedId("live_session_1");
                } else if (message.data) {
                    setData(message.data);
                }
            };
            if (wss) {
                wss.onclose = () => setConnected(false);
                wss.onerror = (error) => console.error("WebSocket Error:", error);
            }
        };
    }, []);

    return (
        <div className="flex h-full flex-col space-y-1 selection:bg-blue-500/30">
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
                <Header connected={connected} city={city} setCity={setCity} />
            </div>

            <div className="flex flex-1 space-x-1 overflow-hidden">
                {/* Column 1: Emergency Feed */}
                <div className="w-[360px] flex-shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 shadow-xl">
                    <EventPanel
                        data={filteredData}
                        selectedId={selectedId || undefined}
                        handleSelect={handleSelect}
                    />
                </div>

                {/* Column 2: Map Workspace */}
                <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/20 shadow-2xl">
                    <Map
                        center={center}
                        pins={
                            Object.entries(filteredData)
                                .filter(
                                    ([_, call]) =>
                                        call.location_coords && call.location_name,
                                )
                                .map(([_, call]) => {
                                    return {
                                        coordinates: [
                                            call.location_coords?.lat as number,
                                            call.location_coords?.lng as number,
                                        ],
                                        popupHtml: `<b>${call.title}</b><br>Location: ${call.location_name}`,
                                    };
                                })
                        }
                    />

                    {/* Collapsible Overlay */}
                    {selectedId && data[selectedId] && (
                        <div className={cn(
                            "absolute right-2 top-4 z-[1000] flex items-center transition-all duration-300 ease-in-out",
                            isOverlayOpen ? "translate-x-0" : "translate-x-[calc(100%-48px)]"
                        )}>
                            <div className="flex flex-row items-center space-x-2">
                                {isOverlayOpen && (
                                    <div className="flex w-80 flex-col space-y-3 rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-right-4">
                                        {/* Incident Header */}
                                        <div className="space-y-1">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-0.5">
                                                    <h3 className="text-base font-bold leading-tight text-white">{data[selectedId].title || "Untiled Case"}</h3>
                                                    <p className="text-[10px] text-slate-500 font-medium">{data[selectedId].location_name}</p>
                                                </div>
                                                <div className={cn(
                                                    "rounded p-1",
                                                    data[selectedId].severity === "CRITICAL" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                                                )}>
                                                    <Info size={14} />
                                                </div>
                                            </div>
                                        </div>

                                        <Separator className="bg-slate-800/50" />

                                        {/* Emotions Section */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <BrainCircuit size={14} className="text-blue-400" />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Emotion Intel</p>
                                                </div>
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                            </div>
                                            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
                                                {data[selectedId]?.emotions?.map((em, idx) => (
                                                    <EmotionCard
                                                        key={idx}
                                                        emotion={em.emotion}
                                                        percentage={em.intensity * 100}
                                                        color={idx === 0 ? "bg-blue-500" : "bg-slate-700"}
                                                    />
                                                ))}
                                                {(!data[selectedId]?.emotions || data[selectedId].emotions.length === 0) && (
                                                    <p className="text-[10px] text-slate-600 italic">Analyzing voice patterns...</p>
                                                )}
                                            </div>
                                        </div>

                                        <Separator className="bg-slate-800/50" />

                                        {/* Summary Section */}
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Info size={14} className="text-blue-400" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Incident Summary</p>
                                            </div>
                                            <ScrollArea className="max-h-24 pr-2">
                                                <p className="text-xs leading-relaxed text-slate-300">
                                                    {data[selectedId]?.summary || "AI is generating summary from live transcript flows..."}
                                                </p>
                                            </ScrollArea>
                                        </div>

                                        <Separator className="bg-slate-800/50" />

                                        {/* Rapid Dispatch Section */}
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Rapid Dispatch</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="h-9 px-2 border-blue-900/30 bg-blue-950/20 text-blue-400 hover:bg-blue-900/30 text-[10px] gap-1.5"
                                                    onClick={() => {
                                                        toast({
                                                            title: "Police Dispatched",
                                                            description: `Units en route to ${data[selectedId].location_name}`
                                                        });
                                                        handleResolve(selectedId);
                                                    }}
                                                >
                                                    <Siren size={12} /> Police
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="h-9 px-2 border-red-900/30 bg-red-950/20 text-red-400 hover:bg-red-900/30 text-[10px] gap-1.5"
                                                    onClick={() => {
                                                        toast({
                                                            title: "Fire Dispatched",
                                                            description: "Engine units responding."
                                                        });
                                                        handleResolve(selectedId);
                                                    }}
                                                >
                                                    <FireExtinguisher size={12} /> Fire
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="h-9 px-2 border-green-900/30 bg-green-950/20 text-green-400 hover:bg-green-900/30 text-[10px] gap-1.5"
                                                    onClick={() => {
                                                        toast({
                                                            title: "EMS Dispatched",
                                                            description: "Paramedics en route."
                                                        });
                                                        handleResolve(selectedId);
                                                    }}
                                                >
                                                    <Ambulance size={12} /> EMS
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={() => setIsOverlayOpen(!isOverlayOpen)}
                                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900/90 border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white shadow-lg transition-all"
                                >
                                    {isOverlayOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Column 3: Action Sidebar */}
                <div className="w-[400px] flex-shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
                    <TranscriptPanel
                        call={selectedId ? data[selectedId] : emptyCall}
                        selectedId={selectedId || undefined}
                        handleTransfer={handleTransfer}
                        handleResolve={handleResolve}
                    />
                </div>
            </div>
        </div>
    );
};

export default Page;
