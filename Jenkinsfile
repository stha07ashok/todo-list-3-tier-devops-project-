pipeline {
    agent any
    triggers {
        githubPush() 
    }

    stages {
        stage('Client Build') {
            steps {
               
                load 'client/Jenkinsfile'
            }
        }
        stage('Server Build') {
            steps {
                
                load 'server/Jenkinsfile'
            }
        }
    }
}