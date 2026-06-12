output "distribution_domain" {
  value = aws_cloudfront_distribution.static_site.domain_name
}

output "distribution_id" {
  value = aws_cloudfront_distribution.static_site.id
}

output "distribution_arn" {
  value = aws_cloudfront_distribution.static_site.arn
}
