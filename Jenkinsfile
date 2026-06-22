pipeline {
    agent any

    environment {
        // Ensure these IDs match your Jenkins UI EXACTLY
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
                sh '/usr/bin/docker run --rm -v ${WORKSPACE}:/app aquasec/trivy:latest config /app'
            }
        }

        stage('Build') {
            steps {
                sh '/usr/bin/docker compose build --no-cache'
            }
        }
        
        stage('Deploy') {
            steps {
                sh '/usr/bin/docker compose down'
                sh '/usr/bin/docker compose up -d'
            }
        }
    }

}