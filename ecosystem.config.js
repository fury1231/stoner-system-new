module.exports = {
  apps: [
    {
      name: 'stoner-system-backend',
      script: './backend/dist/server.js',
      cwd: '/var/www/stoner-system',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      log_file: './logs/backend.log',
      out_file: './logs/backend-out.log',
      error_file: './logs/backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_restarts: 10,
      restart_delay: 4000,
      watch: false,
      ignore_watch: [
        'node_modules',
        'logs',
        '.git'
      ]
    },
    {
      name: 'stoner-system-frontend',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './frontend/dist',
        PM2_SERVE_PORT: 5173,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      },
      cwd: '/var/www/stoner-system',
      instances: 1,
      exec_mode: 'fork'
    }
  ]
};