#!/usr/bin/env bash
# Despliegue automatizado: actualiza, instala, compila y recarga la app con PM2.
#   Uso (en el servidor):  ./deploy.sh
set -euo pipefail
cd "$(dirname "$0")"

echo "→ [1/5] Trayendo cambios (git pull)"
git pull origin main

echo "→ [2/5] Instalando dependencias"
npm install

echo "→ [3/5] Compilando (build de producción)"
npm run build

echo "→ [4/5] Recargando con PM2"
if pm2 describe landing > /dev/null 2>&1; then
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
fi

echo "→ [5/5] Guardando estado de PM2"
pm2 save

echo "✓ Deploy completado."
echo "  Logs:   pm2 logs landing"
echo "  Estado: pm2 status"
