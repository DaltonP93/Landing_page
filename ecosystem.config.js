// Configuración de PM2 para producción.
//   Iniciar:  pm2 start ecosystem.config.js
//   Recargar: pm2 reload ecosystem.config.js --update-env
module.exports = {
  apps: [
    {
      name: 'landing',
      // Ejecuta "next start" usando el binario local (más robusto que npm con PM2)
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
      // Las variables sensibles (DATABASE_URL, APP_SECRET, etc.) se leen de .env.local
      // que Next carga automáticamente en producción.
    },
  ],
};
