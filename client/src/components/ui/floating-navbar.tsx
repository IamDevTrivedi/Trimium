"use client";
import type { JSX } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const FloatingNav = ({
    navItems,
    className,
}: {
    navItems: {
        name: string;
        link: string;
        icon?: JSX.Element;
    }[];
    className?: string;
}) => {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{
                    opacity: 0,
                    y: -20,
                }}
                animate={{
                    y: 0,
                    opacity: 1,
                }}
                transition={{
                    duration: 0.3,
                }}
                className={cn(
                    "flex max-w-fit fixed top-5 inset-x-0 mx-auto border border-border/40 bg-background/90 backdrop-blur-md rounded-full z-50 px-8 py-4 items-center justify-center gap-8 shadow-lg",
                    className
                )}
            >
                {navItems.map((navItem: any, idx: number) => (
                    <Link
                        key={`link=${idx}`}
                        href={navItem.link}
                        className={cn(
                            "relative items-center flex gap-1 text-muted-foreground hover:text-foreground hover:underline hover:underline-offset-2 transition-all duration-500"
                        )}
                    >
                        <span className="block sm:hidden">{navItem.icon}</span>
                        <span className="hidden sm:block text-sm font-medium whitespace-nowrap">
                            {navItem.name}
                        </span>
                    </Link>
                ))}
            </motion.div>
        </AnimatePresence>
    );
};
