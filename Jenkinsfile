pipeline {
    agent any

    stages {
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