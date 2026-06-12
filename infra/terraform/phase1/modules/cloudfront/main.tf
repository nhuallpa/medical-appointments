# Origin Access Control — the modern replacement for OAI
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "${var.app_name}-${var.environment}-oac"
  description                       = "OAC for ${var.app_name} static site"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "static_site" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = var.price_class
  comment             = "${var.app_name} phase1 static SPA"

  aliases = var.aliases

  origin {
    domain_name              = var.bucket_regional_domain
    origin_id                = "s3-${var.bucket_id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "s3-${var.bucket_id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    cache_policy_id          = aws_cloudfront_cache_policy.spa.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.s3_cors.id

    # Immutable hashed assets (_next/static/**) get 1-year cache
    # The default cache policy handles the index.html separately below
  }

  # Next.js hashed static assets — effectively immutable, max cache
  ordered_cache_behavior {
    path_pattern           = "/_next/static/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "s3-${var.bucket_id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    min_ttl     = 0
    default_ttl = var.max_ttl
    max_ttl     = var.max_ttl

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  # SPA routing — return index.html for any 403/404 so React Router handles it
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  # TLS — required when aliases (custom domains) are set
  dynamic "viewer_certificate" {
    for_each = var.acm_certificate_arn != null ? [1] : []
    content {
      acm_certificate_arn      = var.acm_certificate_arn
      ssl_support_method       = "sni-only"
      minimum_protocol_version = "TLSv1.2_2021"
    }
  }

  dynamic "viewer_certificate" {
    for_each = var.acm_certificate_arn == null ? [1] : []
    content {
      cloudfront_default_certificate = true
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

# ── Cache policy: SPA index.html should not be cached too aggressively ────────
resource "aws_cloudfront_cache_policy" "spa" {
  name        = "${var.app_name}-${var.environment}-spa-cache"
  comment     = "SPA default — cache HTML briefly, statics long"
  default_ttl = var.default_ttl
  min_ttl     = var.min_ttl
  max_ttl     = var.max_ttl

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

data "aws_cloudfront_origin_request_policy" "s3_cors" {
  name = "Managed-CORS-S3Origin"
}
