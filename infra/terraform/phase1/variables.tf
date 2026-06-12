variable "aws_region" {
  description = "Primary AWS region for S3 and other resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be dev, staging, or prod"
  }
}

variable "app_name" {
  description = "Application name used for resource naming"
  type        = string
  default     = "medical-appointments"
}

# ── Domain / DNS ─────────────────────────────────────────────────────────────
variable "domain_name" {
  description = "Your registered domain (e.g. mypyme.com). Leave empty to skip Route 53 + ACM."
  type        = string
  default     = ""
}

variable "subdomain" {
  description = "Subdomain for the app (e.g. 'app' → app.mypyme.com). Used only when domain_name is set."
  type        = string
  default     = "app"
}

# ── CloudFront ────────────────────────────────────────────────────────────────
variable "cloudfront_price_class" {
  description = "CloudFront price class. PriceClass_100 = US/EU only (cheapest for LatAm+US)."
  type        = string
  default     = "PriceClass_All"

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.cloudfront_price_class)
    error_message = "Must be PriceClass_100, PriceClass_200, or PriceClass_All"
  }
}

variable "cloudfront_default_ttl" {
  description = "Default TTL in seconds for cached objects"
  type        = number
  default     = 86400 # 24h — static SPA changes only on deploy
}

variable "cloudfront_min_ttl" {
  description = "Minimum TTL in seconds"
  type        = number
  default     = 0
}

variable "cloudfront_max_ttl" {
  description = "Maximum TTL in seconds"
  type        = number
  default     = 31536000 # 1 year for immutable assets
}
