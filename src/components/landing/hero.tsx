"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VideoModal } from "@/components/ui/video-modal";
import { FlipWords } from "@/components/ui/flip-words";
import { Play } from "lucide-react";

export function Hero() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [aspectRatio, setAspectRatio] = useState<string>("16/9");

    const handleVideoLoaded = () => {
        if (videoRef.current) {
            const { videoWidth, videoHeight } = videoRef.current;
            if (videoWidth && videoHeight) {
                setAspectRatio(`${videoWidth}/${videoHeight}`);
            }
        }
    };

    return (
        <section
            className="relative z-0 overflow-hidden bg-background w-full"
            style={{ aspectRatio }}
        >
            {/* Video Background */}
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                onLoadedMetadata={handleVideoLoaded}
                className="absolute inset-0 w-full h-full object-cover -z-20"
            >
                <source src="/hero-bg.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-0 flex items-end pb-16 md:pb-24 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

                    {/* Badge - commented out for now
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 border border-white/20 backdrop-blur-sm mb-8 animate-fade-in-up cursor-default hover:border-white/40 transition-colors">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--ds-green-600)] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--ds-green-600)]"></span>
                    </span>
                    <span className="text-sm font-medium text-white">🎉 Join 12,000+ Nepali businesses already selling online</span>
                    <ArrowRight className="w-3 h-3 text-white/70 ml-1" />
                </div>
                */}

                    {/* Heading */}
                    <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-white mb-6 max-w-5xl animate-fade-in-up delay-100 leading-[1.1] text-left drop-shadow-lg">
                        Launch Your Online Store <br className="hidden md:block" />
                        <FlipWords
                            words={["In Minutes, Not Months", "Without Writing Code", "And Start Selling Today", "The Smart Way"]}
                            duration={3000}
                            className="text-white"
                        />
                    </h1>

                    {/* Subheading */}
                    <p className="text-xl text-white/80 mb-10 max-w-2xl animate-fade-in-up delay-200 leading-relaxed text-left drop-shadow-md">
                        Turn your passion into a thriving online business. Start selling today.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
                        <Link href="/login">
                            <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-white text-black hover:bg-white/90 shadow-lg shadow-white/20 hover:shadow-white/40 hover:scale-105 transition-all duration-300">
                                Start Selling
                            </Button>
                        </Link>
                        <VideoModal trigger={
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50 group">
                                <Play strokeWidth={2} className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> See How It Works
                            </Button>
                        } />
                    </div>

                </div>
            </div>
        </section>
    );
}
