"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch((error) => {
                console.error("ServiceWorker registration failed:", error);
            });
        }
    }, []);

    return null;
}
