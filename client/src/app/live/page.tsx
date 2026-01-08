"use client";

import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import EventPanel from "@/components/live/EventPanel";
import Header from "@/components/live/Header";
import { FilterState } from "@/components/live/EventPanel";
import { US_STATES, CITY_COORDS } from "@/data/constants";
import { Call } from "@/data/types";
import { MESSAGES } from "@/data/mock_data";
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
    event: "db_response" | "ai_response" | "incoming_call" | "audio_relay";
    data?: Record<string, Call>;
    text?: string;
    user_text?: string;
    emotion?: string;
    location?: [number, number];
    phone?: string;
    location_manual?: string;
    timestamp?: string;
    chunk?: string;
}

export interface CallProps {
    call?: Call;
    selectedId: string | undefined;
}

const getWsUrl = () => {
    // Explicitly use 127.0.0.1 to avoid Windows IPv6 resolution issues with localhost
    return "ws://127.0.0.1:8000/ws/call";
};

let wss: WebSocket | null = null;

const emptyCall: Call = {
    emotions: [],
    id: "",
    location_name: "",
    location_coords: {
        lat: 0,
        lng: 0,
    },
    street_view: "", // base 64
    name: "",
    phone: "",
    recommendation: "",
    severity: "RESOLVED",
    summary: "",
    time: "",
    title: "",
    transcript: [],
    type: "",
    status: "Disconnected",
    responder_type: "AI",
    agent_name: "Unknown"
};

