locals {
  fqdn            = var.domain_name != "" ? "${var.subdomain}.${var.domain_name}" : ""
  use_custom_domain = var.domain_name != ""

  # Bucket name must be globally unique — scoped by env
  bucket_name = "${var.app_name}-${var.environment}-static"
}

# ── S3: static site bucket ────────────────────────────────────────────────────
module "s3" {
  source = "./modules/s3"

  bucket_name = local.bucket_name
  environment = var.environment
}

# ── ACM: TLS certificate (only when a custom domain is provided) ──────────────
module "acm" {
  count  = local.use_custom_domain ? 1 : 0
  source = "./modules/dns"

  domain_name = var.domain_name
  subdomain   = var.subdomain

  providers = {
    aws = aws.us_east_1 # CloudFront requires certs in us-east-1
  }
}

# ── CloudFront: CDN distribution ──────────────────────────────────────────────
module "cloudfront" {
  source = "./modules/cloudfront"

  bucket_id              = module.s3.bucket_id
  bucket_regional_domain = module.s3.bucket_regional_domain_name
  environment            = var.environment
  app_name               = var.app_name
  price_class            = var.cloudfront_price_class
  default_ttl            = var.cloudfront_default_ttl
  min_ttl                = var.cloudfront_min_ttl
  max_ttl                = var.cloudfront_max_ttl

  # Custom domain — wired only when domain + cert are available
  aliases             = local.use_custom_domain ? [local.fqdn] : []
  acm_certificate_arn = local.use_custom_domain ? module.acm[0].certificate_arn : null
}

# Grant CloudFront OAC read access to the S3 bucket
resource "aws_s3_bucket_policy" "static_site" {
  bucket = module.s3.bucket_id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOAC"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${module.s3.bucket_arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = module.cloudfront.distribution_arn
          }
        }
      }
    ]
  })
}
