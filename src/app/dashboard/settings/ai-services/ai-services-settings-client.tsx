"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  FileSearch,
  Brain,
  BarChart3,
  Bot,
  Cpu,
  CheckCircle,
  Settings,
  ExternalLink,
  ArrowRight,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils";
import type { ServiceInfo, ServiceUsageStats } from "@/types/ai-services";

interface AIService extends ServiceInfo {
  icon: React.ComponentType<{ className?: string }>;
  docsUrl?: string;
}

// Icon mapping for services
const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "indigo-ai": Sparkles,
  "indigo-search": FileSearch,
  "indigo-recommendations": Brain,
  "indigo-insights": BarChart3,
  "indigo-content": Bot,
  "indigo-media": Cpu,
};

function StatusBadge({ status }: { status: ServiceInfo["status"] }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "text-xs",
        status === "active" && "bg-[var(--ds-green-100)] text-[var(--ds-green-800)]",
        status === "setup_required" && "bg-[var(--ds-amber-100)] text-[var(--ds-amber-800)]",
        status === "disabled" && "bg-[var(--ds-gray-200)] text-[var(--ds-gray-600)]",
        status === "error" && "bg-[var(--ds-red-100)] text-[var(--ds-red-800)]"
      )}
    >
      {status === "active" && <CheckCircle className="h-3 w-3 mr-1" />}
      {status === "error" && <AlertCircle className="h-3 w-3 mr-1" />}
      {status === "active" ? "Active" : status === "setup_required" ? "Setup Required" : status === "error" ? "Error" : "Disabled"}
    </Badge>
  );
}

function ServiceCard({ service }: { service: AIService }) {
  const Icon = service.icon;

  return (
    <Card className="group hover:border-[var(--ds-gray-300)] transition-colors duration-150">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              service.status === "active" 
                ? "bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
                : "bg-[var(--ds-gray-100)] text-[var(--ds-gray-600)]"
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-medium text-[var(--ds-gray-900)]">
                {service.name}
              </CardTitle>
              <StatusBadge status={service.status} />
            </div>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-sm text-[var(--ds-gray-600)]">
          {service.description}
        </CardDescription>
        <div className="flex flex-wrap gap-1.5">
          {service.features.map((feature) => (
            <Badge
              key={feature}
              variant="secondary"
              className="text-xs bg-[var(--ds-gray-100)] text-[var(--ds-gray-700)] font-normal"
            >
              {feature}
            </Badge>
          ))}
        </div>
        {service.docsUrl && (
          <Link
            href={service.docsUrl}
            className="inline-flex items-center gap-1 text-xs text-[var(--ds-blue-600)] hover:text-[var(--ds-blue-700)] transition-colors"
          >
            View documentation
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export function AIServicesSettingsClient() {
  const [services, setServices] = useState<AIService[]>([]);
  const [usage, setUsage] = useState<ServiceUsageStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      
      // Fetch services status
      const servicesResponse = await fetch('/api/ai-services/status');
      const servicesData = await servicesResponse.json();

      if (!servicesData.success) {
        throw new Error(servicesData.error || 'Failed to fetch services');
      }

      // Map services with icons
      const servicesWithIcons: AIService[] = servicesData.services.map((service: ServiceInfo) => ({
        ...service,
        icon: SERVICE_ICONS[service.id] || Sparkles,
        docsUrl: `/docs/${service.id.replace('indigo-', '')}`
      }));

      setServices(servicesWithIcons);

      // Fetch usage statistics
      const usageResponse = await fetch('/api/ai-services/usage');
      const usageData = await usageResponse.json();

      if (usageData.success) {
        setUsage(usageData.usage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const activeCount = services.filter((s) => s.status === "active").length;

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--ds-gray-1000)]">AI Services</h1>
            <p className="text-sm text-[var(--ds-gray-600)] mt-1">
              Configure Indigo AI services to enhance your store with intelligent features.
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--ds-gray-600)]" />
              <span className="text-sm text-[var(--ds-gray-600)]">Loading AI services...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--ds-gray-1000)]">AI Services</h1>
            <p className="text-sm text-[var(--ds-gray-600)] mt-1">
              Configure Indigo AI services to enhance your store with intelligent features.
            </p>
          </div>
        </div>
        <Card className="border-[var(--ds-red-200)] bg-[var(--ds-red-50)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[var(--ds-red-900)]">
              Error Loading Services
            </CardTitle>
            <CardDescription className="text-[var(--ds-red-700)]">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ds-gray-1000)]">AI Services</h1>
          <p className="text-sm text-[var(--ds-gray-600)] mt-1">
            Configure Indigo AI services to enhance your store with intelligent features.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
          <Badge variant="secondary" className="bg-[var(--ds-green-100)] text-[var(--ds-green-800)]">
            {activeCount}/{services.length} Active
          </Badge>
        </div>
      </div>

      {/* Overview Card */}
      <Card className="bg-gradient-to-br from-[var(--ds-blue-50)] to-[var(--ds-purple-50)] border-[var(--ds-blue-200)]">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--ds-blue-100)]">
              <Sparkles className="h-6 w-6 text-[var(--ds-blue-700)]" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-[var(--ds-gray-900)]">Indigo AI Platform</h2>
              <p className="text-sm text-[var(--ds-gray-600)] mt-1">
                Indigo AI services are powered by advanced machine learning models to help you create better 
                product content, understand your customers, and optimize your store performance.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <Button size="sm" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Explore AI Features
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  View Usage & Billing
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {/* Usage Stats */}
      {usage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Usage This Month</CardTitle>
            <CardDescription>AI service usage and remaining quota</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {usage.slice(0, 3).map((stat) => (
                <div key={stat.serviceId} className="space-y-1">
                  <p className="text-2xl font-semibold text-[var(--ds-gray-900)] tabular-nums">
                    {(stat.current ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-[var(--ds-gray-600)]">{stat.serviceName}</p>
                  <div className="h-1.5 w-full rounded-full bg-[var(--ds-gray-200)]">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        (stat.percentage ?? 0) >= 80 ? "bg-[var(--ds-red-600)]" :
                        (stat.percentage ?? 0) >= 60 ? "bg-[var(--ds-amber-600)]" :
                        "bg-[var(--ds-blue-600)]"
                      )}
                      style={{ width: `${stat.percentage ?? 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-[var(--ds-gray-500)]">
                    {stat.percentage ?? 0}% of {(stat.limit ?? 0).toLocaleString()} limit
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
