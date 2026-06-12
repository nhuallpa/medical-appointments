variable "bucket_id" {
  type = string
}

variable "bucket_regional_domain" {
  type = string
}

variable "environment" {
  type = string
}

variable "app_name" {
  type = string
}

variable "price_class" {
  type = string
}

variable "default_ttl" {
  type = number
}

variable "min_ttl" {
  type = number
}

variable "max_ttl" {
  type = number
}

variable "aliases" {
  type    = list(string)
  default = []
}

variable "acm_certificate_arn" {
  type    = string
  default = null
}
