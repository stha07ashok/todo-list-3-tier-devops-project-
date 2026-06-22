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
        stage('System Diagnostic') {
            steps {
                script {
                    // 1. Where are we? (Verifies file system access)
                    sh 'pwd'
                    
                    // 2. Who is the user? (Verifies permissions)
                    sh 'whoami'
                    sh 'id'
                    
                    // 3. What is in the system PATH? (This explains why 'docker' wasn't found)
                    sh 'echo $PATH'
                    
                    // 4. Check for critical directories
                    sh 'ls -l /usr/bin/'
                    
                    // 5. Verify connectivity to the host's socket (without running docker commands)
                    sh 'ls -l /var/run/docker.sock || echo "Docker socket NOT found at /var/run/docker.sock"'
                }
            }
        }
    }
}