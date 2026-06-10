# Landing Page — Software Empresarial (Paraguay)

Landing page corporativa, futurista y **100% editable** para una empresa de software paraguaya.
Muestra el catálogo de productos, precios en guaraníes, sistema de **demo gratuita de 15 días**
con provisión automática de cuentas, chatbot de ventas con IA y un **panel de administración
completo** para editar todo el contenido sin tocar código.

## ✨ Características

- **Diseño futurista sci-fi** — glassmorphism, orbes 3D, partículas animadas, glow neón, gradientes animados.
- **CMS por JSON + API REST** — todo el contenido vive en `src/data/*.json` y se edita desde `/admin`.
- **Dashboard de métricas** — KPIs de ventas, leads, conversión e ingresos, con gráficas por producto.
- **Chat con IA (agente de ventas) multi-proveedor** — atiende, recomienda y **capta los leads** (email/teléfono),
  avisando al equipo por WhatsApp **y email**. Soporta Anthropic, OpenAI, **DeepSeek, Qwen, Groq, OpenRouter,
  Mistral, Gemini y Ollama** (local/gratis) o cualquier endpoint OpenAI-compatible; con bot de respaldo.
- **Embudo de conversión** en el dashboard (leads → demos → contrataciones → clientes activos) con % por paso.
- **Sincronización de audiencias por API** — envío directo de leads a **Meta Custom Audiences** y **Google Ads Customer Match** (además del export CSV).
- **Notificaciones por email + WhatsApp** al equipo en cada demo, contratación y lead del chat.
- **Credenciales configurables desde el panel** (pestaña Ajustes) — IA, pagos, marketing, email y WhatsApp;
  se guardan en el servidor (fuera del repo), enmascaradas, con prioridad sobre las variables de entorno.
- **Sincronización automática diaria** de audiencias por cron (`/api/cron/sync-audiences`, Vercel Cron o crontab).
- **Multimoneda (PYG / USD)** con tasa de cambio editable y conversión en vivo en la sección de precios.
- **Historial de conversaciones del chat IA** por lead, visible y expandible en el panel.
- **Autenticación con usuarios y roles** (admin / editor / viewer) — login con usuario y contraseña
  (hash scrypt + token de sesión firmado), gestión de usuarios desde el panel; la API key sigue como acceso maestro.
- **Credenciales cifradas** en reposo (AES-256-GCM con `APP_SECRET`).
- **Páginas legales** (`/privacidad`, `/terminos`) + **banner de cookies** que activa los píxeles solo con consentimiento.
- **Rate limiting** y **honeypot anti-bot** en chat, demos y checkout.
- **Blog del CEO** — gestión de artículos en Markdown + páginas públicas (`/blog`) con SEO y JSON-LD.
- **Marketing** — exportación de audiencias (emails/teléfonos SHA256) para **Google Ads Customer Match** y **Meta Custom Audiences**.
- **Panel admin integral** (`/admin`) con 9 módulos:
  - **Productos** — alta/baja/edición, **imágenes** (URL o subida), ícono, color, badge, precios.
  - **Contenido** — empresa, hero, stats, ventajas, testimonios, FAQ, footer/redes, **integraciones** y **cobros**.
  - **Promociones** — ofertas con descuento **por tiempo limitado** (cuenta regresiva en la landing).
  - **Campañas** — Google/Facebook/Instagram/Email con **constructor de UTM** rastreable.
  - **Cobros** — suscripciones, estados y **habilitar/deshabilitar acceso** a cada sistema.
  - **Leads / Demos** — todas las solicitudes de demo con credenciales generadas.
- **Cobro directo** — checkout en `/contratar/[producto]` con cálculo de promo, IVA y total.
- **Pasarela de pago** — Bancard, Stripe o transferencia (configurable en el panel), con **webhook** que activa la cuenta y habilita el acceso al confirmarse el pago.
- **Páginas de producto** (`/producto/[id]`) con galería de imágenes, características y datos completos.
- **SEO** — `sitemap.xml`, `robots.txt` y datos estructurados (schema.org/JSON-LD) para aparecer en Google.
- **Demo gratuita 15 días** — genera usuario/contraseña, email (Nodemailer), aviso por WhatsApp y provisión vía API.
- **Integraciones de marketing** — Google Analytics, GTM, Google Ads, Search Console y Facebook Pixel,
  configurables desde el panel e inyectadas automáticamente.
