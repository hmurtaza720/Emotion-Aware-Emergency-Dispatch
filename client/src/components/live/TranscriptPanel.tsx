import { useState } from "react";
import { CallProps } from "@/app/live/page";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    ArrowLeftRightIcon,
    CheckCircle2Icon,
    HeadsetIcon,
    Loader2Icon,
} from "lucide-react";

import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import ChatInterface from "./ChatInterface";
import EmotionCard from "./EmotionCard";

interface TranscriptPanelProps extends CallProps {
    handleTransfer: (id: string) => void;
}

const TranscriptPanel = ({
    call,
    selectedId,
    handleTransfer,
}: TranscriptPanelProps) => {
    const [transferred, setTransferred] = useState(false);
    const [loading, setLoading] = useState(false);

    const emotions = call?.emotions?.sort((a, b) =>
        a.intensity < b.intensity ? 1 : -1,
    );

    if (!call) {
        return null;
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
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
                "fixed right-0 top-[60px] min-h-[calc(100dvh-60px)] w-[400px] overflow-hidden border-l border-slate-700 bg-slate-900 shadow-2xl",
                transferred && "brightness-90",
            )}
        >
            <div className="flex items-center justify-between px-3 py-2 bg-slate-950/50">
                <p className="text-sm font-bold uppercase tracking-wider text-slate-200">Live Transcript</p>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            </div>
            <Separator className="bg-slate-700" />

            <div className="mb-3 flex h-full flex-col space-y-4 p-2 pb-12">
                <div className="flex items-center space-x-2 rounded-lg border border-slate-700 bg-slate-800/50 p-3">
                    {transferred ? (
                        <HeadsetIcon className="text-blue-400" size={24} />
                    ) : (
                        <CheckCircle2Icon
                            className="text-green-400"
                            size={24}
                        />
                    )}
                    <p
                        className={cn(
                            "text-md font-mono font-semibold",
                            transferred ? "text-blue-400" : "text-green-400",
                        )}
                    >
                        {transferred
                            ? "OPERATOR CONNECTED"
                            : "AI OPERATOR ACTIVE"}
                    </p>
                </div>

                <div className="flex space-x-2">
                    <EmotionCard
                        emotion={
                            emotions && emotions.length > 1
                                ? emotions[0].emotion
                                : "N/A"
                        }
                        percentage={
                            emotions && emotions.length > 1
                                ? emotions[0].intensity * 100
                                : 0
                        }
                        color="bg-purple-500"
                    />
                    <EmotionCard
                        emotion={
                            emotions && emotions.length > 1
                                ? emotions[1].emotion
                                : "N/A"
                        }
                        percentage={
                            emotions && emotions.length > 1
                                ? emotions[1].intensity * 100
                                : 0
                        }
                        color="bg-purple-500"
                    />
                </div>

                <div className="flex-1 overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
                    <div className="bg-slate-900 px-3 py-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            Voice Log
                        </p>
                    </div>
                    <ChatInterface call={call} selectedId={selectedId} />
                </div>

                <div className="mt-auto pt-2">
                    {transferred ? (
                        <Button
                            variant={"outline"}
                            className="pointer-events-none w-full space-x-2 border-slate-600 bg-slate-800 text-slate-400"
                        >
                            <HeadsetIcon /> <p>TRANSFER COMPLETE</p>
                        </Button>
                    ) : loading ? (
                        <Button className="w-full space-x-2 bg-slate-700 text-blue-200">
                            <Loader2Icon className="animate-spin text-blue-400" />
                            <p>CONNECTING...</p>
                        </Button>
                    ) : (
                        <Button
                            onClick={() => doTransfer(call.id)}
                            className="w-full space-x-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg hover:from-blue-500 hover:to-blue-400"
                        >
                            <ArrowLeftRightIcon /> <p>TRANSFER TO HUMAN</p>
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default TranscriptPanel;
