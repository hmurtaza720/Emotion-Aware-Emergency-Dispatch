"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Headset,
    HeartPulseIcon,
    HomeIcon,
    RadioIcon,
    User2Icon,
    Archive,
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
                <HomeIcon className="hover:text-white cursor-pointer transition-colors" />
                <Link href="/live">
                    <RadioIcon
                        className={cn("hover:text-white transition-colors", pathname == "/live" && "text-blue-500 animate-pulse")}
                    />
                </Link>
                <Link href="/archive">
                    <Archive
                        className={cn("hover:text-white transition-colors", pathname == "/archive" && "text-blue-500")}
                    />
                </Link>
            </div>

            <div className="mt-auto text-slate-400">
                <User2Icon className="hover:text-white cursor-pointer transition-colors" />
            </div>
        </div>
    );
};

export default Sidebar;
