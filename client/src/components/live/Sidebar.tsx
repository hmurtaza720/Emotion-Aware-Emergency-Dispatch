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
} from "lucide-react";

import { Separator } from "../ui/separator";

const Sidebar = () => {
    const pathname = usePathname();

    return (
        <div className="flex w-14 flex-col items-center border-r border-slate-700 bg-slate-950 pt-3 shadow-xl z-50">
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
                <User2Icon className="hover:text-white cursor-pointer transition-colors" />
            </div>
        </div>
    );
};

export default Sidebar;
