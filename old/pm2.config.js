module.exports = {
  apps: [{
    name: 'stoner-backend',
    script: './backend/dist/server.js',
    cwd: '/home/deploy/stoner-system',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      JWT_SECRET: 'd25592af7f491e76d94b1ca166c58004a0c50c11b447440208e1869d155de63ddbc706796b8bf7e2d53703c8549a07e4fc2b21d1a37523b18af094503836454d',
      CSRF_SECRET: 'a048b1fc0ef220f1df0baea010f857537893c216107b6053d3b93103999aa285',
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD_HASH: '$2a$10$TOtAvCvckwU7TYIeL0aZW.V4TclIoumUlA8oGRmEtB173PZXvRPrS',
      DATABASE_URL: 'sqlite:./database.sqlite',
      CORS_ORIGIN: 'http://localhost:5173,https://stonersmokeshop.work',
      RATE_LIMIT_PER_MINUTE: 100,
      LOGIN_RATE_LIMIT_PER_15MIN: 5
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: '/home/deploy/stoner-system/logs/backend-error.log',
    out_file: '/home/deploy/stoner-system/logs/backend-out.log',
    log_file: '/home/deploy/stoner-system/logs/backend.log'
  }]
}