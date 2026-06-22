pipeline {
    agent any

    stages {
        stage('Quality Scan') {
            steps {
                // This triggers the SonarQube analysis file
                load 'sonar-jenkinsfile' 
            }
        }
        stage('Frontend') {
            steps {
                // This triggers your frontend/Jenkinsfile
                load 'frontend/Jenkinsfile'
            }
        }
        stage('Backend') {
            steps {
                // This triggers your backend/Jenkinsfile
                load 'backend/Jenkinsfile'
            }
        }
    }
}