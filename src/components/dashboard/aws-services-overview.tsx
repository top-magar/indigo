"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  Database,
  Mail,
  Brain,
  Search,
  TrendingUp,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface AWSService {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: "active" | "inactive" | "setup_required";
  provider: "aws" | "local";
  usage?: {
    current: number;
    limit: number;
    unit: string;
  };
  href?: string;
}

const iconMap = {
  Cloud,
  Database,
  Mail,
  Brain,
  Search,
  TrendingUp,
  Shield,
};

interface AWSServicesOverviewProps {
  services: AWSService[];
}

function getStatusBadge(status: AWSService["status"]) {
  switch (status) {
    case "active":
      return (
        <Badge className="h-5 px-2 gap-1 border-0 text-xs bg-[var(--ds-green-100)] text-[var(--ds-green-800)]">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>
      );
    case "setup_required":
      return (
        <Badge className="h-5 px-2 gap-1 border-0 text-xs bg-[var(--ds-amber-100)] text-[var(--ds-amber-800)]">
          <Clock className="h-3 w-3" />
          Setup Required
        </Badge>
      );
    case "inactive":
      return (
        <Badge className="h-5 px-2 gap-1 border-0 text-xs bg-[var(--ds-gray-100)] text-[var(--ds-gray-600)]">
          <AlertCircle className="h-3 w-3" />
          Inactive
        </Badge>
      );
  }
}

function ServiceCard({ service }: { service: AWSService }) {
  const Icon = iconMap[service.icon as keyof typeof iconMap] || Cloud;
  const isAWS = service.provider === "aws";

  return (
    <Card className="relative overflow-hidden border-[var(--ds-gray-200)] hover:border-[var(--ds-gray-300)] transition-all duration-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-[var(--ds-brand-600)]/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-[var(--ds-brand-600)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-[var(--ds-gray-900)] truncate">
                  {service.name}
                </h3>
                <p className="text-xs text-[var(--ds-gray-600)] mt-0.5">
                  {isAWS ? "AWS" : "Local"} Provider
                </p>
              </div>
            </div>
            {getStatusBadge(service.status)}
          </div>

          {/* Description */}
          <p className="text-xs text-[var(--ds-gray-600)] line-clamp-2">
            {service.description}
          </p>

          {/* Usage Stats */}
          {service.usage && service.status === "active" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--ds-gray-600)]">Usage</span>
                <span className="font-medium text-[var(--ds-gray-900)] tabular-nums">
                  {service.usage.current.toLocaleString()} / {service.usage.limit.toLocaleString()} {service.usage.unit}
                </span>
              </div>
              <div className="h-1.5 bg-[var(--ds-gray-100)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--ds-brand-600)] rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((service.usage.current / service.usage.limit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          {service.href && (
            <Button
              asChild
              variant={service.status === "active" ? "outline" : "default"}
              size="sm"
              className="w-full h-8 text-xs"
            >
              <Link href={service.href}>
                {service.status === "active" ? "View Details" : "Setup Now"}
                <ArrowRight className="h-3 w-3 ml-1.5" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AWSServicesOverview({ services }: AWSServicesOverviewProps) {
  const activeCount = services.filter((s) => s.status === "active").length;
  const setupRequiredCount = services.filter((s) => s.status === "setup_required").length;

  return (
    <Card className="border-[var(--ds-gray-200)]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-[var(--ds-gray-900)]">
              AWS Services
            </CardTitle>
            <p className="text-sm text-[var(--ds-gray-600)] mt-1">
              {activeCount} active · {setupRequiredCount} setup required
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="h-8">
            <Link href="/dashboard/settings/aws">
              Manage
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
