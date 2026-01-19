"use client";

import { NoiseBackground } from "@/components/ui/noise-background";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/geist/slider";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight, Sparkles, Zap, Star, Heart, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function NoiseBackgroundDemoPage() {
  return (
    <div className="min-h-screen bg-[var(--ds-background-100)] p-8">
      <div className="mx-auto max-w-4xl space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <Link
            href="/demo"
            className="text-sm text-[var(--ds-gray-600)] hover:text-[var(--ds-gray-900)] transition-colors duration-150"
          >
            ← Back to demos
          </Link>
          <h1 className="text-3xl font-semibold text-[var(--ds-gray-1000)]">
            Noise Background
          </h1>
          <p className="text-[var(--ds-gray-600)]">
            Animated gradient background with noise texture overlay and spring-based motion from Aceternity UI.
          </p>
        </div>

        {/* Example 1: Card with Image */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-[var(--ds-gray-900)]">Card with Image</h2>
          <div className="mx-auto max-w-sm">
            <NoiseBackground
              gradientColors={[
                "rgb(255, 100, 150)",
                "rgb(100, 150, 255)",
                "rgb(255, 200, 100)",
              ]}
            >
              <Card className="border-0 shadow-none" radius="md">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop"
                  alt="Abstract gradient"
                  className="h-48 w-full rounded-t-md object-cover"
                />
                <CardHeader>
                  <CardTitle>How to create a bento grid</CardTitle>
                  <CardDescription>
                    Learn how to create a bento grid with Tailwind CSS and Framer Motion.
                  </CardDescription>
                </CardHeader>
              </Card>
            </NoiseBackground>
          </div>
        </section>

        {/* Example 2: Pill Button */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-[var(--ds-gray-900)]">Pill Button</h2>
          <div className="flex justify-center">
            <NoiseBackground
              containerClassName="w-fit p-1.5 rounded-full"
              gradientColors={[
                "rgb(255, 100, 150)",
                "rgb(100, 150, 255)",
                "rgb(255, 200, 100)",
              ]}
            >
              <Button variant="secondary" radius="full" className="gap-2">
                Start publishing
                <ArrowRight className="h-4 w-4" />
              </Button>
            </NoiseBackground>
          </div>
        </section>

        {/* Example 3: Color Variations */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-[var(--ds-gray-900)]">Color Variations</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <FeatureCard
              colors={["rgb(139, 92, 246)", "rgb(59, 130, 246)", "rgb(147, 51, 234)"]}
              icon={<Sparkles className="h-5 w-5 text-[var(--ds-purple-600)]" />}
              iconBg="bg-[var(--ds-purple-100)]"
              title="AI Powered"
              description="Intelligent automation"
            />
            <FeatureCard
              colors={["rgb(16, 185, 129)", "rgb(20, 184, 166)", "rgb(34, 197, 94)"]}
              icon={<Zap className="h-5 w-5 text-[var(--ds-green-600)]" />}
              iconBg="bg-[var(--ds-green-100)]"
              title="Lightning Fast"
              description="Optimized performance"
            />
            <FeatureCard
              colors={["rgb(251, 146, 60)", "rgb(250, 204, 21)", "rgb(245, 158, 11)"]}
              icon={<Star className="h-5 w-5 text-[var(--ds-amber-600)]" />}
              iconBg="bg-[var(--ds-amber-100)]"
              title="Premium"
              description="Enterprise features"
            />
          </div>
        </section>

        {/* Example 4: Full Width Banner */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-[var(--ds-gray-900)]">Full Width Banner</h2>
          <NoiseBackground
            containerClassName="p-1"
            gradientColors={[
              "rgb(236, 72, 153)",
              "rgb(239, 68, 68)",
              "rgb(249, 115, 22)",
            ]}
            speed={0.15}
          >
            <Card className="border-0 shadow-none bg-[var(--ds-background-100)]" radius="md">
              <CardContent className="flex flex-col items-center gap-4 py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ds-red-100)]">
                  <Heart className="h-6 w-6 text-[var(--ds-red-600)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--ds-gray-900)]">
                  Join 10,000+ happy customers
                </h3>
                <p className="max-w-md text-center text-sm text-[var(--ds-gray-600)]">
                  Start your free trial today and see why thousands of businesses trust us.
                </p>
                <div className="flex gap-3">
                  <Button>Get Started Free</Button>
                  <Button variant="outline">Learn More</Button>
                </div>
              </CardContent>
            </Card>
          </NoiseBackground>
        </section>

        {/* Example 5: Subtle Version */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-[var(--ds-gray-900)]">Subtle Version</h2>
          <NoiseBackground
            containerClassName="p-1"
            gradientColors={[
              "rgb(148, 163, 184)",
              "rgb(203, 213, 225)",
              "rgb(100, 116, 139)",
            ]}
            noiseIntensity={0.08}
            speed={0.05}
          >
            <Card className="border-0 shadow-none" radius="md">
              <CardContent className="flex items-start gap-4 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--ds-gray-100)]">
                  <Zap className="h-5 w-5 text-[var(--ds-gray-600)]" />
                </div>
                <div>
                  <h3 className="font-medium text-[var(--ds-gray-900)]">Quick Tip</h3>
                  <p className="mt-1 text-sm text-[var(--ds-gray-600)]">
                    Use <code className="rounded bg-[var(--ds-gray-100)] px-1 py-0.5 text-xs">noiseIntensity</code> and{" "}
                    <code className="rounded bg-[var(--ds-gray-100)] px-1 py-0.5 text-xs">speed</code> props
                    to create subtle effects for professional dashboards.
                  </p>
                </div>
              </CardContent>
            </Card>
          </NoiseBackground>
        </section>

        {/* Example 6: Interactive Controls */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-[var(--ds-gray-900)]">Interactive Controls</h2>
          <InteractiveDemo />
        </section>

        {/* Props Reference */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-[var(--ds-gray-900)]">Props Reference</h2>
          <PropsTable />
        </section>
      </div>
    </div>
  );
}

function FeatureCard({
  colors,
  icon,
  iconBg,
  title,
  description,
}: {
  colors: string[];
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <NoiseBackground containerClassName="p-1" gradientColors={colors}>
      <Card className="border-0 shadow-none h-full" radius="md">
        <CardContent className="flex flex-col items-center gap-3 py-5">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>
            {icon}
          </div>
          <h3 className="font-medium text-[var(--ds-gray-900)]">{title}</h3>
          <p className="text-center text-sm text-[var(--ds-gray-600)]">{description}</p>
        </CardContent>
      </Card>
    </NoiseBackground>
  );
}

function InteractiveDemo() {
  const [animating, setAnimating] = useState(true);
  const [speed, setSpeed] = useState(0.1);
  const [noiseIntensity, setNoiseIntensity] = useState(0.2);

  return (
    <div className="space-y-4">
      <NoiseBackground
        containerClassName="p-1"
        gradientColors={["rgb(99, 102, 241)", "rgb(168, 85, 247)", "rgb(236, 72, 153)"]}
        animating={animating}
        speed={speed}
        noiseIntensity={noiseIntensity}
      >
        <Card className="border-0 shadow-none bg-[var(--ds-background-100)]" radius="md">
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-sm text-[var(--ds-gray-600)]">
              {animating ? "Animation running…" : "Animation paused"}
            </p>
          </CardContent>
        </Card>
      </NoiseBackground>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-6 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAnimating(!animating)}
            className="gap-2"
          >
            {animating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {animating ? "Pause" : "Play"}
          </Button>

          <div className="flex items-center gap-3 min-w-[180px]">
            <Label className="text-[var(--ds-gray-600)] whitespace-nowrap">Speed:</Label>
            <Slider
              value={speed}
              min={0.02}
              max={0.3}
              step={0.02}
              onChange={(val) => setSpeed(val as number)}
              size="sm"
              showValue
              formatValue={(v) => v.toFixed(2)}
            />
          </div>

          <div className="flex items-center gap-3 min-w-[180px]">
            <Label className="text-[var(--ds-gray-600)] whitespace-nowrap">Noise:</Label>
            <Slider
              value={noiseIntensity}
              min={0}
              max={0.5}
              step={0.05}
              onChange={(val) => setNoiseIntensity(val as number)}
              size="sm"
              showValue
              formatValue={(v) => v.toFixed(2)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PropsTable() {
  const props = [
    { name: "gradientColors", type: "string[]", defaultVal: "Pink/Blue/Yellow", desc: "Array of RGB colors for animated gradient layers" },
    { name: "noiseIntensity", type: "number", defaultVal: "0.2", desc: "Opacity of noise texture overlay (0-1)" },
    { name: "speed", type: "number", defaultVal: "0.1", desc: "Animation speed for gradient movement" },
    { name: "animating", type: "boolean", defaultVal: "true", desc: "Enable/disable gradient animation" },
    { name: "backdropBlur", type: "boolean", defaultVal: "false", desc: "Add backdrop blur effect to container" },
    { name: "containerClassName", type: "string", defaultVal: "-", desc: "Class for outer container" },
    { name: "className", type: "string", defaultVal: "-", desc: "Class for content wrapper" },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Prop</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Default</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.map((prop) => (
          <TableRow key={prop.name}>
            <TableCell className="font-mono text-[var(--ds-gray-900)]">{prop.name}</TableCell>
            <TableCell>{prop.type}</TableCell>
            <TableCell>{prop.defaultVal}</TableCell>
            <TableCell>{prop.desc}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
