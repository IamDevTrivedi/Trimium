"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => {
                    console.log("ServiceWorker registered with scope:", registration.scope);
                })
                .catch((error) => {
                    console.error("ServiceWorker registration failed:", error);
                });
        }
    }, []);

    return null;
}
