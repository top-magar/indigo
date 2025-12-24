"use client";

import React from "react";
import Link from "next/link";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

const SocialLink = ({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) => (
    <a href={href} className="flex items-center gap-2 group">
        <div className="text-muted-foreground group-hover:text-foreground transition-colors">
            {icon}
        </div>
        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
    </a>
);

export function Footer() {
    return (
        <footer className="bg-background pt-24 pb-0 overflow-hidden border-t border-border flex flex-col justify-between relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-0 mb-32">

                    {/* Left Side: Brand & Copyright */}
                    <div className="flex flex-col space-y-8">
                        <div className="flex items-center gap-2.5">
                            <span className="font-bold text-lg text-foreground tracking-tight">Indigo</span>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>Copyright © {new Date().getFullYear()} Indigo Commerce</p>
                            <p>All rights reserved</p>
                        </div>
                    </div>

                    {/* Right Side: Links Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-16 gap-y-10">

                        {/* Column 1 */}
                        <div className="flex flex-col space-y-4">
                            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
                            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
                        </div>

                        {/* Column 2 */}
                        <div className="flex flex-col space-y-4">
                            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
                            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
                            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Refund Policy</Link>
                        </div>

                        {/* Column 3: Social Icons */}
                        <div className="flex flex-col space-y-4">
                            <SocialLink href="#" label="Twitter" icon={
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            } />
                            <SocialLink href="#" label="LinkedIn" icon={
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" /></svg>
                            } />
                            <SocialLink href="#" label="Facebook" icon={
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            } />
                        </div>
                    </div>
                </div>
            </div>

            {/* Massive Watermark Text */}
            <div className="w-full h-60 md:h-96 flex items-center justify-center overflow-hidden select-none -mb-10">
                <TextHoverEffect text="INDIGO" />
            </div>
        </footer>
    );
}
