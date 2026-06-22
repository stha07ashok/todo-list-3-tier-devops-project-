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

        stage('Security Scan') {
            steps {
                // We assume 'trivy' is installed on the host
                sh 'trivy fs .' 
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
}