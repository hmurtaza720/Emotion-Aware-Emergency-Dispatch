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

const Header = ({ connected, city, setCity }: { connected: boolean; city: string; setCity: (city: string) => void }) => {
    const [time, setTime] = useState("");

    const selectedState = US_STATES.find(s => s.code === city) || US_STATES[4]; // Default to CA

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
                            {tzName} — {selectedState.name}
                        </span>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-700" />
                    <Select defaultValue={city} onValueChange={setCity}>
                        <SelectTrigger className="h-[36px] w-[180px] rounded-lg border-slate-700 bg-slate-800 text-xs font-bold uppercase tracking-wider text-slate-200 hover:border-blue-500/50 transition-all focus:ring-1 focus:ring-blue-500/50">
                            <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] border-slate-700 bg-slate-900 text-slate-200">
                            {US_STATES.map((state) => (
                                <SelectItem key={state.code} value={state.code} className="text-xs font-bold uppercase tracking-wider focus:bg-blue-600/20 focus:text-blue-400">
                                    {state.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};

export default Header;
