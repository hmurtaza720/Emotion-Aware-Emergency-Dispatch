"use client";

import React from "react";
import Sidebar from "@/components/live/Sidebar";
import { MESSAGES } from "@/data/mock_data";
import { ARCHIVE_MESSAGES } from "@/data/archiveMessages";
import { Activity, Phone, User, Bot, Siren, Archive as ArchiveIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
    const activeCalls = Object.values(MESSAGES);
    const archivedCalls = Object.values(ARCHIVE_MESSAGES);

    const stats = {
        totalReceived: activeCalls.length + archivedCalls.length,
        aiHandled: activeCalls.filter(c => c.responder_type === 'AI').length,
        humanHandled: activeCalls.filter(c => c.responder_type === 'Human').length,
        criticalActive: activeCalls.filter(c => c.severity === 'CRITICAL').length,
        resolvedArchived: archivedCalls.length
    };

    const StatCard = ({ title, value, icon: Icon, color, subtext }: { title: string, value: number, icon: any, color: string, subtext: string }) => (
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl transition-all hover:bg-slate-900/80 hover:scale-[1.02] group">
            <div className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-xl transition-all group-hover:opacity-20", color)} />
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</h3>
                    <div className="mt-2 flex items-baseline space-x-2">
                        <span className="text-4xl font-bold text-white tracking-tight">{value}</span>
                        <span className="text-xs font-medium text-slate-400">{subtext}</span>
                    </div>
                </div>
                <div className={cn("rounded-xl p-3 bg-slate-950/50 border border-slate-800", color.replace("bg-", "text-"))}>
                    <Icon size={24} />
                </div>
            </div>
            <div className="mt-4 h-1 w-full rounded-full bg-slate-800">
                <div className={cn("h-full rounded-full transition-all duration-1000 ease-out w-[70%]", color)} />
            </div>
        </div>
    );

    return (
        <div className="flex h-screen w-full bg-slate-950 text-slate-200 selection:bg-blue-500/30 font-sans">
            {/* Layout Wrapper to match other pages */}
            <div className="flex h-full w-full p-2">
                <Sidebar />

                <div className="flex flex-1 flex-col space-y-1 ml-1 overflow-hidden">
                    {/* Header */}
                    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 shadow-xl shrink-0">
                        <header className="flex h-16 items-center px-6 backdrop-blur">
                            <h1 className="text-xl font-bold uppercase tracking-wider text-blue-400">Command Dashboard</h1>
                            <div className="ml-auto flex items-center space-x-4">
                                <span className="text-xs font-mono text-slate-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                        </header>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/20 p-8 shadow-inner">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">System Overview</h2>
                            <p className="text-slate-400">Real-time metrics for emergency dispatch operations.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <StatCard
                                title="Total Calls Received"
                                value={stats.totalReceived}
                                icon={Phone}
                                color="bg-blue-500"
                                subtext="All time"
                            />

                            <StatCard
                                title="Active Critical"
                                value={stats.criticalActive}
                                icon={Siren}
                                color="bg-red-600"
                                subtext="Requires Immediate Action"
                            />

                            <StatCard
                                title="Resolved & Archived"
                                value={stats.resolvedArchived}
                                icon={ArchiveIcon}
                                color="bg-purple-600"
                                subtext="Stored in database"
                            />

                            <StatCard
                                title="AI Handled"
                                value={stats.aiHandled}
                                icon={Bot}
                                color="bg-indigo-500"
                                subtext="Autonomous Dispatch"
                            />

                            <StatCard
                                title="Human Operated"
                                value={stats.humanHandled}
                                icon={User}
                                color="bg-orange-500"
                                subtext="Manual Intervention"
                            />

                            <StatCard
                                title="System Status"
                                value={98}
                                icon={Activity}
                                color="bg-green-500"
                                subtext="% Uptime"
                            />
                        </div>

                        {/* Placeholder for future charts or lists */}
                        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-white">Recent Activity</h3>
                                <button className="text-xs text-blue-400 hover:text-blue-300">View All Log</button>
                            </div>
                            <div className="space-y-4">
                                {activeCalls.slice(0, 3).map((call) => (
                                    <div key={call.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-950/50 border border-slate-800/50">
                                        <div className="flex items-center space-x-4">
                                            <div className={cn("h-2 w-2 rounded-full", call.status === "Connected" ? "bg-green-500 animate-pulse" : "bg-slate-500")} />
                                            <div>
                                                <p className="font-medium text-slate-200">{call.title || "Emergency Call"}</p>
                                                <p className="text-xs text-slate-500">{call.location_name}</p>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded",
                                            call.severity === "CRITICAL" ? "bg-red-500/10 text-red-500" : "bg-slate-800 text-slate-400"
                                        )}>
                                            {call.severity || "MODERATE"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
