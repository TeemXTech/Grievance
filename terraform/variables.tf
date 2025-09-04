variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "grievance_admin"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}