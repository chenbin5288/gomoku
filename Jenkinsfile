pipeline {
    agent any

    environment {
        IMAGE_NAME = 'gomoku-web'
        CONTAINER_NAME = 'gomoku-web-container'
        CONTAINER_PORT = '80'
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Test') {
            steps {
                sh 'npm run test:run'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
                sh "docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} ."
                sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${IMAGE_NAME}:latest"
            }
        }
        stage('Deploy') {
            steps {
                sh """
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true
                    docker run -d --name ${CONTAINER_NAME} -p ${CONTAINER_PORT}:80 ${IMAGE_NAME}:${BUILD_NUMBER}
                """
            }
        }
    }

    post {
        success {
            echo '✅ 部署成功！'
        }
        failure {
            echo '❌ 构建失败，请检查日志'
            sh "docker stop ${CONTAINER_NAME} || true"
            sh "docker rm ${CONTAINER_NAME} || true"
            sh "docker run -d --name ${CONTAINER_NAME} -p ${CONTAINER_PORT}:80 ${IMAGE_NAME}:latest || true"
        }
    }
}
