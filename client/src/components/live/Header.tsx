"use client";

import { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

import { US_STATES } from "@/data/constants";
import { FilterState } from "./EventPanel";

const Header = ({ connected, city, setCity, filters }: { connected: boolean; city: string; setCity: (city: string) => void; filters?: FilterState }) => {
    const [time, setTime] = useState("");

    const selectedState = US_STATES.find(s => s.code === (filters?.stateCode || city)) || US_STATES[4]; // Default to CA

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString("en-US", {
                timeZone: selectedState.tz,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            }));
        };
        updateTime();
        const intervalId = setInterval(updateTime, 1000);
        return () => clearInterval(intervalId);
    }, [selectedState]);

    const tzName = new Intl.DateTimeFormat('en-US', {
        timeZone: selectedState.tz,
        timeZoneName: 'short'
    }).formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value;

    return (
        <div className="flex h-[60px] w-full items-center border-b border-slate-700 bg-slate-900 px-6 text-white shadow-lg">
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center space-x-4 min-w-[280px]">
                    <span className="text-xl font-black tracking-tighter text-blue-400">EAEDS CONTROL</span>
                    <div className="flex items-center space-x-2 rounded-full bg-slate-800/50 px-3 py-1 border border-slate-700">
                        <div
                            className={cn(
                                "h-2 w-2 rounded-full",
                                connected
                                    ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                                    : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]",
                            )}
                        />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {connected ? "System Online" : "Offline"}
                        </span>
                    </div>
                </div>

                <div className="flex flex-1 justify-center px-8">
                    <div className="relative w-full max-w-[500px]">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Input
                            className="h-9 w-full rounded-full border-slate-700 bg-slate-800/50 pl-10 text-sm text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500/50 transition-all hover:bg-slate-800"
                            placeholder="Search emergencies or map..."
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-6 min-w-[320px] justify-end">
                    <div className="flex flex-col items-end">
                        <span className="text-lg font-mono font-medium text-blue-200 tracking-tight leading-none">
                            {time}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            {tzName} — {filters?.city !== "ALL" ? `${filters?.city}, ` : ""}{selectedState.name}
                        </span>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-700" />

                    <div className="flex flex-col items-end px-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Supervised Sector</span>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-blue-400 uppercase tracking-tight">
                                {filters?.city !== "ALL" ? `${filters?.city}, ` : ""}{selectedState.name}
                            </span>
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
