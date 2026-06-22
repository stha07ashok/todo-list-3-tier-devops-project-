// pipeline {
//     agent any

//     environment {
//         MONGODB_URI = credentials('MONGODB_URI')
//         DB_NAME     = credentials('DB_NAME')
//         NEXT_PUBLIC_API_URL = credentials('NEXT_PUBLIC_API_URL')

//         PATH = "/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin"
//     }

//     stages {
//         stage('Checkout') {
//             steps {
//                 checkout scm
//             }
//         }

//         stage('Security Scan') {
//             steps {
              
//                 sh '''
//                    echo "Checking docker location..."
//                    ls -l /usr/bin/docker
//                    /usr/bin/docker run --rm -v ${WORKSPACE}:/app aquasec/trivy:latest config /app
//                 '''
//             }
//         }

//         stage('Build') {
//             steps {
//                 sh '/usr/bin/docker compose build --no-cache'
//             }
//         }
        
//         stage('Deploy') {
//             steps {
//                 sh '/usr/bin/docker compose down'
//                 sh '/usr/bin/docker compose up -d'
//             }
//         }
//     }
// }

pipeline {
    agent any

    stages {
        stage('Test Docker Connection') {
            steps {
                script {
                    // Check if the docker command is found
                    sh 'which docker'
                    
                    // Check if Jenkins can talk to the Docker daemon
                    sh 'docker version'
                    
                    // Check if we have permission to list containers
                    sh 'docker ps'
                }
            }
        }
    }
}