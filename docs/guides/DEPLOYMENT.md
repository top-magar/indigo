# Multi-Tenant Deployment Guide

This guide covers deploying the Indigo multi-tenant platform to Vercel with subdomain and custom domain support.

## Prerequisites

- Vercel account (Pro plan recommended for wildcard domains)
- Domain registered and DNS access
- PostgreSQL database (Neon, Supabase, or Vercel Postgres recommended)

## Vercel Project Setup

### 1. Create Project

```bash
# Install Vercel CLI
npm i -g vercel

# Link to Vercel
vercel link
```

### 2. Configure Environment Variables

Set these in Vercel Dashboard > Project Settings > Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection (RLS enabled) | `postgres://app_user:...` |
| `SUDO_DATABASE_URL` | PostgreSQL connection (admin) | `postgres://postgres:...` |
| `AUTH_SECRET` | NextAuth secret (32+ chars) | `openssl rand -base64 32` |
| `AUTH_URL` | Production URL | `https://indigo.com` |
| `NEXT_PUBLIC_PLATFORM_DOMAIN` | Platform domain | `indigo.com` |
| `NEXT_PUBLIC_APP_URL` | Full platform URL | `https://indigo.com` |
| `VERCEL_API_TOKEN` | Vercel API token | Get from Vercel dashboard |
| `VERCEL_PROJECT_ID` | Project ID | Found in project settings |
| `VERCEL_TEAM_ID` | Team ID (if applicable) | Found in team settings |

### 3. Get Vercel API Credentials

1. Go to [Vercel Account Settings > Tokens](https://vercel.com/account/tokens)
2. Create a new token with these scopes:
   - Read/Write access to Domains
   - Read access to Projects
3. Copy the token to `VERCEL_API_TOKEN`

4. Get Project ID:
   - Go to Project Settings > General
   - Copy the "Project ID" value

5. Get Team ID (if using team):
   - Go to Team Settings > General
   - Copy the "Team ID" value

## DNS Configuration

### Platform Domain Setup

Configure your DNS provider with these records:

```
# Root domain (for marketing site and dashboard)
Type: A
Name: @
Value: 76.76.21.21

# WWW redirect
Type: CNAME
Name: www
Value: cname.vercel-dns.com

# Wildcard for tenant subdomains
Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

### Vercel Domain Configuration

1. Go to Vercel Dashboard > Project > Settings > Domains
2. Add your platform domain: `indigo.com`
3. Add wildcard domain: `*.indigo.com`
4. Vercel will automatically provision SSL certificates

## Custom Domain Flow

When tenants add custom domains, the system:

1. Generates a verification token
2. Instructs tenant to add DNS records:
   ```
   # Option A: CNAME (recommended)
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com

   # Option B: A Record
   Type: A
   Name: @
   Value: 76.76.21.21
   ```
3. Verifies DNS configuration
4. Adds domain to Vercel via API
5. Vercel provisions SSL automatically

## Preview Deployments

Preview deployments work automatically with Vercel:

### Preview URL Patterns

- Main preview: `project-name-git-branch-team.vercel.app`
- Tenant preview: Access via query param or header injection for testing

### Testing Multi-Tenant in Preview

For preview deployments, tenant resolution uses the preview URL pattern. To test specific tenants:

1. Use the internal API endpoint for testing:
   ```
   GET /api/internal/tenant?slug=acme
   ```

2. Or modify your local hosts file for local testing:
   ```
   # /etc/hosts (macOS/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows)
   127.0.0.1 acme.localhost
   127.0.0.1 shop.localhost
   ```

## Production Checklist

### Before Going Live

- [ ] All environment variables set in Vercel
- [ ] Database migrations applied
- [ ] Wildcard domain configured (`*.yourdomain.com`)
- [ ] SSL certificates provisioned (automatic)
- [ ] Vercel API token has correct permissions
- [ ] Test subdomain routing works
- [ ] Test custom domain flow end-to-end

### Security Checklist

- [ ] `AUTH_SECRET` is unique and secure (32+ characters)
- [ ] Database credentials are not exposed
- [ ] RLS policies are enabled on all tenant tables
- [ ] Vercel API token is scoped appropriately
- [ ] HTTPS enforced on all domains

### Performance Checklist

- [ ] Edge caching configured (optional KV)
- [ ] Image optimization enabled
- [ ] Database connection pooling configured

## Monitoring

### Recommended Monitoring Setup

1. **Vercel Analytics**: Enable in project settings
2. **Error Tracking**: Integrate Sentry or similar
3. **Database Monitoring**: Use your database provider's dashboard

### Key Metrics to Watch

- Middleware execution time
- Tenant resolution latency
- Domain verification success rate
- SSL certificate status

## Troubleshooting

### Common Issues

#### "Store not found" for valid subdomain
- Check tenant exists with correct slug
- Verify `NEXT_PUBLIC_PLATFORM_DOMAIN` matches your domain
- Check middleware logs in Vercel

#### Custom domain not working
- Verify DNS propagation (can take 24-48 hours)
- Check domain status in dashboard
- Verify Vercel API token has domain permissions

#### SSL certificate errors
- Wait for Vercel to provision (usually < 5 minutes)
- Check domain is correctly added to Vercel project
- Verify DNS records are correct

### Debug Commands

```bash
# Check DNS propagation
dig +short your-domain.com

# Check CNAME record
dig +short CNAME your-domain.com

# Test Vercel API connection
curl -H "Authorization: Bearer $VERCEL_API_TOKEN" \
  "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID/domains"
```

## Scaling Considerations

### Database
- Use connection pooling (PgBouncer or built-in)
- Consider read replicas for high-traffic tenants
- Monitor query performance per tenant

### Edge Caching
- Enable Vercel KV for tenant resolution caching
- Set appropriate TTL (recommended: 5 minutes)
- Implement cache invalidation on tenant updates

### CDN
- Vercel Edge Network handles this automatically
- Consider additional CDN for tenant assets if needed
