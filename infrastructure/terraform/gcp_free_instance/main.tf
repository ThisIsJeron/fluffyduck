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
      image = "projects/cos-cloud/global/images/family/cos-stable"
      size  = 30
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

  metadata_startup_script = <<-'EOT'
    #!/bin/bash
    set -euo pipefail

    echo "---- COS FluffyDuck startup ----"

    # COS comes with docker, but ensure it's active
    systemctl start docker || true

    # Write env file from instance metadata keys we provided
    ENV_FILE="/etc/fluffyduck.env"
    echo "# generated" > ${ENV_FILE}
    for KEY in $(curl -s -H "Metadata-Flavor: Google" \
        "http://metadata/computeMetadata/v1/instance/attributes/?recursive=true" | jq -r 'keys[]'); do
      # Skip google-managed keys
      if [[ "${KEY}" == enable-oslogin* ]]; then continue; fi
      VALUE=$(curl -s -H "Metadata-Flavor: Google" "http://metadata/computeMetadata/v1/instance/attributes/${KEY}")
      echo "${KEY}=${VALUE}" >> ${ENV_FILE}
    done

    docker pull gcr.io/$(curl -s -H "Metadata-Flavor: Google" \
      "http://metadata/computeMetadata/v1/project/project-id")/fluffyduck:latest

    docker run -d --restart=always --env-file=${ENV_FILE} -p 8080:8080 \
      --name fluffyduck gcr.io/$(curl -s -H "Metadata-Flavor: Google" \
      "http://metadata/computeMetadata/v1/project/project-id")/fluffyduck:latest

    echo "FluffyDuck container started"
  EOT

  metadata = merge(
    {
      enable-oslogin = "TRUE"
    },
    { for k, v in var.environment_variables : k => v }
  )
} 