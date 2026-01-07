/**
 * Vercel API Client - Domain management integration
 * 
 * Requirements: 8.1, 8.3, 8.4
 */

// Environment variables
const VERCEL_API_URL = "https://api.vercel.com";
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;

// Types
export interface VercelDomainResponse {
  name: string;
  apexName: string;
  projectId: string;
  redirect?: string | null;
  redirectStatusCode?: number | null;
  gitBranch?: string | null;
  updatedAt?: number;
  createdAt?: number;
  verified: boolean;
  verification?: VercelDomainVerification[];
}

export interface VercelDomainVerification {
  type: string;
  domain: string;
  value: string;
  reason: string;
}

export interface DomainStatus {
  name: string;
  verified: boolean;
  configured: boolean;
  sslReady: boolean;
  error?: string;
}

export interface VercelDomainConfig {
  configuredBy?: string | null;
  acceptedChallenges?: string[];
  misconfigured: boolean;
}


// Error codes that are retryable
const RETRYABLE_ERROR_CODES = ["rate_limited", "internal_error", "service_unavailable"];

/**
 * Custom error class for Vercel API errors
 */
export class VercelAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "VercelAPIError";
    this.retryable = RETRYABLE_ERROR_CODES.includes(code);
  }
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate that required environment variables are set
 */
function validateConfig(): void {
  if (!VERCEL_API_TOKEN) {
    throw new VercelAPIError(
      "VERCEL_API_TOKEN environment variable is not set",
      "configuration_error",
      500
    );
  }
  if (!VERCEL_PROJECT_ID) {
    throw new VercelAPIError(
      "VERCEL_PROJECT_ID environment variable is not set",
      "configuration_error",
      500
    );
  }
}

/**
 * Build the API URL with optional team ID
 */
function buildUrl(path: string): string {
  const url = new URL(path, VERCEL_API_URL);
  if (VERCEL_TEAM_ID) {
    url.searchParams.set("teamId", VERCEL_TEAM_ID);
  }
  return url.toString();
}


/**
 * Execute a function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof VercelAPIError && error.retryable) {
        lastError = error;
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Vercel API retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

/**
 * Add a domain to the Vercel project
 */
export async function addDomainToVercel(domain: string): Promise<VercelDomainResponse> {
  validateConfig();

  const url = buildUrl(`/v10/projects/${VERCEL_PROJECT_ID}/domains`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VERCEL_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: domain }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `Failed to add domain: ${response.statusText}`;
    const errorCode = errorData.error?.code || "unknown_error";

    throw new VercelAPIError(errorMessage, errorCode, response.status);
  }

  return response.json();
}


/**
 * Remove a domain from the Vercel project
 */
export async function removeDomainFromVercel(domain: string): Promise<void> {
  validateConfig();

  const url = buildUrl(`/v9/projects/${VERCEL_PROJECT_ID}/domains/${encodeURIComponent(domain)}`);

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${VERCEL_API_TOKEN}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `Failed to remove domain: ${response.statusText}`;
    const errorCode = errorData.error?.code || "unknown_error";

    throw new VercelAPIError(errorMessage, errorCode, response.status);
  }
}

/**
 * Get the status of a domain in Vercel
 */
export async function getDomainStatus(domain: string): Promise<DomainStatus> {
  validateConfig();

  const domainUrl = buildUrl(`/v9/projects/${VERCEL_PROJECT_ID}/domains/${encodeURIComponent(domain)}`);

  const domainResponse = await fetch(domainUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${VERCEL_API_TOKEN}`,
    },
  });

  if (!domainResponse.ok) {
    if (domainResponse.status === 404) {
      return {
        name: domain,
        verified: false,
        configured: false,
        sslReady: false,
        error: "Domain not found in Vercel project",
      };
    }

    const errorData = await domainResponse.json().catch(() => ({}));
    throw new VercelAPIError(
      errorData.error?.message || "Failed to get domain status",
      errorData.error?.code || "unknown_error",
      domainResponse.status
    );
  }

  const domainData: VercelDomainResponse = await domainResponse.json();

  const configUrl = buildUrl(`/v6/domains/${encodeURIComponent(domain)}/config`);

  const configResponse = await fetch(configUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${VERCEL_API_TOKEN}`,
    },
  });

  let sslReady = false;
  let configured = false;

  if (configResponse.ok) {
    const configData: VercelDomainConfig = await configResponse.json();
    configured = !configData.misconfigured;
    sslReady = configured && domainData.verified;
  }

  return {
    name: domain,
    verified: domainData.verified,
    configured,
    sslReady,
  };
}

/**
 * Check if a domain is ready (verified and SSL provisioned)
 */
export async function isDomainReady(domain: string): Promise<boolean> {
  const status = await getDomainStatus(domain);
  return status.verified && status.sslReady;
}
