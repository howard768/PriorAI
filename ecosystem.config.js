module.exports = {
  apps: [
    {
      name: 'priorai-ai-service',
      script: './services/ai-service/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/ai-service-error.log',
      out_file: './logs/ai-service-out.log',
      log_file: './logs/ai-service-combined.log',
      time: true
    },
    {
      name: 'priorai-data-service',
      script: './services/data-collection/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: './logs/data-service-error.log',
      out_file: './logs/data-service-out.log',
      log_file: './logs/data-service-combined.log',
      time: true
    },
    {
      name: 'priorai-frontend',
      script: './node_modules/.bin/serve',
      args: '-s dashboard/build -l 3000',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
}; 