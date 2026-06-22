pipeline {
    agent any

    stages {
        stage('Client Build') {
            steps {
                // This triggers your frontend/Jenkinsfile
                load 'client/Jenkinsfile'
            }
        }
        stage('Server Build') {
            steps {
                // This triggers your backend/Jenkinsfile
                load 'server/Jenkinsfile'
            }
        }
    }
}