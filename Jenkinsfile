pipeline {
    agent any

    environment {
        // ==========================================
        // Jenkins Credentials & Server Configurations
        // ==========================================
        // Add your AWS EC2 SSH Private Key (.pem file) as a "SSH Username with private key" credential in Jenkins
        SSH_CRED_ID = 'calories-ec2-key' 
        
        // The default username for Ubuntu AMI on AWS is 'ubuntu'
        EC2_USER = 'ubuntu'
        
        // REPLACE THIS with your AWS EC2 Instance's Public IP or Domain
        // In Jenkinsfile
        EC2_IP = 'calories-detect.rvscasmcafsd2k25.in'

        // Destination directory on your AWS EC2 instance
        APP_DIR = '/var/www/calories-detect'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code from Git...'
                checkout scm
            }
        }

        stage('Install & Build Frontend') {
            steps {
                echo 'Installing frontend dependencies and building React assets...'
                dir('client') {
                    // Install dependencies
                    sh 'npm install'
                    
                    // Build frontend with the production API URL set to '/api'
                    // This lets Nginx route the requests to the backend locally
                    sh 'VITE_API_URL=/api npm run build'
                }
            }
        }

        stage('Deploy to AWS EC2') {
            steps {
                echo 'Deploying files to AWS EC2 instance...'
                
                // Wrap commands in sshagent to load the SSH key automatically
                sshagent(credentials: [env.SSH_CRED_ID]) {
                    // 1. Ensure target directories exist on the EC2 instance
                    sh "ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} 'mkdir -p ${APP_DIR}/client/dist ${APP_DIR}/server'"
                    
                    // 2. Transfer built frontend static files
                    sh "rsync -avz -e 'ssh -o StrictHostKeyChecking=no' client/dist/ ${EC2_USER}@${EC2_IP}:${APP_DIR}/client/dist/"
                    
                    // 3. Transfer backend server files (excluding node_modules and .env files to preserve environment configuration)
                    sh "rsync -avz -e 'ssh -o StrictHostKeyChecking=no' --exclude 'node_modules' --exclude '.env' server/ ${EC2_USER}@${EC2_IP}:${APP_DIR}/server/"
                    
                    // 4. Connect to EC2 to install server dependencies and restart PM2
                    sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} '
                            cd ${APP_DIR}/server
                            
                            # Install production dependencies
                            npm install --production
                            
                            # Restart or start the backend process using PM2
                            pm2 restart calories-backend || pm2 start server.js --name "calories-backend"
                            pm2 save
                        '
                    """
                }
                echo 'Deployment successfully completed!'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check the build console logs.'
        }
    }
}
