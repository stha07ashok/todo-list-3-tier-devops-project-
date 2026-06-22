pipeline {
    agent any

    stages {
        stage('client') {
            steps {
                // This triggers your frontend/Jenkinsfile
                load 'client/Jenkinsfile'
            }
        }
        stage('server') {
            steps {
                // This triggers your backend/Jenkinsfile
                load 'server/Jenkinsfile'
            }
        }
    }
}