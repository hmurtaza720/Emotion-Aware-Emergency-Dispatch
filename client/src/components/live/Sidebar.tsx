"use client";

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
} from "lucide-react";

import { Separator } from "../ui/separator";

const Sidebar = () => {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-16 flex-col items-center rounded-xl border border-slate-700/50 bg-slate-950 pt-4 pb-8 shadow-2xl z-50 mr-1">
            <div className="flex-center aspect-square flex-col rounded-full p-2 hover:bg-slate-800 transition-colors cursor-pointer">
                <Link href="/">
                    <Headset className="m-auto text-blue-400" size={24} />
                </Link>
                <Separator className="mx-3 my-4 w-6 bg-slate-700 p-[1px]" />
            </div>
            <div className="flex flex-col space-y-6 text-slate-400">
                <Link
                    href="/"
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

            <div className="mt-auto text-slate-400">
                <User2Icon className="hover:text-white cursor-pointer transition-colors" />
            </div>
        </div>
    );
};

export default Sidebar;
