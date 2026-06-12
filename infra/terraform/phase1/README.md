# Phase 1 — Static SPA on AWS

Deploys the **medical-appointments** Next.js frontend as a static site using S3 + CloudFront.
No servers. No containers. ~$1/month.

## Contents

- [Architecture](#architecture)
- [Key decisions and findings](#key-decisions-and-findings)
- [Cost analysis](#cost-analysis)
- [Module reference](#module-reference)
- [Variables](#variables)
- [Outputs](#outputs)
- [Usage](#usage)
- [Roadmap to Phase 2](#roadmap-to-phase-2)

---

## Architecture

```
                           ┌─────────────────────────────────────────┐
                           │              AWS Cloud                  │
                           │                                         │
 User (HTTPS)              │  ┌───────────┐      ┌────────────────┐  │
    │                      │  │  Route 53 │      │  ACM (TLS)     │  │
    │ (optional custom      │  │  DNS zone │      │  us-east-1     │  │
    │  domain)             │  └─────┬─────┘      └───────┬────────┘  │
    │                      │        │                     │ cert ARN  │
    ▼                      │        ▼                     ▼           │
 *.cloudfront.net  ◀───────┼── CloudFront Distribution               │
 or app.yourdomain.com     │        │  (CDN + TLS termination)        │
                           │        │  OAC — sigv4 signed requests    │
                           │        ▼                                 │
                           │  ┌─────────────────────────────────┐    │
                           │  │   S3 Bucket (private)            │    │
                           │  │   medical-appointments-prod-     │    │
                           │  │   static                         │    │
                           │  │                                  │    │
                           │  │   /index.html                    │    │
                           │  │   /_next/static/…  (hashed)     │    │
                           │  │   /favicon.ico                   │    │
                           │  └─────────────────────────────────┘    │
                           └─────────────────────────────────────────┘
```

**Route 53 and ACM are optional.** Omitting `domain_name` in `terraform.tfvars` skips both and the app is served on the default `*.cloudfront.net` domain.

---

## Key decisions and findings

### 1. Static export over SSR container

The Next.js app is entirely client-side — every component carries `"use client"`, state lives in React context, and no server-side data fetching was found. A static export (`output: "export"` in `next.config.mjs`) produces a flat `/out` directory suitable for S3 hosting.

**Trade-off eliminated:** Running a Next.js server (ECS Fargate + ALB) would cost ~$25-35/month and add operational overhead for zero functional gain in Phase 1.

### 2. CloudFront OAC instead of OAI

Origin Access Control (OAC) is the current AWS standard for restricting S3 access to CloudFront. It uses SigV4 request signing and supports SSE-S3/SSE-KMS encrypted buckets. The legacy Origin Access Identity (OAI) does not support these encryption modes and is on a deprecation path.

The S3 bucket policy grants `s3:GetObject` only to requests whose `AWS:SourceArn` matches the specific CloudFront distribution ARN — not all of CloudFront.

### 3. Two-tier cache strategy

| Path | Cache-Control | Rationale |
|------|---------------|-----------|
| `/_next/static/*` | `max-age=31536000, immutable` | Next.js hashes filenames on every build; files are truly immutable |
| Everything else (HTML) | `no-cache, no-store` | `index.html` must be fresh so users always get the latest JS entrypoint after a deploy |

This is enforced both in CloudFront (two `ordered_cache_behavior` blocks) and in `deploy.sh` (two separate `aws s3 sync` passes with different `--cache-control` headers).

### 4. SPA routing via CloudFront error pages

S3 returns HTTP 403 (not 404) for missing keys when the bucket is private. CloudFront is configured to intercept both 403 and 404 responses and serve `/index.html` with HTTP 200. This allows the React app to handle deep links (e.g. `/settings`) client-side without a server.

```hcl
custom_error_response {
  error_code         = 403
  response_code      = 200
  response_page_path = "/index.html"
}
```

### 5. ACM certificate in us-east-1

CloudFront is a global service that only accepts ACM certificates issued in `us-east-1`, regardless of where other resources live. The Terraform configuration uses a separate AWS provider alias (`aws.us_east_1`) passed explicitly to the `dns` module. Without this, `terraform apply` fails with a cryptic "invalid certificate" error.

### 6. Trailing slash required for static export

Next.js static export generates `settings/index.html`, not `settings.html`. S3 only serves `index.html` automatically for the bucket root, not for subdirectories. Setting `trailingSlash: true` in `next.config.mjs` makes Next.js link to `/settings/` (with slash), which causes S3 to look up `settings/index.html` correctly.

---

## Cost analysis

Assumptions: small medical practice, ~200 daily users, ~10 GB/month transfer, ~500K CloudFront requests/month.

| Service | Unit price | Estimated usage | Monthly cost |
|---------|-----------|----------------|-------------|
| S3 storage | $0.023 / GB | ~5 MB build output | < $0.01 |
| S3 GET requests | $0.0004 / 1K | 50K requests | $0.02 |
| CloudFront data transfer (out) | $0.0085 / GB | 10 GB | $0.085 |
| CloudFront HTTPS requests | $0.0100 / 10K | 500K requests | $0.50 |
| ACM certificate | — | 1 cert | **Free** |
| Route 53 hosted zone | $0.50 / zone | 1 zone | $0.50 |
| Route 53 queries | $0.40 / 1M | ~100K | $0.04 |
| **Total** | | | **~$1.15 / month** |

**AWS Free Tier (first 12 months):** CloudFront includes 1 TB transfer + 10M requests/month free. Under free tier the cost drops to ~$0.50/month (Route 53 zone only).

**Price class impact:** Switching `cloudfront_price_class` from `PriceClass_All` to `PriceClass_100` (US + EU edge locations only) reduces per-GB transfer costs by ~15% but excludes South American edge locations. For a LatAm-based practice, `PriceClass_All` is recommended.

---

## Module reference

### `modules/s3`

Creates a private S3 bucket hardened for static site hosting.

| Resource | Purpose |
|----------|---------|
| `aws_s3_bucket` | Main bucket, uniquely named per environment |
| `aws_s3_bucket_versioning` | Enabled — allows rollback to previous deploy |
| `aws_s3_bucket_server_side_encryption_configuration` | AES-256 SSE with bucket key (reduces request costs) |
| `aws_s3_bucket_public_access_block` | Blocks all public access — CloudFront reaches it via OAC only |
| `aws_s3_bucket_ownership_controls` | `BucketOwnerEnforced` — disables ACLs |

The bucket policy (in `main.tf` root, not the module) grants `s3:GetObject` to the specific CloudFront distribution ARN via a `StringEquals` condition on `AWS:SourceArn`.

### `modules/cloudfront`

Creates the CloudFront distribution, OAC, and a custom cache policy.

| Resource | Purpose |
|----------|---------|
| `aws_cloudfront_origin_access_control` | OAC with sigv4 signing — grants CF access to the private S3 bucket |
| `aws_cloudfront_distribution` | CDN with two cache behaviors and SPA error routing |
| `aws_cloudfront_cache_policy` | Custom policy: no cookies/headers/query strings forwarded; brotli + gzip enabled |
| `data.aws_cloudfront_origin_request_policy` | Managed `CORS-S3Origin` policy — forwards necessary CORS headers |

### `modules/dns`

Provisions an ACM certificate with DNS validation and the Route 53 records needed to validate it. Only instantiated when `var.domain_name` is non-empty.

| Resource | Purpose |
|----------|---------|
| `aws_acm_certificate` | Covers both `app.domain.com` and `domain.com` (SAN) |
| `data.aws_route53_zone` | Looks up an existing hosted zone — the zone must be pre-created |
| `aws_route53_record` | CNAME validation records (one per domain/SAN) |
| `aws_acm_certificate_validation` | Waits for ACM to confirm DNS validation before outputting the ARN |

---

## Variables

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aws_region` | string | `us-east-1` | Primary region for S3 and other resources |
| `environment` | string | `prod` | `dev`, `staging`, or `prod` |
| `app_name` | string | `medical-appointments` | Used in resource names and tags |
| `domain_name` | string | `""` | Registered domain. Empty = skip Route 53 + ACM |
| `subdomain` | string | `app` | Subdomain prefix (e.g. `app` → `app.domain.com`) |
| `cloudfront_price_class` | string | `PriceClass_All` | Edge location coverage vs cost |
| `cloudfront_default_ttl` | number | `86400` | Default TTL in seconds (24h) |
| `cloudfront_min_ttl` | number | `0` | Minimum TTL in seconds |
| `cloudfront_max_ttl` | number | `31536000` | Maximum TTL in seconds (1 year, for hashed assets) |

---

## Outputs

| Name | Description |
|------|-------------|
| `site_url` | Public URL — custom domain if configured, otherwise CloudFront domain |
| `cloudfront_domain` | Raw `*.cloudfront.net` domain |
| `cloudfront_distribution_id` | Distribution ID — required for cache invalidation in `deploy.sh` |
| `s3_bucket_name` | Bucket name — target for `aws s3 sync` |

---

## Usage

### Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.6.0
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) configured with appropriate credentials
- AWS IAM permissions: S3, CloudFront, ACM (us-east-1), Route 53 (if using custom domain)

### First-time provisioning

```bash
cd infra/terraform/phase1

# 1. Create your variables file
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars — set domain_name if you have one

# 2. Initialise providers and modules
terraform init

# 3. Review the plan — no resources are created yet
terraform plan

# 4. Apply
terraform apply

# 5. Note the outputs
terraform output site_url
```

CloudFront distributions take 5-15 minutes to deploy globally after `apply`.

### Deploying the frontend

```bash
# From the repo root
./infra/deploy.sh

# The script:
#   1. Runs `npm run build` (Next.js static export → /out)
#   2. Reads bucket name and distribution ID from Terraform outputs
#   3. Syncs /out to S3 with correct Cache-Control headers
#   4. Creates a CloudFront invalidation for /*
#   5. Prints the site URL
```

### Teardown

```bash
cd infra/terraform/phase1

# Empty the bucket first (Terraform cannot destroy a non-empty bucket)
BUCKET=$(terraform output -raw s3_bucket_name)
aws s3 rm "s3://$BUCKET" --recursive

terraform destroy
```

---

## Roadmap to Phase 2

Phase 2 will deploy the Spring Boot API (`medical-appointments-api`) and replace the H2 in-memory database with a persistent store.

Planned additions:

| Component | AWS Service | Estimated cost |
|-----------|-------------|----------------|
| Container runtime | ECS Fargate (0.25 vCPU / 0.5 GB) | ~$7/month |
| Load balancer | Application Load Balancer | ~$16/month |
| Database | RDS Aurora Serverless v2 (PostgreSQL) | ~$7-15/month |
| Container registry | ECR | ~$0.50/month |
| Secrets | AWS Secrets Manager | ~$0.40/month |
| **Phase 2 addition** | | **~$31-40/month** |
| **Total (Phase 1 + 2)** | | **~$32-41/month** |

The frontend will continue to be served from S3 + CloudFront unchanged; only an `NEXT_PUBLIC_API_URL` environment variable will need to be set at build time to point to the ALB.
