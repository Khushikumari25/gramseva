module.exports = {
  apps: [{
    name: 'gramseva',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    max_restarts: 10,
    watch: false,
    max_memory_restart: '512M',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
