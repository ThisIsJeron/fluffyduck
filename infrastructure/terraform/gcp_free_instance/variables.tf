variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region for the free tier VM (us-west1, us-central1, or us-east1)"
  type        = string
  default     = "us-west1"
}

variable "zone" {
  description = "GCP zone within the region"
  type        = string
  default     = "us-west1-b"
}

variable "service_account_email" {
  description = "Service account email to attach to the VM"
  type        = string
}

variable "environment_variables" {
  description = "Map of environment variables to pass to the startup script (Twilio, Gemini, etc.)"
  type        = map(string)
  default     = {}
} 