const Page = () => {
    const [connected, setConnected] = useState(false);
    const [data, setData] = useState<Record<string, Call>>(MESSAGES);
    const [selectedId, setSelectedId] = useState<string | undefined>();
    const [resolvedIds, setResolvedIds] = useState<string[]>([]);
    const [city, setCity] = useState("ALL");
    const [filters, setFilters] = useState<FilterState>({
        stateCode: "ALL",
        city: "ALL",
        emotion: "ALL",
        type: "ALL",
        severity: "ALL"
    });
    const [isOverlayOpen, setIsOverlayOpen] = useState(true);
    const { toast } = useToast();

    // WebSocket Ref
    const wsRef = React.useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Manual Reconnect Function
    const forceReconnect = () => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        setConnected(false);
        toast({ title: "Reconnecting...", description: "Attempting to reach server." });
        connectWs();
    };

    // Filter data based on selected city
    const filteredData = Object.entries(data).reduce((acc, [key, call]) => {
        if (key === "live_session_1") {
            acc[key] = call;
            return acc;
        }

        let match = true;

        if (filters.stateCode !== "ALL") {
            const loc = call.location_name || "";
            const stateInfo = US_STATES.find(s => s.code === filters.stateCode);
            if (stateInfo) {
                const stateMatch = loc.includes(` ${stateInfo.code}`) ||
                    loc.includes(`, ${stateInfo.code}`) ||
                    loc.toLowerCase().includes(stateInfo.name.toLowerCase());
                if (!stateMatch) match = false;
            }
        }

        if (match && filters.city !== "ALL") {
            const loc = call.location_name?.toLowerCase() || "";
            if (!loc.includes(filters.city.toLowerCase())) match = false;
        }

        if (match && filters.emotion !== "ALL") {
            const hasEmotion = call.emotions?.some(e => e.emotion === filters.emotion);
            if (!hasEmotion) match = false;
        }

        if (match && filters.type !== "ALL") {
            const typeMatch = (call.type?.toLowerCase() === filters.type.toLowerCase()) ||
                (call.title?.toLowerCase().includes(filters.type.toLowerCase()));
            if (!typeMatch) match = false;
        }

        if (match && filters.severity !== "ALL") {
            if (call.severity !== filters.severity) match = false;
        }

        if (match) acc[key] = call;
        return acc;
    }, {} as Record<string, Call>);

    const { center, zoom } = useMemo(() => {
        if (selectedId && data[selectedId]) {
            const call = data[selectedId];
            if (call.location_coords) {
                return { center: call.location_coords, zoom: 15 };
            }
        }

        if (filters.city !== "ALL") {
            const firstCallInCity = Object.values(filteredData).find(c =>
                c.location_name?.toLowerCase().includes(filters.city.toLowerCase()) && c.location_coords
            );
            if (firstCallInCity) {
                return { center: firstCallInCity.location_coords!, zoom: 10 };
            }
            if (CITY_COORDS[filters.city]) {
                return { center: CITY_COORDS[filters.city], zoom: 10 };
            }
        }

        const stateObj = US_STATES.find(s => s.code === filters.stateCode);
        if (stateObj && stateObj.coords) {
            return {
                center: stateObj.coords,
                zoom: filters.stateCode === "ALL" ? 4 : 6
            };
        }

        return { center: { lat: 39.8283, lng: -98.5795 }, zoom: 4 };
    }, [filters.stateCode, filters.city, selectedId, data, filteredData]);


    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        setCity(newFilters.stateCode);
    };

    const handleHeaderCityChange = (newCity: string) => {
        setCity(newCity);
        setFilters(prev => ({ ...prev, stateCode: newCity, city: "ALL", severity: "ALL" }));
    };


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

    const [isManualMode, setIsManualMode] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isOnHold, setIsOnHold] = useState(false);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);

    const startStreaming = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0 && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64data = (reader.result as string).split(',')[1];
                        wsRef.current!.send(JSON.stringify({
                            event: "audio_relay",
                            chunk: base64data
                        }));
                    };
                    reader.readAsDataURL(event.data);
                }
            };

            mediaRecorder.start(250); // 250ms chunks
        } catch (err) {
            console.error("Error accessing microphone:", err);
            toast({ title: "Microphone Error", description: "Could not access microphone." });
        }
    };

    const stopStreaming = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            mediaRecorderRef.current = null;
        }
    };

    const toggleMute = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getAudioTracks().forEach(track => {
                track.enabled = isMuted; // If currently muted (true), enable track (true)
            });
            setIsMuted(!isMuted);
            toast({
                title: isMuted ? "Microphone Unmuted" : "Microphone Muted",
                description: isMuted ? "Caller can hear you." : "Caller cannot hear you."
            });
        }
    };

    const toggleHold = () => {
        setIsOnHold(!isOnHold);
        // In a real app, send "hold" event to server
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                event: "hold_toggle",
                active: !isOnHold
            }));
        }
        toast({
            title: !isOnHold ? "Call Placed on Hold" : "Call Resumed",
            description: !isOnHold ? "Music on hold active." : "You are live again."
        });
    };

    const handleTransfer = (id: string) => {
        const newState = !isManualMode;
        setIsManualMode(newState);

        // Reset states on toggle
        setIsMuted(false);
        setIsOnHold(false);

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                event: "manual_mode_toggle",
                active: newState
            }));
        }

        if (newState) {
            startStreaming();
            toast({ title: "Manual Mode Active", description: "You are now live with the caller." });
        } else {
            stopStreaming();
            toast({ title: "AI Resumed", description: "Returned to automated dispatch." });
        }
    };

    const handleHangup = () => {
        stopStreaming();
        setIsManualMode(false);
        setIsMuted(false);
        setIsOnHold(false);

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                event: "hangup"
            }));
        }

        // Update local state to disconnected
        if (selectedId && data[selectedId]) {
            setData(prev => ({
                ...prev,
                [selectedId]: {
                    ...prev[selectedId],
                    status: "Disconnected",
                    severity: "RESOLVED"
                }
            }));
        }

        toast({ title: "Call Ended", description: "Disconnected from caller.", variant: "destructive" });
    };

    // Removed redundant useEffect causing 'setCenter' error - useMemo handles this logic.

    // Sync state dropdown with selected call location
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

    // WebSocket Connection Logic
    const connectWs = () => {
        if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
            return;
        }

        const url = getWsUrl();
        console.log("Connecting to WebSocket:", url);
        const socket = new WebSocket(url);
        wsRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket connected");
            setConnected(true);
            // toast({ title: "System Online", description: "Connected to Server" });
            socket.send(JSON.stringify({ event: "get_db" }));
        };

        socket.onmessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data) as ServerMessage;

            if (message.event === "ai_response") {
                console.log("Received AI response", message);
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

                if (selectedId !== "live_session_1") {
                    setSelectedId("live_session_1");
                }
            } else if (message.event === "incoming_call") {
                console.log("Incoming Call Received:", message);
                setData(prevData => {
                    const liveCallId = "live_session_1";
                    return {
                        ...prevData,
                        [liveCallId]: {
                            ...emptyCall,
                            id: liveCallId,
                            title: "Incoming 911 Call",
                            name: `Caller ${(message as any).phone || "Unknown"}`,
                            severity: "CRITICAL",
                            location_name: (message as any).location_manual,
                            type: "Emergency",
                            time: (message as any).timestamp || new Date().toISOString(),
                            transcript: [{ role: "assistant", content: "911 dispatch connected. Tracking location..." }],
                            status: "Connected",
                            responder_type: "AI Agent"
                        }
                    };
                });
                setSelectedId("live_session_1");
                toast({
                    title: "Incoming Emergency Call",
                    description: `Call from ${(message as any).location_manual}`,
                    variant: "destructive"
                });
            } else if (message.data) {
                setData(message.data);
            } else if (message.event === "audio_relay" && (message as any).chunk) {
                try {
                    const audio = new Audio("data:audio/webm;base64," + (message as any).chunk);
                    audio.play().catch(e => console.error("Audio Playback Error:", e));
                } catch (e) {
                    console.error("Audio Init Error:", e);
                }
            }
        };

        socket.onclose = () => {
            console.log("WebSocket Disconnected. Reconnecting in 3s...");
            setConnected(false);
            wsRef.current = null;
            reconnectTimeoutRef.current = setTimeout(connectWs, 3000);
        };

        socket.onerror = (error) => {
            console.error("WebSocket Error:", error);
            socket.close(); // Force close to trigger simple reconnect logic
        };
    };

    useEffect(() => {
        connectWs();
        return () => {
            if (wsRef.current) wsRef.current.close();
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };
    }, []);

    return (
        <div className="flex h-full flex-col space-y-1 selection:bg-blue-500/30">
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-xl flex justify-between items-center pr-4">
                <Header connected={connected} city={city} setCity={handleHeaderCityChange} filters={filters} />
                <div className="flex space-x-2">
                    {!connected && (
                        <Button onClick={forceReconnect} variant="outline" size="sm" className="h-8 text-[10px] bg-red-900/20 text-red-500 border-red-900/50">
                            Reconnect
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-1 space-x-1 overflow-hidden">
                {/* Column 1: Emergency Feed */}
                <div className="w-[360px] flex-shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 shadow-xl">
                    <EventPanel
                        data={filteredData}
                        selectedId={selectedId || undefined}
                        handleSelect={handleSelect}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        countersData={data}
                    />
                </div>

                {/* Column 2: Map Workspace */}
                <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/20 shadow-2xl">
                    <Map
                        center={center}
                        zoom={zoom}
                        selectedCoordinates={
                            selectedId && data[selectedId]?.location_coords
                                ? [data[selectedId].location_coords?.lat!, data[selectedId].location_coords?.lng!]
                                : undefined
                        }
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
                            "absolute right-0 top-4 z-[1000] flex items-center transition-all duration-300 ease-in-out",
                            isOverlayOpen ? "translate-x-0" : "translate-x-[calc(100%-44px)]"
                        )}>
                            <div className="flex flex-row items-center space-x-1">
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
                                            <ScrollArea className="max-h-60 pr-2">
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
                        handleResolve={handleResolve} // Passing resolve handler to unified sidebar
                        isManualMode={isManualMode}
                        toggleMute={toggleMute}
                        toggleHold={toggleHold}
                        isMuted={isMuted}
                        isOnHold={isOnHold}
                        handleHangup={handleHangup}
                    />
                </div>
            </div>
        </div>
    );
};

export default Page;
