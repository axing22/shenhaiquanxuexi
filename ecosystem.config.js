module.exports = {
  apps: [
    {
      name: 'pixmind',
      cwd: '/www/wwwroot/pixmind',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3006',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        NODE_NO_WARNINGS: '1',
        PORT: 3006,
        TZ: 'Asia/Shanghai'  // 设置时区为东八区
      },
      error_file: '/www/wwwroot/pixmind/logs/pm2-error.log',
      out_file: '/www/wwwroot/pixmind/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',  // 移除 Z，使用本地时区
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
      kill_timeout: 5000
    }
  ]
}
