"use client";

import { useState } from "react";
import { CallProps } from "@/app/live/page";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    ArrowLeftRightIcon,
    CheckCircle2Icon,
    HeadsetIcon,
    Loader2Icon,
    Ambulance,
    FireExtinguisher,
    Siren,
    Info,
    History,
    Play,
    Pause,
    Volume2,
} from "lucide-react";

import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import ChatInterface from "./ChatInterface";
import EmotionCard from "./EmotionCard";

interface TranscriptPanelProps extends CallProps {
    handleTransfer: (id: string) => void;
    handleResolve: (id: string) => void;
    mode?: "live" | "archive";
}

const TranscriptPanel = ({
    call,
    selectedId,
    handleTransfer,
    handleResolve,
    mode = "live",
}: TranscriptPanelProps) => {
    const [transferred, setTransferred] = useState(false);
    const [loading, setLoading] = useState(false);
    const [clicked, setClicked] = useState<number>(1);
    const { toast } = useToast();

    const emotions = call?.emotions?.sort((a, b) =>
        a.intensity < b.intensity ? 1 : -1,
    );

    if (!call) {
        return (
            <div className="flex h-full items-center justify-center bg-slate-900/50 text-slate-500 italic">
                Select an incident to view details
            </div>
        );
    }

    const doTransfer = (id: string) => {
        handleTransfer(id);
        setLoading(true);

        setTimeout(() => {
            setTransferred(true);
            setLoading(false);
        }, 1000);
    };

    return (
        <div className={cn("flex flex-col h-full bg-slate-900", transferred && "brightness-90")}>
            {/* 1. Header & Live Connection Status */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/50">
                <div className="flex items-center space-x-2">
                    <History size={16} className="text-blue-400" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Action Sidebar</p>
                </div>
                <div className="flex items-center space-x-2 rounded-full bg-green-500/10 px-2 py-0.5 border border-green-500/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-500 uppercase">Live Feed</span>
                </div>
            </div>
            <Separator className="bg-slate-800" />

            <div className="flex flex-1 flex-col space-y-4 p-4 overflow-hidden">
                {/* 2. Live Voice Log (Fill Remaining) */}
                <div className="flex-1 flex flex-col min-h-0 rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                    <div className="flex items-center justify-between bg-slate-900/80 px-4 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Voice Log Transcript</p>
                        <div className="flex items-center space-x-1.5">
                            {transferred ? (
                                <div className="flex items-center space-x-1 text-blue-400">
                                    <HeadsetIcon size={10} />
                                    <span className="text-[9px] font-bold uppercase">Human Opt</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-1 text-green-400">
                                    <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[9px] font-bold uppercase">AI Active</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden p-1">
                        <ChatInterface call={call} selectedId={selectedId} />
                    </div>
                </div>

                {/* 6. Call Recording (Archive Mode Only) */}
                {mode === "archive" && (
                    <div className="pt-2 space-y-2">
                        <div className="flex items-center justify-between pb-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                                <Volume2 size={12} className="text-blue-400" /> Call Recording
                            </label>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">0:12 / 0:45</span>
                        </div>
                        <div className="flex items-center space-x-3 rounded-xl bg-slate-950/60 p-3 border border-slate-800 group hover:border-blue-500/30 transition-colors">
                            <button className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-90">
                                <Play size={18} fill="currentColor" />
                            </button>
                            <div className="flex-1 space-y-1">
                                <div className="h-1.5 w-full rounded-full bg-slate-800 relative overflow-hidden group-hover:bg-slate-700 transition-colors">
                                    <div className="absolute top-0 left-0 h-full w-[35%] bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                </div>
                                <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                            <div key={i} className={cn("w-0.5 rounded-full bg-blue-500/40", i < 4 ? "h-2" : "h-1")} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 7. Critical Action Button (Bottom) */}
                <div className="pt-2">
                    {transferred ? (
                        <Button
                            variant={"outline"}
                            className="pointer-events-none w-full h-12 space-x-2 border-slate-700 bg-slate-800 text-slate-500 font-bold uppercase tracking-widest"
                        >
                            <HeadsetIcon size={18} /> <p>Transfer Complete</p>
                        </Button>
                    ) : loading ? (
                        <Button className="w-full h-12 bg-slate-800 text-blue-400 gap-2 font-bold uppercase tracking-widest border border-blue-500/20">
                            <Loader2Icon className="animate-spin" size={18} />
                            <p>Connecting...</p>
                        </Button>
                    ) : (
                        <Button
                            onClick={() => doTransfer(call.id)}
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold uppercase tracking-widest shadow-xl hover:from-blue-500 hover:to-indigo-500 transition-all transform active:scale-95"
                        >
                            <ArrowLeftRightIcon size={18} /> <p className="ml-2">Transfer to Human</p>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TranscriptPanel;
