"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Headset,
    HeartPulseIcon,
    Home,
    Radio,
    User2Icon,
    Archive,
    Activity,
    Settings,
    LogOut,
    Bell,
    Mic,
    User,
    ChevronRight,
    Play
} from "lucide-react";

import { Separator } from "../ui/separator";

const Sidebar = () => {
    const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        if (isProfileOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isProfileOpen]);

    return (
        <div className="relative flex h-full w-16 flex-col items-center rounded-xl border border-slate-700/50 bg-slate-950 pt-4 pb-8 shadow-2xl z-50 mr-1">
            <div className="flex-center aspect-square flex-col rounded-full p-2 hover:bg-slate-800 transition-colors cursor-pointer">
                <Link href="/dashboard">
                    <Headset className="m-auto text-blue-400" size={24} />
                </Link>
                <Separator className="mx-3 my-4 w-6 bg-slate-700 p-[1px]" />
            </div>
            <div className="flex flex-col space-y-6 text-slate-400">
                <Link
                    href="/dashboard"
                    className={cn(
                        "group flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/50 text-slate-400 transition-all hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-900/20 active:scale-95",
                        pathname === "/" && "bg-blue-600 text-white shadow-lg shadow-blue-900/20",
                    )}
                >
                    <Home size={20} />
                </Link>

                <Link
                    href="/traffic"
                    className={cn(
                        "group flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/50 text-slate-400 transition-all hover:bg-orange-600 hover:text-white hover:shadow-lg hover:shadow-orange-900/20 active:scale-95",
                        pathname === "/traffic" && "bg-orange-600 text-white shadow-lg shadow-orange-900/20",
                    )}
                >
                    <Activity size={20} />
                </Link>

                <Link
                    href="/live"
                    className={cn(
                        "group flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/50 text-slate-400 transition-all hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-900/20 active:scale-95",
                        pathname === "/live" && "bg-red-600 text-white shadow-lg shadow-red-900/20",
                    )}
                >
                    <Radio size={20} className={cn(pathname === "/live" && "animate-pulse")} />
                </Link>

                <Link
                    href="/archive"
                    className={cn(
                        "group flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/50 text-slate-400 transition-all hover:bg-purple-600 hover:text-white hover:shadow-lg hover:shadow-purple-900/20 active:scale-95",
                        pathname === "/archive" && "bg-purple-600 text-white shadow-lg shadow-purple-900/20",
                    )}
                >
                    <Archive size={20} />
                </Link>
            </div>

            <div className="mt-auto relative" ref={profileRef}>
                <div
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl cursor-pointer transition-all",
                        isProfileOpen ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                    )}
                >
                    <User2Icon size={20} />
                </div>

                {/* Profile Popover */}
                {isProfileOpen && (
                    <div className="absolute left-14 bottom-0 w-64 origin-bottom-left animate-in slide-in-from-left-5 zoom-in-95 duration-200">
                        <div className="rounded-2xl border border-slate-700 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-md ring-1 ring-black/5">

                            {/* User Header */}
                            <div className="flex items-center space-x-3 rounded-xl bg-slate-800/50 p-3 mb-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 font-bold text-white shadow-lg shadow-blue-500/25">
                                    <User size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">Dispatcher Account</span>
                                    <span className="text-[10px] text-green-400 font-medium uppercase tracking-wider flex items-center">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                                        Online
                                    </span>
                                </div>
                            </div>

                            <Separator className="bg-slate-800 mb-2" />

                            <div className="space-y-1">
                                <button className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white">
                                    <div className="flex items-center">
                                        <User size={16} className="mr-3 text-slate-500 transition-colors group-hover:text-blue-400" />
                                        Profile
                                    </div>
                                </button>
                                <button className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white">
                                    <div className="flex items-center">
                                        <Settings size={16} className="mr-3 text-slate-500 transition-colors group-hover:text-blue-400" />
                                        Settings
                                    </div>
                                </button>
                                <button className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white">
                                    <div className="flex items-center">
                                        <Mic size={16} className="mr-3 text-slate-500 transition-colors group-hover:text-blue-400" />
                                        Audio & Voice
                                    </div>
                                    <ChevronRight size={14} className="text-slate-600" />
                                </button>
                                <button className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white">
                                    <div className="flex items-center">
                                        <Bell size={16} className="mr-3 text-slate-500 transition-colors group-hover:text-blue-400" />
                                        Notification Prefs
                                    </div>
                                    <ChevronRight size={14} className="text-slate-600" />
                                </button>
                            </div>

                            <Separator className="bg-slate-800 my-2" />

                            <button className="group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300">
                                <LogOut size={16} className="mr-3" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
