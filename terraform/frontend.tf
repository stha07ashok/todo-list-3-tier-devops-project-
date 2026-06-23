resource "docker_image" "frontend_image" {
  name         = "todo-frontend:latest"
  keep_locally = true
  build {
    context    = "../client"
    dockerfile = "Dockerfile"
  }
}

resource "docker_container" "frontend_container" {
  image = docker_image.frontend_image.image_id
  name  = "frontend-app"
  
  ports {
    internal = 1000
    external = 1000
  }

  networks_advanced {
    name = docker_network.app_network.name
  }

  env = [
    "API_URL=http://backend-app:5000"
  ]
}