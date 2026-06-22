pipeline {
    agent any

    environment {
        // SonarQube Tool
        SCANNER_HOME = tool name: 'sonar-scanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
        // Your existing credentials
        MONGODB_URI = credentials('MONGODB_URI')
        DB_NAME     = credentials('DB_NAME')
        NEXT_PUBLIC_API_URL = credentials('NEXT_PUBLIC_API_URL')
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Code Analysis via SonarQube') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh """
                        \${SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.host.url=http://172.17.0.1:9000 \
                        -Dsonar.projectKey=devops-project \
                        -Dsonar.projectName="DevOps Project" \
                        -Dsonar.projectVersion=0.1.0 \
                        -Dsonar.sources=. \
                        -Dsonar.exclusions="node_modules/**, .next/**, out/**, dist/**" \
                        -Dsonar.javascript.node.maxSpace=4096
                    """
                }
            }
        }

        stage("Quality Gate Status") {
            steps {
                timeout(time: 10, unit: 'MINUTES') { 
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Security Scan - Config') {
            steps {
                echo "Scanning configuration files with Trivy..."
                sh 'docker run --rm -v ${WORKSPACE}:/app aquasec/trivy:latest config /app'
            }
        }

        stage('Build & Image Scan') {
            steps {
                // Build the image
                sh 'docker compose build --no-cache'
                // Scan the image before deploying
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
            cleanWs()
            sh 'docker image prune -f || true'
        }
        failure {
            echo "Pipeline failed. Please check the logs above."
        }
    }
}