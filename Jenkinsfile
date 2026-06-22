pipeline {
    agent any

    stages {
        stage('Frontend') {
            steps {
                // This triggers your frontend/Jenkinsfile
                load 'client/Jenkinsfile'
            }
        }
        stage('Backend') {
            steps {
                // This triggers your backend/Jenkinsfile
                load 'server/Jenkinsfile'
            }
        }
    }
}