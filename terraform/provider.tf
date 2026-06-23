terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.1"
    }
  }
}

provider "docker" {
  host = "unix:///var/run/docker.sock"
}

# Shared Network for containers to talk to each other
resource "docker_network" "app_network" {
  name = "todo-network"
}