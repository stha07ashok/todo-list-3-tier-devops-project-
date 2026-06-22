pipeline {
    agent any

    environment {
    
        MONGODB_URI = credentials('MONGODB_URI')
        DB_NAME     = credentials('DB_NAME')
        NEXT_PUBLIC_API_URL = credentials('NEXT_PUBLIC_API_URL')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Security Scan - Config') {
            steps {
                echo "Scanning configuration files for misconfigurations..."
            
                sh 'docker run --rm -v ${WORKSPACE}:/app aquasec/trivy:latest config /app'
            }
        }

        stage('Build Containers') {
            steps {
                sh 'docker compose build --no-cache'
            }
        }

        stage('Security Scan - Images') {
            steps {
                echo "Scanning Docker images for vulnerabilities..."
           
                sh 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --exit-code 1 --severity CRITICAL todo-backend:latest'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose down'
                sh 'docker compose up -d'
            }
        }
    }

    post {
        always {
           
            script {
                
                echo "Cleaning up..."
                sh 'docker image prune -f || true'
                cleanWs()
            }
        }
        failure {
            echo "Pipeline failed! Check the console output for details."
        }
    }
}