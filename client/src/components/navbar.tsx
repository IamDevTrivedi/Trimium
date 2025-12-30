"use client";

import { FloatingNav } from "@/components/ui/floating-navbar";
import { useUserStore } from "@/store/user-store";
import {
    HomeIcon,
    MessageCircleIcon,
    StarIcon,
    UserIcon,
    LogInIcon,
    UserPlusIcon,
    LogOutIcon,
    LayoutDashboardIcon,
    QrCodeIcon,
} from "lucide-react";

export function Navbar() {
    const { isLoggedIn } = useUserStore();

    let navItems = [
        {
            name: "Home",
            link: "/",
            icon: <HomeIcon className="size-4" />,
        },
        {
            name: "Features",
            link: "/features",
            icon: <StarIcon className="size-4" />,
        },
        {
            name: "QR Generator",
            link: "/qr-generator",
            icon: <QrCodeIcon className="size-4" />,
        },
        {
            name: "Contact",
            link: "/contact-us",
            icon: <MessageCircleIcon className="size-4" />,
        },
        {
            name: "Account",
            link: "/account",
            icon: <UserIcon className="size-4" />,
        },
        {
            name: "Login",
            link: "/login",
            icon: <LogInIcon className="size-4" />,
        },
        {
            name: "Create Account",
            link: "/create-account",
            icon: <UserPlusIcon className="size-4" />,
        },
    ];

    if (isLoggedIn) {
        navItems = navItems.filter(
            (item) => item.name !== "Login" && item.name !== "Create Account"
        );
        navItems.push(
            {
                name: "Workspaces",
                link: "/w",
                icon: <LayoutDashboardIcon className="size-4" />,
            },
            {
                name: "Logout",
                link: "/logout",
                icon: <LogOutIcon className="size-4" />,
            }
        );
    }

    return (
        <div className="relative w-full">
            <FloatingNav navItems={navItems} />
        </div>
    );
}
