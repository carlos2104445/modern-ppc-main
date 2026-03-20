terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }
  
  backend "s3" {
    bucket         = "modern-ppc-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "modern-ppc-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "Modern PPC"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
  }
}

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
    
    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
    }
  }
}

module "vpc" {
  source = "./vpc"
  
  environment         = var.environment
  vpc_cidr            = var.vpc_cidr
  availability_zones  = var.availability_zones
  private_subnets     = var.private_subnets
  public_subnets      = var.public_subnets
  database_subnets    = var.database_subnets
}

module "eks" {
  source = "./eks"
  
  environment        = var.environment
  cluster_name       = var.cluster_name
  cluster_version    = var.cluster_version
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  node_groups        = var.node_groups
}

module "rds" {
  source = "./rds"
  
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  database_subnet_ids   = module.vpc.database_subnet_ids
  allowed_security_groups = [module.eks.cluster_security_group_id]
  instance_class        = var.rds_instance_class
  allocated_storage     = var.rds_allocated_storage
  database_name         = var.database_name
  master_username       = var.database_username
  backup_retention_period = var.rds_backup_retention_period
  multi_az              = var.rds_multi_az
}

module "elasticache" {
  source = "./elasticache"
  
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  subnet_ids            = module.vpc.private_subnet_ids
  allowed_security_groups = [module.eks.cluster_security_group_id]
  node_type             = var.elasticache_node_type
  num_cache_nodes       = var.elasticache_num_nodes
  parameter_group_family = var.elasticache_parameter_group_family
}

module "s3" {
  source = "./s3"
  
  environment = var.environment
  buckets = {
    uploads = {
      versioning = true
      lifecycle_rules = [
        {
          id      = "delete-old-versions"
          enabled = true
          noncurrent_version_expiration = {
            days = 90
          }
        }
      ]
    }
    backups = {
      versioning = true
      lifecycle_rules = [
        {
          id      = "transition-to-glacier"
          enabled = true
          transition = {
            days          = 30
            storage_class = "GLACIER"
          }
        }
      ]
    }
    logs = {
      versioning = false
      lifecycle_rules = [
        {
          id      = "expire-old-logs"
          enabled = true
          expiration = {
            days = 90
          }
        }
      ]
    }
  }
}

module "iam" {
  source = "./iam"
  
  environment    = var.environment
  cluster_name   = module.eks.cluster_name
  cluster_oidc_issuer_url = module.eks.cluster_oidc_issuer_url
  s3_bucket_arns = module.s3.bucket_arns
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
  sensitive   = true
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.endpoint
  sensitive   = true
}

output "elasticache_endpoint" {
  description = "ElastiCache endpoint"
  value       = module.elasticache.endpoint
  sensitive   = true
}

output "s3_bucket_names" {
  description = "S3 bucket names"
  value       = module.s3.bucket_names
}
