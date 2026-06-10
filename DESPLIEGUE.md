# Guía de Despliegue en VPS (Ubuntu + Nginx + PM2 + PostgreSQL + SSL)

Guía paso a paso para publicar la landing/sistema en un servidor propio (VPS Ubuntu 22.04).
Resultado final: `https://tudominio.com` corriendo con PM2 detrás de Nginx, con SSL gratuito (Let's Encrypt)
y base de datos PostgreSQL.

---

## 0. Requisitos
- Un VPS con Ubuntu 22.04 (DigitalOcean, Hetzner, Linode, Contabo, etc.).
- Un dominio apuntando al servidor (registros DNS).
- Acceso SSH como root o usuario con sudo.

---

## 1. Preparar el servidor

```bash
ssh root@TU_IP_DEL_SERVIDOR

# Actualizar
apt update && apt upgrade -y

# Crear usuario de despliegue (recomendado)
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### Node.js 20 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # v20.x
```

### Git, Nginx, PM2
```bash
sudo apt install -y git nginx
sudo npm install -g pm2
```

---

## 2. PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql

# Crear base y usuario
sudo -u postgres psql <<'SQL'
CREATE DATABASE landing;
CREATE USER landing_user WITH ENCRYPTED PASSWORD 'PONÉ_UNA_CLAVE_FUERTE';
GRANT ALL PRIVILEGES ON DATABASE landing TO landing_user;
\c landing
GRANT ALL ON SCHEMA public TO landing_user;
SQL
```

La cadena de conexión será:
```
postgresql://landing_user:PONÉ_UNA_CLAVE_FUERTE@localhost:5432/landing
```

---

## 3. Clonar y configurar el proyecto

```bash
cd /var/www
sudo mkdir -p landing && sudo chown deploy:deploy landing
git clone https://github.com/DaltonP93/Landing_page.git landing
cd landing
npm install
```

### Variables de entorno
```bash
cp .env.example .env.local
nano .env.local
```
Completá al menos:
```
DATABASE_URL=postgresql://landing_user:CLAVE@localhost:5432/landing
APP_SECRET=<una cadena larga y única — genera con: openssl rand -hex 32>
ADMIN_API_KEY=<clave maestra del panel>
ADMIN_USER=admin
ADMIN_PASSWORD=<contraseña del admin inicial>
CRON_SECRET=<secreto para el cron — openssl rand -hex 16>
```
> El resto de las claves (IA, pagos, Meta/Google, SMTP, WhatsApp) podés cargarlas
> después desde el panel en **Ajustes** — no hace falta ponerlas en `.env`.

### Crear el esquema de la base y migrar datos
```bash
npm run db:schema     # crea las tablas/vistas
npm run db:migrate    # (opcional) sube los datos JSON existentes a Postgres
```

### Build
```bash
npm run build
```

---

## 4. PM2 (mantener la app corriendo)

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup     # ejecutá el comando que imprime (para arrancar al bootear)
```
La app queda escuchando en `http://localhost:3000`.

Comandos útiles:
```bash
pm2 status
pm2 logs landing
pm2 reload landing      # tras actualizar
```

---

## 5. Nginx (reverse proxy)

```bash
sudo nano /etc/nginx/sites-available/landing
```
Pegá (reemplazá `tudominio.com`):
```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    client_max_body_size 6M;   # para subir imágenes (5 MB)

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Activar:
```bash
sudo ln -s /etc/nginx/sites-available/landing /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. Dominio (DNS)

En tu proveedor de dominio, creá los registros A apuntando a la IP del VPS:
```
A   @     TU_IP_DEL_SERVIDOR
A   www   TU_IP_DEL_SERVIDOR
```
Esperá la propagación (minutos a unas horas). Verificá con `ping tudominio.com`.

Luego, en el panel → **Contenido → Datos de la empresa**, poné la **URL del sitio**
(`https://tudominio.com`) para que sitemap, SEO y los retornos de pago usen el dominio real.

---

## 7. SSL gratuito (Let's Encrypt / Certbot)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```
Certbot configura HTTPS y la renovación automática. Probá la renovación:
```bash
sudo certbot renew --dry-run
```

---

## 8. Cron de sincronización de audiencias (diario)

Editá el crontab:
```bash
crontab -e
```
Agregá (6 AM todos los días; reemplazá el secreto y dominio):
```
0 6 * * * curl -s "https://tudominio.com/api/cron/sync-audiences?secret=TU_CRON_SECRET" > /dev/null
```

---

## 9. Firewall (recomendado)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 10. Actualizar el sitio (deploy de cambios)

Automatizado con el script incluido:
```bash
cd /var/www/landing
chmod +x deploy.sh   # solo la primera vez
./deploy.sh          # git pull + install + build + pm2 reload + save
```

O manualmente:
```bash
git pull origin main && npm install && npm run build && pm2 reload ecosystem.config.js
```

---

## 11. Backups de la base de datos

```bash
# Backup manual
pg_dump "postgresql://landing_user:CLAVE@localhost:5432/landing" > backup_$(date +%F).sql

# Backup diario por cron (3 AM)
0 3 * * * pg_dump "postgresql://landing_user:CLAVE@localhost:5432/landing" > /var/backups/landing_$(date +\%F).sql
```

---

## Notas

- **Sin base de datos:** si dejás `DATABASE_URL` vacío, el sistema funciona con archivos JSON
  en `data/` (válido para un único servidor). Con PostgreSQL escala mejor y soporta múltiples instancias.
- **Credenciales:** se guardan cifradas (AES-256) usando `APP_SECRET`. Definí `APP_SECRET` siempre en producción.
- **Imágenes subidas:** se guardan en `public/uploads/`. En un único servidor funciona; con varias
  instancias conviene un almacenamiento compartido (S3/volumen) — punto a evaluar si escalás horizontalmente.
- **Seguridad:** cambiá la contraseña del admin al primer ingreso (panel → Usuarios) y usá `ADMIN_API_KEY` fuerte.
