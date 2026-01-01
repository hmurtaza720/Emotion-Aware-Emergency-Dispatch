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

const Header = ({ connected, city, setCity }: { connected: boolean; city: string; setCity: (city: string) => void }) => {
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            // Default to PDT/PST for the demo cities
            setTime(now.toLocaleTimeString("en-US", { timeZone: "America/Los_Angeles" }));
        };
        updateTime();
        const intervalId = setInterval(updateTime, 1000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex h-[60px] w-full items-center border-b-2 border-slate-700 bg-slate-900 px-7 text-white shadow-lg">
            <div className="flex-between w-full text-sm font-bold uppercase tracking-widest">
                <div className="flex items-center space-x-3">
                    <div className="flex flex-col leading-tight">
                        <span className="text-lg font-black text-blue-400">EAEDS CONTROL</span>
                    </div>
                    <div className="h-6 w-[1px] bg-slate-700 mx-4" /> {/* Separator */}
                    <div
                        className={cn(
                            "h-2 w-2 rounded-full animate-pulse",
                            connected
                                ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                                : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]",
                        )}
                    />
                    <span className="text-xs text-slate-400">
                        {connected ? "SYSTEM ONLINE" : "DISCONNECTED"}
                    </span>
                </div>

                <div className="flex-center space-x-4 font-mono font-medium text-slate-300">
                    <p className="text-blue-200">{time} PDT</p>
                    <div className="uppercase">
                        <Select defaultValue={city} onValueChange={setCity}>
                            <SelectTrigger className="h-[30px] min-h-0 w-[200px] rounded-sm border-[1px] border-slate-600 bg-slate-800 py-0 uppercase text-slate-200 hover:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder="Location" />
                            </SelectTrigger>
                            <SelectContent className="border-slate-700 bg-slate-900 uppercase text-slate-200">
                                <SelectItem value="SF" className="focus:bg-slate-800 focus:text-blue-400">
                                    San Francisco, CA
                                </SelectItem>
                                <SelectItem value="BER" className="focus:bg-slate-800 focus:text-blue-400">
                                    Berkeley, CA
                                </SelectItem>
                                <SelectItem value="OAK" className="focus:bg-slate-800 focus:text-blue-400">
                                    Oakland, CA
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
