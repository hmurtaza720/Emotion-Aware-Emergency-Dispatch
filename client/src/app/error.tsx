"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-white text-black">
            <h2 className="text-2xl font-bold">Something went wrong!</h2>
            <p className="text-gray-500">{error.message || "Unknown error"}</p>
            <Button onClick={() => reset()}>Try again</Button>
        </div>
    );
}
