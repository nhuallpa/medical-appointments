output "cloudfront_domain" {
  description = "CloudFront distribution domain (use this URL to access the app when no custom domain)"
  value       = module.cloudfront.distribution_domain
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID — needed to invalidate cache after deploys"
  value       = module.cloudfront.distribution_id
}

output "s3_bucket_name" {
  description = "S3 bucket name — target for 'aws s3 sync' during deploys"
  value       = module.s3.bucket_id
}

output "site_url" {
  description = "Public URL for the application"
  value       = local.use_custom_domain ? "https://${local.fqdn}" : "https://${module.cloudfront.distribution_domain}"
}
