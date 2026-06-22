pipeline {
    agent any

    environment {
        // These pull directly from the Credentials you created in Step 1
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

        stage('Security Scan') {
            steps {
                sh 'docker run --rm -v ${WORKSPACE}:/app aquasec/trivy:latest config /app'
            }
        }

        stage('Build') {
            steps {
                sh 'docker compose build --no-cache'
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
            // Simple cleanup: removes containers and dangling images
            sh 'docker compose down || true'
            sh 'docker image prune -f || true'
        }
    }
}