terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment and configure once you have an S3 bucket for state
  # backend "s3" {
  #   bucket         = "mypyme-terraform-state"
  #   key            = "medical-appointments/phase1/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "mypyme-terraform-locks"
  #   encrypt        = true
  # }
}

# Primary region for app resources
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "medical-appointments"
      Phase       = "phase1"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# CloudFront requires ACM certificates in us-east-1 — always
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "medical-appointments"
      Phase       = "phase1"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
