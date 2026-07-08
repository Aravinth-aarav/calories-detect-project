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
        APP_DIR = '/var/www/calories-detect/calories-detect-project'
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
                    // Windows cmd commands
                    bat 'npm install'
                    bat 'set VITE_API_URL=/api&& npm run build'
                }
            }
        }

        stage('Deploy to AWS EC2') {
            steps {
                echo 'Deploying files to AWS EC2 instance...'
                
                // Use withCredentials to get SSH Key path on Windows
                withCredentials([sshUserPrivateKey(credentialsId: env.SSH_CRED_ID, keyFileVariable: 'KEY_FILE', usernameVariable: 'SSH_USER')]) {
                    powershell '''
                        # Secure the temporary private key file (required by OpenSSH on Windows)
                        $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
                        icacls.exe $env:KEY_FILE /inheritance:r
                        icacls.exe $env:KEY_FILE /grant:r "${currentUser}:R"

                        # 1. Create target directories on the EC2 instance
                        ssh -i $env:KEY_FILE -o StrictHostKeyChecking=no ${env:SSH_USER}@${env:EC2_IP} "mkdir -p ${env:APP_DIR}/client/dist ${env:APP_DIR}/server"
                        
                        # 2. Transfer built frontend static files
                        scp -i $env:KEY_FILE -r -o StrictHostKeyChecking=no client/dist/* ${env:SSH_USER}@${env:EC2_IP}:${env:APP_DIR}/client/dist/
                        
                        # 3. Transfer backend server files (excluding node_modules, .env, and .git)
                        Get-ChildItem -Path server -Exclude "node_modules", ".env", ".git" | ForEach-Object {
                            scp -i $env:KEY_FILE -r -o StrictHostKeyChecking=no $_.FullName "${env:SSH_USER}@${env:EC2_IP}:${env:APP_DIR}/server/"
                        }
                        
                        # 4. Connect to EC2 to install server dependencies and restart PM2
                        ssh -i $env:KEY_FILE -o StrictHostKeyChecking=no ${env:SSH_USER}@${env:EC2_IP} "cd ${env:APP_DIR}/server && npm install --production && (pm2 restart calories-backend || pm2 start server.js --name 'calories-backend') && pm2 save"
                    '''
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
