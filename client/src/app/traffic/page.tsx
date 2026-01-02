"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MESSAGES } from "@/data/mock_data";
import { Call } from "@/data/types";
import Sidebar from "@/components/live/Sidebar";
import { MoreHorizontal, MessageSquare, Monitor, X, Phone, User, Bot, Clock } from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Dynamic import for Map to avoid SSR issues
const Map = dynamic(() => import("@/components/live/map/Map"), {
    loading: () => <div className="h-full w-full animate-pulse bg-slate-800" />,
    ssr: false,
});

const TrafficPage = () => {
    const calls = Object.values(MESSAGES);
    // Default to the first call to "lock" the view open
    const [selectedCallId, setSelectedCallId] = useState<string | null>(calls.length > 0 ? calls[0].id : null);

    const selectedCall = selectedCallId ? MESSAGES[selectedCallId] : null;

    // Helper to format time (mocking timezone for now)
    const formatTime = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
                timeZone: "America/Los_Angeles", // Mock PST/PDT as requested
                timeZoneName: "short"
            });
        } catch (e) {
            return "Unknown";
        }
    };

    return (
        <div className="flex h-full flex-col overflow-hidden text-slate-200 font-sans selection:bg-blue-500/30">
            {/* Header */}
            <header className="m-4 flex h-16 items-center rounded-2xl border border-slate-800 bg-slate-900/50 px-6 backdrop-blur shadow-lg">
                <h1 className="text-xl font-bold tracking-tight text-white">Traffic Control</h1>
                <div className="ml-auto flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span>{calls.length} Active Calls</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content Area (Table) */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/40 shadow-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900/80 text-xs uppercase text-slate-500 font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Caller Name</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Chatting With</th>
                                    <th className="px-6 py-4">Time Initiated</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {calls.map((call) => (
                                    <tr
                                        key={call.id}
                                        onClick={() => setSelectedCallId(call.id)}
                                        className={cn(
                                            "group cursor-pointer transition-colors hover:bg-slate-800/50",
                                            selectedCallId === call.id ? "bg-slate-800/80" : ""
                                        )}
                                    >
                                        {/* Name */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-bold">
                                                    {call.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-slate-200">{call.name}</span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    call.status === "Connected" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-slate-600"
                                                )} />
                                                <span className={cn(
                                                    "font-medium",
                                                    call.status === "Connected" ? "text-green-400" : "text-slate-500"
                                                )}>
                                                    {call.status}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Chatting With */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2 text-slate-300">
                                                {call.responder_type === "AI" ? (
                                                    <Bot size={16} className="text-purple-400" />
                                                ) : (
                                                    <User size={16} className="text-orange-400" />
                                                )}
                                                <span>{call.agent_name || "Unknown"}</span>
                                            </div>
                                        </td>

                                        {/* Time */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2 text-slate-400">
                                                <Clock size={16} />
                                                <span className="font-mono">{formatTime(call.time)}</span>
                                            </div>
                                        </td>


                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/live?callId=${call.id}`}
                                                className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-lg shadow-blue-900/20"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Monitor size={14} className="mr-1.5" />
                                                Supervise
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Details Sidebar (Right) */}
                {selectedCall && (
                    <div className="m-4 ml-0 w-80 flex flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md animate-in slide-in-from-right-10 duration-200 relative">
                        {/* Locked view: Close button removed */}

                        <h2 className="text-lg font-bold text-white mb-1">Call Details</h2>
                        <p className="text-sm text-slate-400 mb-6 font-mono">ID: #{selectedCall.id}</p>

                        {/* Mini Map */}
                        <div className="mb-6 h-48 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950 relative shadow-inner">
                            {selectedCall.location_coords ? (
                                <Map
                                    center={selectedCall.location_coords}
                                    zoom={13}
                                    pins={[{
                                        coordinates: [selectedCall.location_coords.lat, selectedCall.location_coords.lng],
                                        popupHtml: `<b>${selectedCall.name}</b><br>${selectedCall.location_name}`
                                    }]}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-slate-600 text-xs italic">
                                    Location Unknown
                                </div>
                            )}
                        </div>


                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xs font-bold uppercase text-slate-500 mb-1">Subject</h3>
                                <p className="text-sm font-medium text-slate-200">{selectedCall.title}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold uppercase text-slate-500 mb-1">Location</h3>
                                <p className="text-sm text-slate-300">{selectedCall.location_name}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold uppercase text-slate-500 mb-1">Caller Phone</h3>
                                <div className="flex items-center space-x-2 text-sm text-slate-300">
                                    <Phone size={14} />
                                    <span>{selectedCall.phone}</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold uppercase text-slate-500 mb-1">Summary</h3>
                                <p className="text-xs leading-relaxed text-slate-400 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                                    {selectedCall.summary}
                                </p>
                            </div>
                        </div>

                        <div className="mt-auto pt-6">
                            <Link
                                href={`/live?callId=${selectedCall.id}`}
                                className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition-all hover:bg-blue-500 shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
                            >
                                <Monitor size={16} className="mr-2" />
                                Take Over Supervision
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrafficPage;
