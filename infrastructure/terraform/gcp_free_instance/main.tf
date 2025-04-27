provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

resource "google_compute_network" "default" {
  name                    = "fd-free-tier-net"
  auto_create_subnetworks = true
}

resource "google_compute_firewall" "allow_8080" {
  name    = "fd-allow-8080"
  network = google_compute_network.default.name

  allow {
    protocol = "tcp"
    ports    = ["8080"]
  }

  source_ranges = ["0.0.0.0/0"]
}

resource "google_compute_instance" "fd_free_vm" {
  name         = "fd-e2-micro"
  machine_type = "e2-micro" # free tier eligible
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "projects/debian-cloud/global/images/family/debian-12"
      size  = 30 # GB, within free tier quota
      type  = "pd-balanced"
    }
  }

  network_interface {
    network = google_compute_network.default.name
    access_config {} # Ephemeral external IP (free)
  }

  service_account {
    email  = var.service_account_email
    scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }

  metadata_startup_script = <<-EOT
    #!/usr/bin/env bash
    set -euo pipefail
    echo "---- FluffyDuck startup ----"
    apt-get update -y
    apt-get install -y git python3-pip
    cd /opt
    git clone https://github.com/YOUR_USER/YOUR_REPO.git fluffyduck || true
    cd fluffyduck
    pip3 install --upgrade pip
    pip3 install -r requirements.txt || true

    # Export env vars passed from metadata
    EOT

  metadata = merge(
    {
      enable-oslogin = "TRUE"
    },
    { for k, v in var.environment_variables : k => v }
  )
} 