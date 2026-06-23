resource "docker_image" "backend_image" {
  name         = "todo-backend:latest"
  keep_locally = true
  build {
    context    = "../server"
    dockerfile = "Dockerfile"
  }
}

resource "docker_container" "backend_container" {
  image = docker_image.backend_image.image_id
  name  = "backend-app"
  
  ports {
    internal = 2000
    external = 2000
  }

  networks_advanced {
    name = docker_network.app_network.name
  }
}