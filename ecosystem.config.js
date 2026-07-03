module.exports = {
  apps: [{
    name: 'stephud',
    script: 'node_modules/.bin/next',
    args: 'start -p 3000',
    cwd: '/home/stephud',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://stephud:stephud123@localhost:5432/stephud',
    },
    instances: 1,
    autorestart: true,
    max_restarts: 10,
    max_memory_restart: '1G',
  }],
};
