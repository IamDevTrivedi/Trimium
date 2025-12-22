"use client";

import { useUserStore } from "@/store/user-store";
import Link from "next/link";
import React from "react";

export default function page() {
    const { user } = useUserStore();

    React.useEffect(() => {
        console.log(user);
    }, [user]);

    return (
        <div>
            {user ? (
                <h1 className="text-2xl font-bold">You are already logged in.</h1>
            ) : (
                <h1 className="text-2xl font-bold">Please log in to continue.</h1>
            )}

            <Link href="/account">Go to Account Page</Link>
        </div>
    );
}
