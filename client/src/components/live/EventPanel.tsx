import { ChangeEvent, useEffect, useState } from "react";
import { Call } from "@/app/live/page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Search, ShieldCheck } from "lucide-react";

interface EventPanelProps {
    data: Record<string, Call> | undefined;
    selectedId: string | undefined;
    handleSelect: (id: string) => void;
    title?: string;
    showCounters?: boolean;
}

const EventPanel = ({
    data,
    selectedId,
    handleSelect,
    title = "Emergencies",
    showCounters = true
}: EventPanelProps) => {
    const [search, setSearch] = useState("");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.currentTarget.value);
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 px-3 py-4">
            <div className="mb-4 mt-2 flex items-center justify-between px-3">
                <h2 className="text-xl font-bold uppercase tracking-wider text-blue-400">{title}</h2>
                {showCounters && (
                    <div className="flex space-x-2 text-xs font-mono text-slate-500">
                        <span>LIVE FEED</span>
                        <div className="h-4 w-4 rounded-full bg-red-500/20 p-1">
                            <div className="h-full w-full animate-ping rounded-full bg-red-500" />
                        </div>
                    </div>
                )}
            </div>

            <div className="mb-6 px-2">
                <Input
                    className="w-full border-slate-700 bg-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-blue-500"
                    placeholder="Refine Sector Search..."
                    startIcon={Search}
                    onChange={handleChange}
                />
            </div>

            {showCounters && (
                <div className="mb-6 flex justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4 mx-2">
                    <div className="text-center">
                        <div className="text-2xl font-black text-slate-200">
                            {data ? Object.keys(data).length : "-"}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total</div>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-700" />
                    <div className="text-center">
                        <div className="text-2xl font-black text-red-500 animate-pulse">
                            {data
                                ? Object.entries(data).filter(
                                    ([_, value]) => value.severity === "CRITICAL",
                                ).length
                                : "-"}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Critical</div>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-700" />
                    <div className="text-center">
                        <div className="text-2xl font-black text-green-500">
                            {data
                                ? Object.entries(data).filter(
                                    ([_, value]) => value.severity === "RESOLVED",
                                ).length
                                : "-"}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Resolved</div>
                    </div>
                </div>
            )}

            <div className="h-[calc(100vh-320px)] space-y-3 overflow-y-auto px-1 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
                {data &&
                    Object.entries(data)
                        .filter(([_, emergency]) =>
                            emergency.title?.includes(search),
                        )
                        .sort(([_, a], [__, b]) =>
                            new Date(a.time) < new Date(b.time) ? 1 : -1,
                        )
                        .map(([_, emergency]) => (
                            <Card
                                key={emergency.id}
                                className={cn(
                                    "relative m-1 flex cursor-pointer items-center border-l-4 p-4 transition-all hover:bg-slate-800",
                                    "bg-slate-900 border-y border-r border-slate-800",
                                    selectedId === emergency.id
                                        ? "border-l-blue-500 bg-slate-800 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]"
                                        : emergency.severity === "CRITICAL" ? "border-l-red-500" : "border-l-slate-600",
                                )}
                                onClick={() => handleSelect(emergency.id)}
                            >
                                {emergency.severity === "CRITICAL" && (
                                    <AlertCircle className="mr-4 h-6 w-6 text-red-500" />
                                )}
                                {emergency.severity === "MODERATE" && (
                                    <AlertTriangle className="mr-4 h-6 w-6 text-orange-500" />
                                )}
                                {emergency.severity === "RESOLVED" && (
                                    <ShieldCheck className="mr-4 h-6 w-6 text-green-500" />
                                )}
                                <CardContent className="flex-grow p-0">
                                    <div className={cn("text-sm font-bold uppercase tracking-wide", selectedId === emergency.id ? "text-blue-400" : "text-slate-200")}>
                                        {emergency.title}
                                    </div>
                                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                                        <span className="font-mono" suppressHydrationWarning>
                                            {new Date(emergency.time).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </CardContent>
                                {emergency.severity ? (
                                    <Badge
                                        className={cn(
                                            "ml-2 min-w-fit rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider",
                                            emergency.severity === "CRITICAL"
                                                ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                                : "bg-green-500/10 text-green-500 border border-green-500/20"
                                        )}
                                    >
                                        {emergency.severity}
                                    </Badge>
                                ) : null}
                            </Card>
                        ))}
            </div>
        </div>
    );
};

export default EventPanel;