- **Chatbot de ventas** — responde sobre productos, precios y demos leyendo los datos reales.
- **Nombre de marca centralizado** — se cambia en un solo lugar y se propaga a SEO, emails y footer.
- **Escalable** — agregar un producto, promo o campaña es una entrada más en el panel.

## 🧱 Stack

| Capa        | Tecnología                            |
|-------------|---------------------------------------|
| Framework   | Next.js 16 (App Router) + React 19    |
| Lenguaje    | TypeScript                            |
| Estilos     | Tailwind CSS v4                       |
| Íconos      | lucide-react                          |
| Email       | Nodemailer (SMTP)                     |
| Mensajería  | WhatsApp Business Cloud API (Meta)    |

## 🚀 Desarrollo

```bash
npm install
cp .env.example .env.local   # completar las variables
npm run dev                  # http://localhost:3000
```

- Landing: `/`
- Panel admin: `/admin` (ingresar con `ADMIN_API_KEY`)

## 🔧 Variables de entorno

Ver `.env.example`. Las principales:

| Variable | Descripción |
|----------|-------------|
| `ADMIN_API_KEY` | Clave para acceder y guardar cambios en `/admin`. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` | Envío de credenciales de demo por email. |
| `WHATSAPP_VERIFY_TOKEN` / `WHATSAPP_API_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` / `NOTIFICATION_PHONE` | Webhook y notificaciones de WhatsApp. |
| `DEMO_PROVISION_API_KEY` | Clave compartida para provisionar la demo en cada producto. |
| `<PRODUCTO>_URL` / `<PRODUCTO>_API_URL` | URLs de cada sistema para acceso y provisión de demos. |

> Las variables son secretas: nunca se commitean (`.env*` está en `.gitignore`).

## 📁 Estructura

```
src/
├── app/
│   ├── page.tsx              # Landing (compone todas las secciones)
│   ├── layout.tsx            # Metadata SEO dinámica (lee site.json)
│   ├── admin/page.tsx        # Panel de administración completo
│   ├── globals.css           # Tema futurista (glass, orbes, neón, grids)
│   └── api/
│       ├── products/route.ts # GET/PUT catálogo de productos
│       ├── site/route.ts     # GET/PUT contenido del sitio
│       ├── demo/route.ts     # POST solicitar demo · GET listar leads
│       ├── auth/route.ts     # POST validar API key del admin
│       └── whatsapp/route.ts # Webhook del chatbot de WhatsApp
├── components/               # Navbar, Hero, Products, Pricing, etc.
├── data/
│   ├── products.json         # Catálogo (editable desde /admin)
│   └── site.json             # Empresa, hero, stats, FAQ, footer...
├── hooks/useScrollReveal.ts  # Animaciones al hacer scroll
└── lib/
    ├── icons.ts              # Registro único de íconos + selector
    └── format.ts             # Formato de guaraníes y links de WhatsApp
```

## 📝 Editar el contenido

Todo se edita desde **`/admin`** sin tocar código:

1. **Productos** — alta/baja/edición, precios, ícono (selector visual), color, badge, orden, características.
2. **Contenido del sitio** — empresa (el **nombre** se propaga a SEO/emails/footer), hero, estadísticas, ventajas, testimonios, FAQ, footer y redes sociales.
3. **Leads / Demos** — tabla con todas las solicitudes de demo, credenciales generadas y estado.

> En producción los cambios se persisten en los archivos JSON. En entornos serverless de
> solo-lectura (p. ej. Vercel) conviene migrar la persistencia a una base de datos.

## 🗄️ Base de datos (PostgreSQL)

Los datos de clientes (demos, suscripciones, leads del chat, usuarios) pueden guardarse en
**PostgreSQL** o en **archivos JSON** (modo por defecto, sin configuración).

- Si definís `DATABASE_URL`, el sistema usa Postgres automáticamente.
- Esquema en [`database/schema.sql`](database/schema.sql) (tabla JSONB + vistas de reporte).

```bash
npm run db:schema    # crea tablas y vistas
npm run db:migrate   # migra los datos JSON existentes a Postgres
```

## 🌐 Deploy

Guía completa paso a paso (VPS Ubuntu + Nginx + PM2 + dominio + SSL + PostgreSQL):
**[DESPLIEGUE.md](DESPLIEGUE.md)**.

Resumen:
```bash
npm install
npm run build
pm2 start npm --name landing -- start    # detrás de Nginx + Certbot (SSL)
```
