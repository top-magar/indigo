import { NextResponse } from 'next/server';

/**
 * Health check endpoint for load balancers and container orchestration
 * 
 * Used by:
 * - AWS ALB health checks
 * - ECS task health checks
 * - Kubernetes liveness/readiness probes
 * - Monitoring systems
 */
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  return NextResponse.json(health, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
