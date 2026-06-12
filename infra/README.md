# Infrastructure

This directory contains all infrastructure-as-code and deployment tooling for the **medical-appointments** application.

## Structure

```
infra/
├── deploy.sh                  # One-command build + sync + cache invalidation
└── terraform/
    └── phase1/                # Phase 1: static SPA on S3 + CloudFront
```

## Deployment phases

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase 1** | Frontend SPA — S3 + CloudFront | Implemented |
| Phase 2 | Backend API — ECS Fargate + RDS | Planned |
| Phase 3 | Auth, monitoring, multi-env | Planned |

## Quick deploy

```bash
# Provision infrastructure (first time only)
cd terraform/phase1
cp terraform.tfvars.example terraform.tfvars   # fill in your values
terraform init && terraform apply

# Deploy the frontend
cd ../..
./deploy.sh
```

See `terraform/phase1/README.md` for full architecture and cost analysis.
