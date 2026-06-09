import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import products from '@/data/products.json';
import site from '@/data/site.json';
import { sendTeamEmail } from '@/lib/provision';
import { getSecret } from '@/lib/secrets';
import { rateLimit, clientIp } from '@/lib/rate-limit';

const COMPANY = site.company.name;

const DEMOS_PATH = join(process.cwd(), 'data/demos.json');

interface DemoAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  employees: string;
  productId: string;
  productName: string;
  username: string;
  password: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'converted';
}

function generateUsername(name: string, company: string): string {
  const cleanName = name.toLowerCase().split(' ')[0].replace(/[^a-z]/g, '');
  const cleanCompany = company.toLowerCase().replace(/[^a-z]/g, '').slice(0, 4);
  return `demo_${cleanName}_${cleanCompany}`;
}

function generatePassword(): string {
  return crypto.randomBytes(4).toString('hex') + crypto.randomInt(10, 99);
}

function loadDemos(): DemoAccount[] {
  if (!existsSync(DEMOS_PATH)) return [];
  return JSON.parse(readFileSync(DEMOS_PATH, 'utf-8'));
}

function saveDemos(demos: DemoAccount[]) {
  const dir = join(process.cwd(), 'data');
  if (!existsSync(dir)) {
    const { mkdirSync } = require('fs');
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(DEMOS_PATH, JSON.stringify(demos, null, 2), 'utf-8');
}

function getProductUrls(productId: string): { appUrl: string; apiUrl: string } {
  const urls: Record<string, { appUrl: string; apiUrl: string }> = {
    'prepaga-digital': {
      appUrl: process.env.PREPAGA_URL || 'https://prepaga.novatechpy.com',
      apiUrl: process.env.PREPAGA_API_URL || 'https://prepaga-api.novatechpy.com',
    },
    'sishoras': {
      appUrl: process.env.SISHORAS_URL || 'https://sishoras.novatechpy.com',
      apiUrl: process.env.SISHORAS_API_URL || 'https://sishoras-api.novatechpy.com',
    },
    'ticket-v2': {
      appUrl: process.env.TICKET_URL || 'https://tickets.novatechpy.com',
      apiUrl: process.env.TICKET_API_URL || 'https://tickets-api.novatechpy.com',
    },
    'comedor': {
      appUrl: process.env.COMEDOR_URL || 'https://comedor.novatechpy.com',
      apiUrl: process.env.COMEDOR_API_URL || 'https://comedor-api.novatechpy.com',
    },
    'visioncore': {
      appUrl: process.env.VISIONCORE_URL || 'https://visioncore.novatechpy.com',
      apiUrl: process.env.VISIONCORE_API_URL || 'https://visioncore-api.novatechpy.com',
    },
    'rrhh-completo': {
      appUrl: process.env.RRHH_URL || 'https://rrhh.novatechpy.com',
      apiUrl: process.env.RRHH_API_URL || 'https://rrhh-api.novatechpy.com',
    },
  };
  return urls[productId] || { appUrl: '#', apiUrl: '#' };
}

async function createDemoInProduct(productId: string, account: DemoAccount) {
  const { apiUrl } = getProductUrls(productId);
  const apiKey = getSecret('DEMO_PROVISION_API_KEY');

  if (!apiKey || apiUrl === '#') return;

  try {
    await fetch(`${apiUrl}/api/demo/provision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        username: account.username,
        password: account.password,
        name: account.name,
        email: account.email,
        company: account.company,
        expiresAt: account.expiresAt,
      }),
    });
  } catch {
    // Log but don't fail — account will be created manually if auto-provision fails
  }
}

async function sendCredentialsEmail(account: DemoAccount) {
  const smtpHost = getSecret('SMTP_HOST');
  const smtpPort = Number(getSecret('SMTP_PORT') || '587');
  const smtpUser = getSecret('SMTP_USER');
  const smtpPass = getSecret('SMTP_PASS');
  const fromEmail = getSecret('EMAIL_FROM') || 'demo@novatechpy.com';

  if (!smtpHost || !smtpUser || !smtpPass) return;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const { appUrl } = getProductUrls(account.productId);

  await transporter.sendMail({
    from: `"${COMPANY}" <${fromEmail}>`,
    to: account.email,
    subject: `Tu demo de ${account.productName} está lista — ${COMPANY}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050508;font-family:system-ui,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#fff;font-size:18px;margin:0;">${COMPANY}</h1>
    </div>

    <div style="background:#0a0a0f;border:1px solid #1e1e2e;border-radius:12px;padding:32px;">
      <h2 style="color:#fff;font-size:20px;margin:0 0 8px;">¡Tu demo está lista!</h2>
      <p style="color:#64648a;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Hola <strong style="color:#e4e4e7;">${account.name}</strong>, tu cuenta demo de
        <strong style="color:#818cf8;">${account.productName}</strong> ya está activa
        por 15 días.
      </p>

      <div style="background:#12121a;border-radius:8px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#64648a;font-size:12px;padding:6px 0;">URL de acceso</td>
            <td style="color:#22d3ee;font-size:13px;text-align:right;padding:6px 0;">
              <a href="${appUrl}" style="color:#22d3ee;text-decoration:none;">${appUrl}</a>
            </td>
          </tr>
          <tr>
            <td style="color:#64648a;font-size:12px;padding:6px 0;">Usuario</td>
            <td style="color:#fff;font-size:13px;text-align:right;padding:6px 0;font-family:monospace;">${account.username}</td>
          </tr>
          <tr>
            <td style="color:#64648a;font-size:12px;padding:6px 0;">Contraseña</td>
            <td style="color:#fff;font-size:13px;text-align:right;padding:6px 0;font-family:monospace;">${account.password}</td>
          </tr>
          <tr>
            <td style="color:#64648a;font-size:12px;padding:6px 0;">Válido hasta</td>
            <td style="color:#10b981;font-size:13px;text-align:right;padding:6px 0;">
              ${new Date(account.expiresAt).toLocaleDateString('es-PY', { day: 'numeric', month: 'long', year: 'numeric' })}
            </td>
          </tr>
        </table>
      </div>

      <a href="${appUrl}" style="display:block;text-align:center;background:#fff;color:#050508;text-decoration:none;padding:12px;border-radius:8px;font-size:14px;font-weight:600;">
        Acceder a mi demo
      </a>
    </div>

    <p style="color:#64648a;font-size:11px;text-align:center;margin-top:24px;line-height:1.5;">
      ¿Necesitás ayuda? Respondé este email o escribinos al WhatsApp.<br>
      ${COMPANY} · ${site.company.address}
    </p>
  </div>
</body>
</html>`,
  });
}

async function notifyTeam(account: DemoAccount) {
  const whatsappToken = getSecret('WHATSAPP_API_TOKEN');
  const phoneNumberId = getSecret('WHATSAPP_PHONE_NUMBER_ID');
  const notificationPhone = getSecret('NOTIFICATION_PHONE');

  if (!whatsappToken || !phoneNumberId || !notificationPhone) return;

  await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${whatsappToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: notificationPhone,
      type: 'text',
      text: {
        body: `🆕 *Nueva demo activada*\n\n👤 ${account.name}\n🏢 ${account.company}\n📧 ${account.email}\n📱 ${account.phone}\n👥 ${account.employees} empleados\n📦 ${account.productName}\n🔑 ${account.username}\n📅 Expira: ${new Date(account.expiresAt).toLocaleDateString('es-PY')}`,
      },
    }),
  });
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(`demo:${clientIp(request)}`, 5, 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Demasiadas solicitudes. Esperá un minuto.' }, { status: 429 });

  const body = await request.json();
  const { name, email, phone, company, employees, product: productId } = body;

  // Honeypot anti-bot: si el campo oculto viene completo, es un bot
  if (body.website) return NextResponse.json({ status: 'ok' });

  if (!name || !email || !company || !productId) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    return NextResponse.json({ error: 'Producto no válido' }, { status: 400 });
  }

  const demos = loadDemos();
  const existing = demos.find((d) => d.email === email && d.productId === productId && d.status === 'active');
  if (existing) {
    return NextResponse.json({ error: 'Ya tenés una demo activa para este producto. Revisá tu email.' }, { status: 409 });
  }

  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + 15);

  const account: DemoAccount = {
    id: crypto.randomUUID(),
    name,
    email,
    phone: phone || '',
    company,
    employees: employees || '',
    productId,
    productName: product.name,
    username: generateUsername(name, company),
    password: generatePassword(),
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    status: 'active',
  };

  demos.push(account);
  saveDemos(demos);

  // Fire and forget — don't block the response
  Promise.allSettled([
    createDemoInProduct(productId, account),
    sendCredentialsEmail(account),
    notifyTeam(account),
    sendTeamEmail(
      `Nueva demo — ${account.company}`,
      `Nueva solicitud de demo:\n\nNombre: ${account.name}\nEmpresa: ${account.company}\nEmail: ${account.email}\nTeléfono: ${account.phone}\nProducto: ${account.productName}\nUsuario: ${account.username}\nExpira: ${new Date(account.expiresAt).toLocaleDateString('es-PY')}`
    ),
  ]);

  return NextResponse.json({
    status: 'ok',
    message: 'Demo creada exitosamente',
    username: account.username,
    expiresAt: account.expiresAt,
  });
}

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const demos = loadDemos();
  return NextResponse.json(demos);
}
