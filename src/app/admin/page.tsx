'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import {
  Save, Plus, Trash2, ArrowLeft, Eye, Package, Settings2,
  Users as UsersIcon, LogOut, ChevronDown, RefreshCw, Search,
  Lock, Tag, Megaphone, CreditCard, Upload, Copy, Power,
  Image as ImageIcon, Link2, LayoutDashboard, Newspaper, Download,
  Bot, TrendingUp, KeyRound,
} from 'lucide-react';
import { ICON_NAMES, getIcon } from '@/lib/icons';

/* ───────────────────────── Tipos ───────────────────────── */

interface Product {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  targetAudience: string[];
  pricing: { monthly: number; annual: number; currency: string; popular: boolean };
  badge: string;
  image: string;
  gallery: string[];
  demoUrl: string;
  order: number;
}

interface SiteData {
  company: Record<string, string>;
  hero: Record<string, string>;
  stats: { value: string; label: string }[];
  whyUs: { icon: string; title: string; description: string }[];
  testimonials: { name: string; role: string; company: string; text: string; avatar: string }[];
  faq: { question: string; answer: string }[];
  footer: { tagline: string; socialLinks: Record<string, string> };
  integrations: Record<string, string>;
  billing: {
    enabled: boolean; currency: string; taxPercent: number; gateway: string;
    paymentMethods: string[]; bankInfo: string; checkoutNote: string; setupFee: number;
    currencies: string[]; rates: Record<string, number>;
  };
  ai: { provider: string; model: string; baseUrl: string };
}

interface Promotion {
  id: string; title: string; description: string; discountPercent: number;
  code: string; productIds: string[]; startsAt: string; endsAt: string;
  active: boolean; color: string;
}

interface Campaign {
  id: string; name: string; channel: string; status: string; budget: number;
  startsAt: string; endsAt: string;
  utm: { source: string; medium: string; campaign: string; content: string };
  landingPath: string; notes: string;
}

interface Subscription {
  id: string; name: string; email: string; phone: string; company: string;
  productId: string; productName: string; plan: string; amount: number;
  promoCode: string; paymentMethod: string;
  status: 'pending' | 'active' | 'suspended' | 'cancelled';
  accessEnabled: boolean; createdAt: string; activatedAt: string | null;
}

interface Demo {
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

interface BlogPost {
  id: string; slug: string; title: string; excerpt: string; content: string;
  author: string; coverImage: string; tags: string[]; published: boolean;
  publishedAt: string; seoDescription: string;
}

interface ChatLead {
  id: string; email: string; phone: string; name: string;
  interest: string; firstSeen: string; lastMessage: string; transcript: string;
}

interface SecretGroup {
  group: string;
  keys: { name: string; label: string; configured: boolean; source: string; hint: string }[];
}

type Tab = 'dashboard' | 'productos' | 'sitio' | 'promociones' | 'campanas' | 'marketing' | 'cobros' | 'leads' | 'blog' | 'ajustes' | 'usuarios';

/* ─────────────────── Estilos reutilizables ─────────────────── */

const input =
  'w-full px-3 py-2 rounded-lg bg-surface/50 border border-border/30 text-white text-sm placeholder:text-muted/30 focus:outline-none focus:border-neon-blue/40 focus:shadow-[0_0_15px_rgba(0,212,255,0.08)] transition-all';
const label = 'block text-[11px] text-muted/70 mb-1.5 uppercase tracking-wide';
const card = 'rounded-xl glass border border-border/20 p-5';
const btnPrimary =
  'flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue text-white font-medium text-sm shadow-[0_0_20px_rgba(124,58,237,0.25)] hover:shadow-[0_0_30px_rgba(0,212,255,0.35)] transition-all disabled:opacity-40';

/* ──────────────────── Selector de íconos ──────────────────── */

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const Current = getIcon(value);
  const filtered = ICON_NAMES.filter((n) => n.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`${input} flex items-center justify-between`}
      >
        <span className="flex items-center gap-2">
          <Current className="w-4 h-4 text-neon-blue" />
          <span className="text-muted/80">{value || 'Elegir ícono'}</span>
        </span>
        <ChevronDown className="w-4 h-4 text-muted/50" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto rounded-lg glass-strong border border-border/30 p-2 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 px-2 py-1.5 mb-2 rounded-md bg-surface/50 border border-border/20">
            <Search className="w-3.5 h-3.5 text-muted/50" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar ícono..."
              className="flex-1 bg-transparent text-xs text-white placeholder:text-muted/30 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-6 gap-1">
            {filtered.map((name) => {
              const Ico = getIcon(name);
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => { onChange(name); setOpen(false); setQ(''); }}
                  className={`aspect-square rounded-md flex items-center justify-center transition-all ${
                    value === name
                      ? 'bg-neon-blue/20 border border-neon-blue/40 text-neon-blue'
                      : 'hover:bg-white/5 text-muted/70 hover:text-white'
                  }`}
                >
                  <Ico className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────── Página ──────────────────────── */

export default function AdminPage() {
  const [apiKey, setApiKey] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('admin');
  const [authenticated, setAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [users, setUsers] = useState<{ id: string; username: string; role: string; createdAt: string }[]>([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'viewer' });

  const [products, setProducts] = useState<Product[]>([]);
  const [site, setSite] = useState<SiteData | null>(null);
  const [demos, setDemos] = useState<Demo[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [blog, setBlog] = useState<BlogPost[]>([]);
  const [chatLeads, setChatLeads] = useState<ChatLead[]>([]);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [openChat, setOpenChat] = useState<string | null>(null);
  const [secrets, setSecretsState] = useState<SecretGroup[]>([]);
  const [secretDraft, setSecretDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState<string | null>(null);

  /* ── Sesión persistente ── */
  useEffect(() => {
    const stored = sessionStorage.getItem('admin_key');
    if (stored) { setApiKey(stored); setRole(sessionStorage.getItem('admin_role') || 'admin'); setAuthenticated(true); }
  }, []);

  const loadAll = useCallback((key: string) => {
    fetch('/api/products').then((r) => r.json()).then(setProducts).catch(() => {});
    fetch('/api/site').then((r) => r.json()).then(setSite).catch(() => {});
    fetch('/api/demo', { headers: { 'x-api-key': key } })
      .then((r) => (r.ok ? r.json() : []))
      .then(setDemos)
      .catch(() => {});
    fetch('/api/promotions').then((r) => r.json()).then(setPromotions).catch(() => {});
    fetch('/api/campaigns', { headers: { 'x-api-key': key } })
      .then((r) => (r.ok ? r.json() : []))
      .then(setCampaigns)
      .catch(() => {});
    fetch('/api/billing', { headers: { 'x-api-key': key } })
      .then((r) => (r.ok ? r.json() : []))
      .then(setSubs)
      .catch(() => {});
    fetch('/api/blog').then((r) => r.json()).then(setBlog).catch(() => {});
    fetch('/api/chat', { headers: { 'x-api-key': key } })
      .then((r) => (r.ok ? r.json() : []))
      .then(setChatLeads)
      .catch(() => {});
    fetch('/api/secrets', { headers: { 'x-api-key': key } })
      .then((r) => (r.ok ? r.json() : []))
      .then(setSecretsState)
      .catch(() => {});
    fetch('/api/users', { headers: { 'x-api-key': key } })
      .then((r) => (r.ok ? r.json() : []))
      .then(setUsers)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (authenticated && apiKey) loadAll(apiKey);
  }, [authenticated, apiKey, loadAll]);

  const flash = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const login = async () => {
    if (!username && !apiKey) return;
    setLoggingIn(true); setLoginError('');
    try {
      const payload = username ? { username, password } : { apiKey };
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Credenciales incorrectas');
      }
      const data = await res.json();
      sessionStorage.setItem('admin_key', data.token);
      sessionStorage.setItem('admin_role', data.role);
      setApiKey(data.token);
      setRole(data.role);
      setAuthenticated(true);
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('admin_key');
    sessionStorage.removeItem('admin_role');
    setAuthenticated(false); setApiKey(''); setUsername(''); setPassword('');
  };

  /* ── Usuarios (solo rol admin) ── */
  const loadUsers = useCallback(() => {
    fetch('/api/users', { headers: { 'x-api-key': apiKey } })
      .then((r) => (r.ok ? r.json() : []))
      .then(setUsers)
      .catch(() => {});
  }, [apiKey]);

  const addUser = async () => {
    if (!newUser.username || !newUser.password) return;
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(newUser) });
    if (res.ok) { setNewUser({ username: '', password: '', role: 'viewer' }); loadUsers(); flash('✓ Usuario creado'); }
    else { const d = await res.json().catch(() => ({})); flash(`✗ ${d.error || 'Error'}`); }
  };

  const updateUserRole = async (id: string, r: string) => {
    const res = await fetch('/api/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify({ id, role: r }) });
    if (res.ok) { loadUsers(); flash('✓ Rol actualizado'); }
  };

  const deleteUser = async (id: string) => {
    const res = await fetch('/api/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify({ id }) });
    if (res.ok) { loadUsers(); flash('✓ Usuario eliminado'); }
    else { const d = await res.json().catch(() => ({})); flash(`✗ ${d.error || 'Error'}`); }
  };

  /* ── Guardado ── */
  const saveProducts = async () => {
    setSaving(true);
    const res = await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(products),
    });
    setSaving(false);
    flash(res.ok ? '✓ Productos guardados' : '✗ Error al guardar');
  };

  const saveSite = async () => {
    if (!site) return;
    setSaving(true);
    const res = await fetch('/api/site', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(site),
    });
    setSaving(false);
    flash(res.ok ? '✓ Sitio guardado' : '✗ Error al guardar');
  };

  const savePromotions = async () => {
    setSaving(true);
    const res = await fetch('/api/promotions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(promotions),
    });
    setSaving(false);
    flash(res.ok ? '✓ Promociones guardadas' : '✗ Error al guardar');
  };

  const saveCampaigns = async () => {
    setSaving(true);
    const res = await fetch('/api/campaigns', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(campaigns),
    });
    setSaving(false);
    flash(res.ok ? '✓ Campañas guardadas' : '✗ Error al guardar');
  };

  const saveBlog = async () => {
    setSaving(true);
    const res = await fetch('/api/blog', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(blog),
    });
    setSaving(false);
    flash(res.ok ? '✓ Blog guardado' : '✗ Error al guardar');
  };

  const downloadAudience = async (type: 'google' | 'meta') => {
    const res = await fetch(`/api/marketing/audience?type=${type}`, { headers: { 'x-api-key': apiKey } });
    if (!res.ok) { flash('✗ Error al exportar'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audiencia-${type}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    flash('✓ Audiencia exportada');
  };

  const syncAudience = async (platform: 'meta' | 'google') => {
    flash('Sincronizando...');
    const res = await fetch(`/api/marketing/sync?platform=${platform}`, { method: 'POST', headers: { 'x-api-key': apiKey } });
    const data = await res.json().catch(() => ({}));
    flash(data.ok ? `✓ ${data.received} contactos enviados a ${platform}` : `✗ ${data.error || 'Error'}`);
  };

  const saveSecrets = async () => {
    setSaving(true);
    const res = await fetch('/api/secrets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({ secrets: secretDraft }),
    });
    setSaving(false);
    if (res.ok) {
      setSecretDraft({});
      fetch('/api/secrets', { headers: { 'x-api-key': apiKey } }).then((r) => r.json()).then(setSecretsState).catch(() => {});
      flash('✓ Credenciales guardadas');
    } else {
      flash('✗ Error al guardar');
    }
  };

  const patchSub = async (id: string, body: { status?: string; accessEnabled?: boolean }) => {
    const res = await fetch('/api/billing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({ id, ...body }),
    });
    if (res.ok) {
      const { subscription } = await res.json();
      setSubs((prev) => prev.map((s) => (s.id === id ? subscription : s)));
      flash('✓ Suscripción actualizada');
    } else {
      flash('✗ Error al actualizar');
    }
  };

  /** Sube una imagen y devuelve su URL pública. */
  const uploadImage = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', headers: { 'x-api-key': apiKey }, body: fd });
    if (!res.ok) { flash('✗ Error al subir imagen'); return null; }
    const { url } = await res.json();
    flash('✓ Imagen subida');
    return url;
  };

  /* ── Helpers de productos ── */
  const updateProduct = (id: string, field: string, value: unknown) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (field.startsWith('pricing.')) {
          const k = field.split('.')[1];
          return { ...p, pricing: { ...p.pricing, [k]: value } };
        }
        return { ...p, [field]: value };
      })
    );
  };

  const addProduct = () => {
    const np: Product = {
      id: `producto-${Date.now()}`,
      name: 'Nuevo Producto', shortName: 'Nuevo', tagline: 'Descripción corta',
      description: 'Descripción completa del producto.', icon: 'Box', color: '#00d4ff',
      features: ['Característica 1', 'Característica 2', 'Característica 3'],
      targetAudience: ['Público objetivo'],
      pricing: { monthly: 500000, annual: 5000000, currency: 'PYG', popular: false },
      badge: '', image: '', gallery: [], demoUrl: '#', order: products.length + 1,
    };
    setProducts([...products, np]);
    setEditing(np.id);
  };

  /* ── Helpers genéricos de site arrays ── */
  const setSiteField = (path: string[], value: unknown) => {
    setSite((prev) => {
      if (!prev) return prev;
      const copy: SiteData = JSON.parse(JSON.stringify(prev));
      let node: Record<string, unknown> = copy as unknown as Record<string, unknown>;
      for (let i = 0; i < path.length - 1; i++) node = node[path[i]] as Record<string, unknown>;
      node[path[path.length - 1]] = value;
      return copy;
    });
  };

  /* ───────────────────── LOGIN ───────────────────── */
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
        <div className="orb orb-purple w-[400px] h-[400px] top-[10%] left-[20%] animate-float-slow opacity-40" />
        <div className="orb orb-blue w-[350px] h-[350px] bottom-[10%] right-[15%] animate-float-slower opacity-40" />
        <div className="absolute inset-0 scifi-grid opacity-30" />
        <div className="relative w-full max-w-sm p-8 rounded-2xl glass-strong border border-neon-purple/20 shadow-[0_0_50px_rgba(0,0,0,0.4)]">
          <div className="w-12 h-12 mx-auto mb-5 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white text-center glow-text">Panel de Administración</h1>
          <p className="text-xs text-muted/60 text-center mt-1 mb-6">Ingresá tu API key para gestionar el contenido</p>
          <input
            type="text" placeholder="Usuario" value={username} autoComplete="username"
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
            className={`${input} mb-3`}
          />
          <input
            type="password" placeholder="Contraseña" value={password} autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
            className={`${input} mb-3`}
          />
          <details className="mb-3">
            <summary className="text-[11px] text-muted/50 cursor-pointer hover:text-neon-blue">o ingresar con API key</summary>
            <input
              type="password" placeholder="API Key" value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && login()}
              className={`${input} mt-2`}
            />
          </details>
          {loginError && <p className="text-xs text-neon-pink mb-3">{loginError}</p>}
          <button onClick={login} disabled={loggingIn || (!username && !apiKey)} className={`${btnPrimary} w-full justify-center`}>
            {loggingIn ? 'Verificando...' : 'Acceder'}
          </button>
          <a href="/" className="block text-center text-xs text-muted/50 hover:text-neon-blue mt-4 transition-colors">← Volver a la landing</a>
        </div>
      </div>
    );
  }

  const activeDemos = demos.filter((d) => d.status === 'active').length;

  /* ───────────────────── DASHBOARD ───────────────────── */
  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-strong border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-muted/60 hover:text-neon-blue transition-colors"><ArrowLeft className="w-5 h-5" /></a>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
              <Settings2 className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-sm font-bold">Panel de Administración</h1>
          </div>
          <div className="flex items-center gap-3">
            {message && <span className="text-xs text-neon-green animate-pulse">{message}</span>}
            <button onClick={() => loadAll(apiKey)} title="Recargar" className="p-2 rounded-lg hover:bg-white/5 text-muted/60 hover:text-white transition-colors"><RefreshCw className="w-4 h-4" /></button>
            <a href="/" target="_blank" title="Ver landing" className="p-2 rounded-lg hover:bg-white/5 text-muted/60 hover:text-white transition-colors"><Eye className="w-4 h-4" /></a>
            <button onClick={logout} title="Salir" className="p-2 rounded-lg hover:bg-neon-pink/10 text-muted/60 hover:text-neon-pink transition-colors"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex flex-wrap gap-1 p-1 rounded-xl glass border border-border/20">
          {([
            ['dashboard', 'Dashboard', LayoutDashboard, null],
            ['productos', 'Productos', Package, products.length],
            ['sitio', 'Contenido', Settings2, null],
            ['promociones', 'Promociones', Tag, promotions.length],
            ['campanas', 'Campañas', Megaphone, campaigns.length],
            ['marketing', 'Marketing', TrendingUp, null],
            ['cobros', 'Cobros', CreditCard, subs.filter((s) => s.status === 'pending').length],
            ['leads', 'Leads', UsersIcon, activeDemos + chatLeads.length],
            ['blog', 'Blog', Newspaper, blog.length],
            ['ajustes', 'Ajustes', KeyRound, null],
            ['usuarios', 'Usuarios', UsersIcon, users.length],
          ] as [Tab, string, React.ComponentType<React.SVGProps<SVGSVGElement>>, number | null][])
            .filter(([t]) => !((t === 'ajustes' || t === 'usuarios') && role !== 'admin'))
            .map(([t, lbl, Ico, count]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-[0_0_15px_rgba(124,58,237,0.25)]' : 'text-muted/60 hover:text-white'
              }`}
            >
              <Ico className="w-4 h-4" /> {lbl}
              {count !== null && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">{count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ═══════════ DASHBOARD ═══════════ */}
        {tab === 'dashboard' && (() => {
          const activeSubs = subs.filter((s) => s.status === 'active');
          const revenue = activeSubs.reduce((t, s) => t + s.amount, 0);
          const totalLeads = demos.length + chatLeads.length;
          const conv = demos.length ? Math.round((subs.length / demos.length) * 100) : 0;
          const byProductLeads = products.map((p) => ({ name: p.shortName, value: demos.filter((d) => d.productId === p.id).length }));
          const byProductRev = products.map((p) => ({ name: p.shortName, value: activeSubs.filter((s) => s.productId === p.id).reduce((t, s) => t + s.amount, 0) }));
          const maxLeads = Math.max(1, ...byProductLeads.map((x) => x.value));
          const maxRev = Math.max(1, ...byProductRev.map((x) => x.value));
          const withPromo = subs.filter((s) => s.promoCode).length;
          const funnel: [string, number, string][] = [
            ['Leads captados', totalLeads, 'from-neon-blue to-neon-blue/40'],
            ['Demos activadas', demos.length, 'from-neon-purple to-neon-purple/40'],
            ['Contrataciones', subs.length, 'from-neon-pink to-neon-pink/40'],
            ['Clientes activos', activeSubs.length, 'from-neon-green to-neon-green/40'],
          ];
          const funnelMax = Math.max(1, totalLeads);
          const kpis: [string, string, string][] = [
            ['Leads totales', String(totalLeads), 'text-neon-blue'],
            ['Demos activas', String(demos.filter((d) => d.status === 'active').length), 'text-neon-green'],
            ['Contrataciones', String(subs.length), 'text-neon-purple'],
            ['Ingresos activos', `Gs. ${revenue.toLocaleString('es-PY')}`, 'text-white'],
            ['Conversión', `${conv}%`, 'text-neon-pink'],
          ];
          return (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {kpis.map(([lbl, val, cls]) => (
                  <div key={lbl} className={card}>
                    <div className={`text-xl font-bold ${cls}`}>{val}</div>
                    <div className="text-[11px] text-muted/50 mt-1">{lbl}</div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className={card}>
                  <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><UsersIcon className="w-4 h-4 text-neon-blue" /> Leads por producto</h3>
                  <div className="space-y-2.5">
                    {byProductLeads.map((x) => (
                      <div key={x.name} className="flex items-center gap-3">
                        <span className="w-20 text-xs text-muted/60 shrink-0 truncate">{x.name}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full bg-gradient-to-r from-neon-purple to-neon-blue rounded-full" style={{ width: `${(x.value / maxLeads) * 100}%` }} /></div>
                        <span className="w-8 text-right text-xs text-white">{x.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={card}>
                  <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-neon-green" /> Ingresos por producto</h3>
                  <div className="space-y-2.5">
                    {byProductRev.map((x) => (
                      <div key={x.name} className="flex items-center gap-3">
                        <span className="w-20 text-xs text-muted/60 shrink-0 truncate">{x.name}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full bg-gradient-to-r from-neon-green to-neon-blue rounded-full" style={{ width: `${(x.value / maxRev) * 100}%` }} /></div>
                        <span className="w-20 text-right text-[11px] text-white">{(x.value / 1000).toLocaleString('es-PY')}k</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className={card}><div className="text-lg font-bold text-white">{demos.length}</div><div className="text-[11px] text-muted/50 mt-1">Demos solicitadas</div></div>
                <div className={card}><div className="text-lg font-bold text-neon-blue">{chatLeads.length}</div><div className="text-[11px] text-muted/50 mt-1">Leads del chat IA</div></div>
                <div className={card}><div className="text-lg font-bold text-neon-pink">{withPromo}</div><div className="text-[11px] text-muted/50 mt-1">Ventas con promoción</div></div>
                <div className={card}><div className="text-lg font-bold text-neon-purple">{campaigns.filter((c) => c.status === 'active').length}</div><div className="text-[11px] text-muted/50 mt-1">Campañas activas</div></div>
              </div>

              <div className={card}>
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-neon-green" /> Embudo de conversión</h3>
                <div className="space-y-3">
                  {funnel.map((f, i) => {
                    const [lbl, val, color] = f;
                    const prev = i > 0 ? funnel[i - 1][1] : val;
                    const pct = prev > 0 ? Math.round((val / prev) * 100) : 0;
                    return (
                      <div key={lbl}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted/70">{lbl}</span>
                          <span className="text-white font-medium">{val}{i > 0 && <span className="text-muted/40 ml-2">({pct}% del paso anterior)</span>}</span>
                        </div>
                        <div className="h-6 rounded-lg bg-white/5 overflow-hidden">
                          <div className={`h-full rounded-lg bg-gradient-to-r ${color}`} style={{ width: `${Math.max(4, (val / funnelMax) * 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ═══════════ PRODUCTOS ═══════════ */}
        {tab === 'productos' && (
          <div className="space-y-3">
            {products.sort((a, b) => a.order - b.order).map((product) => {
              const Ico = getIcon(product.icon);
              return (
                <div key={product.id} className="rounded-xl glass border border-border/20 overflow-hidden">
                  <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]" onClick={() => setEditing(editing === product.id ? null : product.id)}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${product.color}1a`, border: `1px solid ${product.color}40` }}>
                        <span style={{ color: product.color }}><Ico className="w-5 h-5" /></span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-2">{product.name}
                          {product.badge && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple">{product.badge}</span>}
                          {product.pricing.popular && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neon-green/20 text-neon-green">Popular</span>}
                        </div>
                        <div className="text-xs text-muted/50">{product.tagline}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted/50">Gs. {product.pricing.monthly.toLocaleString('es-PY')}/mes</span>
                      <button onClick={(e) => { e.stopPropagation(); setProducts((p) => p.filter((x) => x.id !== product.id)); }} className="p-2 rounded-lg hover:bg-neon-pink/10 text-muted/50 hover:text-neon-pink transition-colors"><Trash2 className="w-4 h-4" /></button>
                      <ChevronDown className={`w-4 h-4 text-muted/40 transition-transform ${editing === product.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {editing === product.id && (
                    <div className="border-t border-border/20 p-4 space-y-4">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div><label className={label}>Nombre</label><input value={product.name} onChange={(e) => updateProduct(product.id, 'name', e.target.value)} className={input} /></div>
                        <div><label className={label}>Nombre corto</label><input value={product.shortName} onChange={(e) => updateProduct(product.id, 'shortName', e.target.value)} className={input} /></div>
                        <div><label className={label}>Tagline</label><input value={product.tagline} onChange={(e) => updateProduct(product.id, 'tagline', e.target.value)} className={input} /></div>
                        <div><label className={label}>Ícono</label><IconPicker value={product.icon} onChange={(v) => updateProduct(product.id, 'icon', v)} /></div>
                        <div>
                          <label className={label}>Color</label>
                          <div className="flex gap-2">
                            <input type="color" value={product.color} onChange={(e) => updateProduct(product.id, 'color', e.target.value)} className="w-10 h-9 rounded cursor-pointer bg-transparent border border-border/30" />
                            <input value={product.color} onChange={(e) => updateProduct(product.id, 'color', e.target.value)} className={input} />
                          </div>
                        </div>
                        <div><label className={label}>Badge</label><input value={product.badge} onChange={(e) => updateProduct(product.id, 'badge', e.target.value)} placeholder="Nuevo, Premium..." className={input} /></div>
                        <div><label className={label}>Precio mensual (Gs.)</label><input type="number" value={product.pricing.monthly} onChange={(e) => updateProduct(product.id, 'pricing.monthly', Number(e.target.value))} className={input} /></div>
                        <div><label className={label}>Precio anual (Gs.)</label><input type="number" value={product.pricing.annual} onChange={(e) => updateProduct(product.id, 'pricing.annual', Number(e.target.value))} className={input} /></div>
                        <div><label className={label}>Orden</label><input type="number" value={product.order} onChange={(e) => updateProduct(product.id, 'order', Number(e.target.value))} className={input} /></div>
                        <div><label className={label}>URL demo</label><input value={product.demoUrl} onChange={(e) => updateProduct(product.id, 'demoUrl', e.target.value)} className={input} /></div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-muted/80">
                            <input type="checkbox" checked={product.pricing.popular} onChange={(e) => updateProduct(product.id, 'pricing.popular', e.target.checked)} className="w-4 h-4 rounded accent-neon-purple" />
                            Marcar como Popular
                          </label>
                        </div>
                      </div>
                      <div><label className={label}>Descripción</label><textarea value={product.description} onChange={(e) => updateProduct(product.id, 'description', e.target.value)} rows={2} className={`${input} resize-none`} /></div>
                      <div><label className={label}>Características (una por línea)</label><textarea value={product.features.join('\n')} onChange={(e) => updateProduct(product.id, 'features', e.target.value.split('\n'))} rows={4} className={`${input} resize-none font-mono text-xs`} /></div>
                      <div><label className={label}>Público objetivo (uno por línea)</label><textarea value={product.targetAudience.join('\n')} onChange={(e) => updateProduct(product.id, 'targetAudience', e.target.value.split('\n'))} rows={2} className={`${input} resize-none font-mono text-xs`} /></div>

                      <div>
                        <label className={label}>Imagen del producto</label>
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-14 rounded-lg overflow-hidden border border-border/30 bg-surface/50 flex items-center justify-center shrink-0">
                            {product.image
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={product.image} alt="" className="w-full h-full object-cover" />
                              : <ImageIcon className="w-5 h-5 text-muted/40" />}
                          </div>
                          <input value={product.image} onChange={(e) => updateProduct(product.id, 'image', e.target.value)} placeholder="https://... o subí un archivo →" className={input} />
                          <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border/30 text-xs text-muted/70 hover:text-neon-blue hover:border-neon-blue/40 cursor-pointer transition-all shrink-0">
                            <Upload className="w-3.5 h-3.5" /> Subir
                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (f) { const url = await uploadImage(f); if (url) updateProduct(product.id, 'image', url); }
                            }} />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className={label}>Galería de imágenes</label>
                        <div className="flex flex-wrap gap-2">
                          {product.gallery.map((g, gi) => (
                            <div key={gi} className="relative w-20 h-14 rounded-lg overflow-hidden border border-border/30 group/g">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={g} alt="" className="w-full h-full object-cover" />
                              <button onClick={() => updateProduct(product.id, 'gallery', product.gallery.filter((_, j) => j !== gi))} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover/g:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          ))}
                          <label className="w-20 h-14 rounded-lg border border-dashed border-border/40 flex items-center justify-center cursor-pointer text-muted/40 hover:text-neon-blue hover:border-neon-blue/40 transition-all">
                            <Plus className="w-5 h-5" />
                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const url = await uploadImage(f); if (url) updateProduct(product.id, 'gallery', [...product.gallery, url]); } }} />
                          </label>
                        </div>
                        <input placeholder="...o pegá una URL y presioná Enter" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const t = e.target as HTMLInputElement; const v = t.value.trim(); if (v) { updateProduct(product.id, 'gallery', [...product.gallery, v]); t.value = ''; } } }} className={`${input} mt-2`} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex gap-3 pt-2">
              <button onClick={addProduct} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-dashed border-border/40 text-muted/60 hover:text-neon-blue hover:border-neon-blue/40 transition-all text-sm"><Plus className="w-4 h-4" /> Agregar producto</button>
              <button onClick={saveProducts} disabled={saving} className={btnPrimary}><Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar productos'}</button>
            </div>
          </div>
        )}

        {/* ═══════════ SITIO ═══════════ */}
        {tab === 'sitio' && site && (
          <div className="space-y-5">
            {/* Empresa */}
            <div className={card}>
              <h3 className="font-semibold text-sm mb-1">Datos de la empresa</h3>
              <p className="text-xs text-muted/50 mb-4">El nombre se usa automáticamente en el título SEO, los emails de demo y el footer.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {Object.entries(site.company).map(([k, v]) => (
                  <div key={k}><label className={label}>{k}</label><input value={v} onChange={(e) => setSiteField(['company', k], e.target.value)} className={input} /></div>
                ))}
              </div>
            </div>

            {/* Hero */}
            <div className={card}>
              <h3 className="font-semibold text-sm mb-4">Sección Hero (portada)</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {Object.entries(site.hero).map(([k, v]) => (
                  <div key={k} className={k === 'subtitle' ? 'sm:col-span-2' : ''}><label className={label}>{k}</label><input value={v} onChange={(e) => setSiteField(['hero', k], e.target.value)} className={input} /></div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className={card}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Estadísticas</h3>
                <button onClick={() => setSiteField(['stats'], [...site.stats, { value: '0', label: 'Nueva métrica' }])} className="text-xs text-neon-blue hover:text-neon-purple flex items-center gap-1"><Plus className="w-3 h-3" /> Agregar</button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {site.stats.map((s, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={s.value} onChange={(e) => { const a = [...site.stats]; a[i] = { ...a[i], value: e.target.value }; setSiteField(['stats'], a); }} placeholder="50+" className={`${input} w-24`} />
                    <input value={s.label} onChange={(e) => { const a = [...site.stats]; a[i] = { ...a[i], label: e.target.value }; setSiteField(['stats'], a); }} placeholder="Etiqueta" className={input} />
                    <button onClick={() => setSiteField(['stats'], site.stats.filter((_, j) => j !== i))} className="p-2 text-muted/40 hover:text-neon-pink"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Ventajas */}
            <div className={card}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Ventajas (Why Us)</h3>
                <button onClick={() => setSiteField(['whyUs'], [...site.whyUs, { icon: 'Star', title: 'Nueva ventaja', description: '' }])} className="text-xs text-neon-blue hover:text-neon-purple flex items-center gap-1"><Plus className="w-3 h-3" /> Agregar</button>
              </div>
              <div className="space-y-3">
                {site.whyUs.map((w, i) => (
                  <div key={i} className="grid sm:grid-cols-[180px_1fr_1fr_auto] gap-2 items-start">
                    <IconPicker value={w.icon} onChange={(v) => { const a = [...site.whyUs]; a[i] = { ...a[i], icon: v }; setSiteField(['whyUs'], a); }} />
                    <input value={w.title} onChange={(e) => { const a = [...site.whyUs]; a[i] = { ...a[i], title: e.target.value }; setSiteField(['whyUs'], a); }} placeholder="Título" className={input} />
                    <input value={w.description} onChange={(e) => { const a = [...site.whyUs]; a[i] = { ...a[i], description: e.target.value }; setSiteField(['whyUs'], a); }} placeholder="Descripción" className={input} />
                    <button onClick={() => setSiteField(['whyUs'], site.whyUs.filter((_, j) => j !== i))} className="p-2 text-muted/40 hover:text-neon-pink"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonios */}
            <div className={card}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Testimonios</h3>
                <button onClick={() => setSiteField(['testimonials'], [...site.testimonials, { name: '', role: '', company: '', text: '', avatar: '' }])} className="text-xs text-neon-blue hover:text-neon-purple flex items-center gap-1"><Plus className="w-3 h-3" /> Agregar</button>
              </div>
              <div className="space-y-4">
                {site.testimonials.map((t, i) => (
                  <div key={i} className="rounded-lg bg-surface/30 border border-border/20 p-3 space-y-2">
                    <div className="grid sm:grid-cols-4 gap-2">
                      <input value={t.name} onChange={(e) => { const a = [...site.testimonials]; a[i] = { ...a[i], name: e.target.value }; setSiteField(['testimonials'], a); }} placeholder="Nombre" className={input} />
                      <input value={t.role} onChange={(e) => { const a = [...site.testimonials]; a[i] = { ...a[i], role: e.target.value }; setSiteField(['testimonials'], a); }} placeholder="Cargo" className={input} />
                      <input value={t.company} onChange={(e) => { const a = [...site.testimonials]; a[i] = { ...a[i], company: e.target.value }; setSiteField(['testimonials'], a); }} placeholder="Empresa" className={input} />
                      <input value={t.avatar} onChange={(e) => { const a = [...site.testimonials]; a[i] = { ...a[i], avatar: e.target.value }; setSiteField(['testimonials'], a); }} placeholder="Iniciales (CB)" className={input} />
                    </div>
                    <div className="flex gap-2">
                      <textarea value={t.text} onChange={(e) => { const a = [...site.testimonials]; a[i] = { ...a[i], text: e.target.value }; setSiteField(['testimonials'], a); }} placeholder="Testimonio" rows={2} className={`${input} resize-none`} />
                      <button onClick={() => setSiteField(['testimonials'], site.testimonials.filter((_, j) => j !== i))} className="p-2 text-muted/40 hover:text-neon-pink"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className={card}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Preguntas frecuentes</h3>
                <button onClick={() => setSiteField(['faq'], [...site.faq, { question: '', answer: '' }])} className="text-xs text-neon-blue hover:text-neon-purple flex items-center gap-1"><Plus className="w-3 h-3" /> Agregar</button>
              </div>
              <div className="space-y-3">
                {site.faq.map((f, i) => (
                  <div key={i} className="rounded-lg bg-surface/30 border border-border/20 p-3 space-y-2">
                    <div className="flex gap-2">
                      <input value={f.question} onChange={(e) => { const a = [...site.faq]; a[i] = { ...a[i], question: e.target.value }; setSiteField(['faq'], a); }} placeholder="Pregunta" className={input} />
                      <button onClick={() => setSiteField(['faq'], site.faq.filter((_, j) => j !== i))} className="p-2 text-muted/40 hover:text-neon-pink"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <textarea value={f.answer} onChange={(e) => { const a = [...site.faq]; a[i] = { ...a[i], answer: e.target.value }; setSiteField(['faq'], a); }} placeholder="Respuesta" rows={2} className={`${input} resize-none`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className={card}>
              <h3 className="font-semibold text-sm mb-4">Footer y redes sociales</h3>
              <div className="mb-4"><label className={label}>Tagline del footer</label><input value={site.footer.tagline} onChange={(e) => setSiteField(['footer', 'tagline'], e.target.value)} className={input} /></div>
              <div className="grid sm:grid-cols-3 gap-4">
                {Object.entries(site.footer.socialLinks).map(([k, v]) => (
                  <div key={k}><label className={label}>{k}</label><input value={v} onChange={(e) => setSiteField(['footer', 'socialLinks', k], e.target.value)} placeholder="https://..." className={input} /></div>
                ))}
              </div>
            </div>

            {/* Integraciones de marketing */}
            <div className={card}>
              <h3 className="font-semibold text-sm mb-1">Integraciones (Google y Facebook)</h3>
              <p className="text-xs text-muted/50 mb-4">Pegá los IDs y se inyectan automáticamente en el sitio para analítica, campañas y verificación de Google.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {([
                  ['googleAnalyticsId', 'Google Analytics 4 (G-XXXX)'],
                  ['googleTagManagerId', 'Google Tag Manager (GTM-XXXX)'],
                  ['googleAdsConversionId', 'Google Ads conversión (AW-XXXX)'],
                  ['googleSiteVerification', 'Google Search Console (verificación)'],
                  ['facebookPixelId', 'Facebook Pixel ID'],
                  ['facebookAppId', 'Facebook App ID'],
                  ['facebookPageUrl', 'URL de página de Facebook'],
                ] as [string, string][]).map(([k, lbl]) => (
                  <div key={k}>
                    <label className={label}>{lbl}</label>
                    <input value={site.integrations?.[k] || ''} onChange={(e) => setSiteField(['integrations', k], e.target.value)} className={input} placeholder="(vacío = desactivado)" />
                  </div>
                ))}
              </div>
            </div>

            {/* Configuración de cobros */}
            <div className={card}>
              <h3 className="font-semibold text-sm mb-1">Cobros / Facturación</h3>
              <p className="text-xs text-muted/50 mb-4">Datos que se muestran en el checkout al contratar un sistema.</p>
              <div className="mb-4">
                <label className={label}>Pasarela de pago</label>
                <select value={site.billing.gateway || 'manual'} onChange={(e) => setSiteField(['billing', 'gateway'], e.target.value)} className={`${input} [&>option]:bg-surface`}>
                  <option value="manual">Transferencia / Manual</option>
                  <option value="bancard">Bancard (Paraguay)</option>
                  <option value="stripe">Stripe (tarjetas internacionales)</option>
                </select>
                <p className="text-[11px] text-muted/40 mt-1">Stripe y Bancard requieren configurar sus claves en variables de entorno del servidor.</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div><label className={label}>IVA (%)</label><input type="number" value={site.billing.taxPercent} onChange={(e) => setSiteField(['billing', 'taxPercent'], Number(e.target.value))} className={input} /></div>
                <div><label className={label}>Costo de instalación (Gs.)</label><input type="number" value={site.billing.setupFee} onChange={(e) => setSiteField(['billing', 'setupFee'], Number(e.target.value))} className={input} /></div>
                <div><label className={label}>Tasa USD (1 Gs. = ? USD)</label><input type="number" step="0.000001" value={site.billing.rates?.USD ?? 0} onChange={(e) => setSiteField(['billing', 'rates', 'USD'], Number(e.target.value))} className={input} /></div>
                <div className="flex items-end"><label className="flex items-center gap-2 cursor-pointer text-sm text-muted/80"><input type="checkbox" checked={site.billing.enabled} onChange={(e) => setSiteField(['billing', 'enabled'], e.target.checked)} className="w-4 h-4 rounded accent-neon-purple" /> Cobros habilitados</label></div>
              </div>
              <div className="mb-4"><label className={label}>Medios de pago (separados por coma)</label><input value={site.billing.paymentMethods.join(', ')} onChange={(e) => setSiteField(['billing', 'paymentMethods'], e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} className={input} placeholder="transferencia, tarjeta, bancard" /></div>
              <div className="mb-4"><label className={label}>Datos bancarios / instrucciones de pago</label><textarea value={site.billing.bankInfo} onChange={(e) => setSiteField(['billing', 'bankInfo'], e.target.value)} rows={2} className={`${input} resize-none`} /></div>
              <div><label className={label}>Nota del checkout</label><textarea value={site.billing.checkoutNote} onChange={(e) => setSiteField(['billing', 'checkoutNote'], e.target.value)} rows={2} className={`${input} resize-none`} /></div>
            </div>

            {/* Chat con IA */}
            <div className={card}>
              <h3 className="font-semibold text-sm mb-1 flex items-center gap-2"><Bot className="w-4 h-4 text-neon-blue" /> Chat con IA (agente de ventas)</h3>
              <p className="text-xs text-muted/50 mb-4">Elegí el proveedor. La clave (API key) se carga en variables de entorno del servidor. Ollama es gratis y local (no requiere clave).</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={label}>Proveedor</label>
                  <select value={site.ai?.provider || 'anthropic'} onChange={(e) => setSiteField(['ai', 'provider'], e.target.value)} className={`${input} [&>option]:bg-surface`}>
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="openai">OpenAI (GPT)</option>
                    <option value="deepseek">DeepSeek</option>
                    <option value="qwen">Qwen (DashScope)</option>
                    <option value="groq">Groq</option>
                    <option value="openrouter">OpenRouter</option>
                    <option value="mistral">Mistral</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="ollama">Ollama (local · gratis)</option>
                    <option value="custom">Personalizado (OpenAI-compatible)</option>
                  </select>
                </div>
                <div><label className={label}>Modelo (opcional)</label><input value={site.ai?.model || ''} onChange={(e) => setSiteField(['ai', 'model'], e.target.value)} placeholder="ej: deepseek-chat, llama3.1" className={input} /></div>
                <div><label className={label}>Base URL (custom/Ollama)</label><input value={site.ai?.baseUrl || ''} onChange={(e) => setSiteField(['ai', 'baseUrl'], e.target.value)} placeholder="http://localhost:11434/v1" className={input} /></div>
              </div>
              <p className="text-[11px] text-muted/40 mt-2">Claves por proveedor: ANTHROPIC_API_KEY, OPENAI_API_KEY, DEEPSEEK_API_KEY, QWEN_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, MISTRAL_API_KEY, GEMINI_API_KEY — o una genérica AI_API_KEY.</p>
            </div>

            <div className="sticky bottom-4 flex justify-end">
              <button onClick={saveSite} disabled={saving} className={btnPrimary}><Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar todo el sitio'}</button>
            </div>
          </div>
        )}

        {/* ═══════════ PROMOCIONES ═══════════ */}
        {tab === 'promociones' && (
          <div className="space-y-3">
            <p className="text-xs text-muted/50">Ofertas con descuento por tiempo limitado. Se muestran como banner con cuenta regresiva y aplican el precio rebajado en la sección de precios y el checkout.</p>
            {promotions.map((p, i) => (
              <div key={p.id} className={`${card} space-y-3`}>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div><label className={label}>Título</label><input value={p.title} onChange={(e) => { const a = [...promotions]; a[i] = { ...a[i], title: e.target.value }; setPromotions(a); }} className={input} /></div>
                  <div><label className={label}>Código</label><input value={p.code} onChange={(e) => { const a = [...promotions]; a[i] = { ...a[i], code: e.target.value }; setPromotions(a); }} className={input} /></div>
                  <div><label className={label}>Descuento (%)</label><input type="number" value={p.discountPercent} onChange={(e) => { const a = [...promotions]; a[i] = { ...a[i], discountPercent: Number(e.target.value) }; setPromotions(a); }} className={input} /></div>
                  <div><label className={label}>Color</label><div className="flex gap-2"><input type="color" value={p.color} onChange={(e) => { const a = [...promotions]; a[i] = { ...a[i], color: e.target.value }; setPromotions(a); }} className="w-10 h-9 rounded cursor-pointer bg-transparent border border-border/30" /><input value={p.color} onChange={(e) => { const a = [...promotions]; a[i] = { ...a[i], color: e.target.value }; setPromotions(a); }} className={input} /></div></div>
                  <div className="sm:col-span-2"><label className={label}>Descripción</label><input value={p.description} onChange={(e) => { const a = [...promotions]; a[i] = { ...a[i], description: e.target.value }; setPromotions(a); }} className={input} /></div>
                  <div><label className={label}>Inicio</label><input type="datetime-local" value={p.startsAt.slice(0, 16)} onChange={(e) => { const a = [...promotions]; a[i] = { ...a[i], startsAt: new Date(e.target.value).toISOString() }; setPromotions(a); }} className={input} /></div>
                  <div><label className={label}>Fin</label><input type="datetime-local" value={p.endsAt.slice(0, 16)} onChange={(e) => { const a = [...promotions]; a[i] = { ...a[i], endsAt: new Date(e.target.value).toISOString() }; setPromotions(a); }} className={input} /></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-muted/70 cursor-pointer"><input type="checkbox" checked={p.active} onChange={(e) => { const a = [...promotions]; a[i] = { ...a[i], active: e.target.checked }; setPromotions(a); }} className="w-4 h-4 rounded accent-neon-purple" /> Activa</label>
                    <span className="text-[11px] text-muted/40">Productos: {p.productIds.length === 0 ? 'todos' : p.productIds.join(', ')}</span>
                  </div>
                  <button onClick={() => setPromotions(promotions.filter((_, j) => j !== i))} className="p-2 text-muted/40 hover:text-neon-pink"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div>
                  <label className={label}>Aplica a productos (vacío = todos)</label>
                  <div className="flex flex-wrap gap-2">
                    {products.map((prod) => {
                      const on = p.productIds.includes(prod.id);
                      return (
                        <button key={prod.id} type="button" onClick={() => { const a = [...promotions]; const set = on ? p.productIds.filter((x) => x !== prod.id) : [...p.productIds, prod.id]; a[i] = { ...a[i], productIds: set }; setPromotions(a); }}
                          className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${on ? 'border-neon-purple/40 bg-neon-purple/15 text-white' : 'border-border/30 text-muted/50 hover:text-white'}`}>{prod.shortName}</button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setPromotions([...promotions, { id: `promo-${Date.now()}`, title: 'Nueva promo', description: '', discountPercent: 10, code: '', productIds: [], startsAt: new Date().toISOString(), endsAt: new Date(Date.now() + 7 * 86400000).toISOString(), active: true, color: '#ff2d92' }])} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-dashed border-border/40 text-muted/60 hover:text-neon-blue hover:border-neon-blue/40 transition-all text-sm"><Plus className="w-4 h-4" /> Agregar promoción</button>
              <button onClick={savePromotions} disabled={saving} className={btnPrimary}><Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar promociones'}</button>
            </div>
          </div>
        )}

        {/* ═══════════ CAMPAÑAS ═══════════ */}
        {tab === 'campanas' && (
          <div className="space-y-3">
            <p className="text-xs text-muted/50">Gestioná campañas de Google, Facebook, Instagram o email. El constructor de UTM genera el link rastreable para usar en tus anuncios.</p>
            {campaigns.map((c, i) => {
              const base = (site?.company.name ? '' : '') + (typeof window !== 'undefined' ? window.location.origin : '');
              const utmUrl = `${base}${c.landingPath || '/'}?utm_source=${encodeURIComponent(c.utm.source)}&utm_medium=${encodeURIComponent(c.utm.medium)}&utm_campaign=${encodeURIComponent(c.utm.campaign)}${c.utm.content ? `&utm_content=${encodeURIComponent(c.utm.content)}` : ''}`;
              return (
                <div key={c.id} className={`${card} space-y-3`}>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="lg:col-span-2"><label className={label}>Nombre</label><input value={c.name} onChange={(e) => { const a = [...campaigns]; a[i] = { ...a[i], name: e.target.value }; setCampaigns(a); }} className={input} /></div>
                    <div><label className={label}>Canal</label><select value={c.channel} onChange={(e) => { const a = [...campaigns]; a[i] = { ...a[i], channel: e.target.value }; setCampaigns(a); }} className={`${input} [&>option]:bg-surface`}><option value="google">Google</option><option value="facebook">Facebook</option><option value="instagram">Instagram</option><option value="email">Email</option><option value="otro">Otro</option></select></div>
                    <div><label className={label}>Estado</label><select value={c.status} onChange={(e) => { const a = [...campaigns]; a[i] = { ...a[i], status: e.target.value }; setCampaigns(a); }} className={`${input} [&>option]:bg-surface`}><option value="draft">Borrador</option><option value="active">Activa</option><option value="paused">Pausada</option><option value="ended">Finalizada</option></select></div>
                    <div><label className={label}>Presupuesto (Gs.)</label><input type="number" value={c.budget} onChange={(e) => { const a = [...campaigns]; a[i] = { ...a[i], budget: Number(e.target.value) }; setCampaigns(a); }} className={input} /></div>
                    <div><label className={label}>Inicio</label><input type="date" value={c.startsAt} onChange={(e) => { const a = [...campaigns]; a[i] = { ...a[i], startsAt: e.target.value }; setCampaigns(a); }} className={input} /></div>
                    <div><label className={label}>Fin</label><input type="date" value={c.endsAt} onChange={(e) => { const a = [...campaigns]; a[i] = { ...a[i], endsAt: e.target.value }; setCampaigns(a); }} className={input} /></div>
                  </div>
                  <div className="grid sm:grid-cols-4 gap-3">
                    <div><label className={label}>UTM source</label><input value={c.utm.source} onChange={(e) => { const a = [...campaigns]; a[i] = { ...a[i], utm: { ...a[i].utm, source: e.target.value } }; setCampaigns(a); }} className={input} /></div>
                    <div><label className={label}>UTM medium</label><input value={c.utm.medium} onChange={(e) => { const a = [...campaigns]; a[i] = { ...a[i], utm: { ...a[i].utm, medium: e.target.value } }; setCampaigns(a); }} className={input} /></div>
                    <div><label className={label}>UTM campaign</label><input value={c.utm.campaign} onChange={(e) => { const a = [...campaigns]; a[i] = { ...a[i], utm: { ...a[i].utm, campaign: e.target.value } }; setCampaigns(a); }} className={input} /></div>
                    <div><label className={label}>UTM content</label><input value={c.utm.content} onChange={(e) => { const a = [...campaigns]; a[i] = { ...a[i], utm: { ...a[i].utm, content: e.target.value } }; setCampaigns(a); }} className={input} /></div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-surface/40 border border-border/20">
                    <Link2 className="w-3.5 h-3.5 text-neon-blue shrink-0" />
                    <code className="text-[11px] text-muted/70 truncate flex-1">{utmUrl}</code>
                    <button onClick={() => navigator.clipboard?.writeText(utmUrl).then(() => flash('✓ Link copiado'))} className="p-1.5 rounded text-muted/50 hover:text-neon-blue shrink-0"><Copy className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex items-center justify-between">
                    <input value={c.notes} onChange={(e) => { const a = [...campaigns]; a[i] = { ...a[i], notes: e.target.value }; setCampaigns(a); }} placeholder="Notas (keywords, segmentación...)" className={`${input} flex-1 mr-2`} />
                    <button onClick={() => setCampaigns(campaigns.filter((_, j) => j !== i))} className="p-2 text-muted/40 hover:text-neon-pink"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setCampaigns([...campaigns, { id: `camp-${Date.now()}`, name: 'Nueva campaña', channel: 'google', status: 'draft', budget: 0, startsAt: '', endsAt: '', utm: { source: 'google', medium: 'cpc', campaign: '', content: '' }, landingPath: '/', notes: '' }])} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-dashed border-border/40 text-muted/60 hover:text-neon-blue hover:border-neon-blue/40 transition-all text-sm"><Plus className="w-4 h-4" /> Agregar campaña</button>
              <button onClick={saveCampaigns} disabled={saving} className={btnPrimary}><Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar campañas'}</button>
            </div>
          </div>
        )}

        {/* ═══════════ COBROS ═══════════ */}
        {tab === 'cobros' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ['Pendientes', subs.filter((s) => s.status === 'pending').length, 'text-warning'],
                ['Activas', subs.filter((s) => s.status === 'active').length, 'text-neon-green'],
                ['Con acceso', subs.filter((s) => s.accessEnabled).length, 'text-neon-blue'],
                ['Ingresos activos', subs.filter((s) => s.status === 'active').reduce((t, s) => t + s.amount, 0), 'text-white'],
              ].map(([lbl, val, cls], i) => (
                <div key={lbl as string} className={card}>
                  <div className={`text-2xl font-bold ${cls}`}>{i === 3 ? `Gs. ${(val as number).toLocaleString('es-PY')}` : (val as number)}</div>
                  <div className="text-xs text-muted/50 mt-1">{lbl as string}</div>
                </div>
              ))}
            </div>
            {subs.length === 0 ? (
              <div className={`${card} text-center py-12 text-muted/50 text-sm`}>Todavía no hay contrataciones.</div>
            ) : (
              <div className="rounded-xl glass border border-border/20 overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border/20 text-left text-[11px] uppercase tracking-wide text-muted/50">
                    <th className="p-3 font-medium">Cliente</th><th className="p-3 font-medium">Producto</th><th className="p-3 font-medium">Monto</th><th className="p-3 font-medium">Estado</th><th className="p-3 font-medium">Acceso</th><th className="p-3 font-medium">Acciones</th>
                  </tr></thead>
                  <tbody>
                    {subs.slice().reverse().map((s) => (
                      <tr key={s.id} className="border-b border-border/10 hover:bg-white/[0.02]">
                        <td className="p-3"><div className="font-medium text-white">{s.company}</div><div className="text-xs text-muted/50">{s.name} · {s.email}</div></td>
                        <td className="p-3 text-muted/70">{s.productName}<div className="text-xs text-muted/40">{s.plan === 'annual' ? 'Anual' : 'Mensual'}{s.promoCode && ` · ${s.promoCode}`}</div></td>
                        <td className="p-3 text-muted/80">Gs. {s.amount.toLocaleString('es-PY')}</td>
                        <td className="p-3">
                          <select value={s.status} onChange={(e) => patchSub(s.id, { status: e.target.value })} className="bg-surface/50 border border-border/30 rounded px-2 py-1 text-xs text-white focus:outline-none [&>option]:bg-surface">
                            <option value="pending">Pendiente</option><option value="active">Activa</option><option value="suspended">Suspendida</option><option value="cancelled">Cancelada</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <button onClick={() => patchSub(s.id, { accessEnabled: !s.accessEnabled })} className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full transition-all ${s.accessEnabled ? 'bg-neon-green/15 text-neon-green' : 'bg-white/5 text-muted/50 hover:text-white'}`}>
                            <Power className="w-3 h-3" /> {s.accessEnabled ? 'Habilitado' : 'Deshabilitado'}
                          </button>
                        </td>
                        <td className="p-3 text-xs text-muted/40">{new Date(s.createdAt).toLocaleDateString('es-PY')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ LEADS ═══════════ */}
        {tab === 'leads' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ['Total', demos.length, 'text-white'],
                ['Activas', demos.filter((d) => d.status === 'active').length, 'text-neon-green'],
                ['Expiradas', demos.filter((d) => d.status === 'expired').length, 'text-muted'],
                ['Convertidas', demos.filter((d) => d.status === 'converted').length, 'text-neon-blue'],
              ].map(([lbl, val, cls]) => (
                <div key={lbl as string} className={card}>
                  <div className={`text-2xl font-bold ${cls}`}>{val as number}</div>
                  <div className="text-xs text-muted/50 mt-1">{lbl as string}</div>
                </div>
              ))}
            </div>

            {demos.length === 0 ? (
              <div className={`${card} text-center py-12 text-muted/50 text-sm`}>Todavía no hay solicitudes de demo.</div>
            ) : (
              <div className="rounded-xl glass border border-border/20 overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/20 text-left text-[11px] uppercase tracking-wide text-muted/50">
                      <th className="p-3 font-medium">Contacto</th>
                      <th className="p-3 font-medium">Empresa</th>
                      <th className="p-3 font-medium">Producto</th>
                      <th className="p-3 font-medium">Credenciales</th>
                      <th className="p-3 font-medium">Expira</th>
                      <th className="p-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demos.slice().reverse().map((d) => (
                      <tr key={d.id} className="border-b border-border/10 hover:bg-white/[0.02]">
                        <td className="p-3">
                          <div className="font-medium text-white">{d.name}</div>
                          <div className="text-xs text-muted/50">{d.email}</div>
                          {d.phone && <div className="text-xs text-muted/40">{d.phone}</div>}
                        </td>
                        <td className="p-3 text-muted/70">{d.company}<div className="text-xs text-muted/40">{d.employees} empleados</div></td>
                        <td className="p-3 text-muted/70">{d.productName}</td>
                        <td className="p-3 font-mono text-xs"><div className="text-neon-blue">{d.username}</div><div className="text-muted/50">{d.password}</div></td>
                        <td className="p-3 text-muted/60 text-xs">{new Date(d.expiresAt).toLocaleDateString('es-PY')}</td>
                        <td className="p-3">
                          <span className={`text-[10px] px-2 py-1 rounded-full ${
                            d.status === 'active' ? 'bg-neon-green/15 text-neon-green' : d.status === 'converted' ? 'bg-neon-blue/15 text-neon-blue' : 'bg-white/5 text-muted/50'
                          }`}>{d.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {chatLeads.length > 0 && (
              <div className="rounded-xl glass border border-border/20 overflow-hidden overflow-x-auto">
                <div className="px-4 py-3 border-b border-border/20 flex items-center gap-2 text-sm font-semibold"><Bot className="w-4 h-4 text-neon-blue" /> Leads captados por el chat IA</div>
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border/20 text-left text-[11px] uppercase tracking-wide text-muted/50">
                    <th className="p-3 font-medium">Contacto</th><th className="p-3 font-medium">Interés</th><th className="p-3 font-medium">Fecha</th><th className="p-3 font-medium">Chat</th>
                  </tr></thead>
                  <tbody>
                    {chatLeads.slice().reverse().map((l) => (
                      <Fragment key={l.id}>
                        <tr className="border-b border-border/10 hover:bg-white/[0.02]">
                          <td className="p-3"><div className="text-neon-blue">{l.email}</div><div className="text-xs text-muted/50">{l.phone || '—'}</div></td>
                          <td className="p-3 text-muted/70 max-w-xs"><div className="truncate">{l.interest}</div></td>
                          <td className="p-3 text-xs text-muted/40">{new Date(l.firstSeen).toLocaleDateString('es-PY')}</td>
                          <td className="p-3"><button onClick={() => setOpenChat(openChat === l.id ? null : l.id)} className="text-xs text-neon-blue hover:text-neon-purple">{openChat === l.id ? 'Ocultar' : 'Ver conversación'}</button></td>
                        </tr>
                        {openChat === l.id && (
                          <tr><td colSpan={4} className="p-0">
                            <pre className="m-3 p-3 rounded-lg bg-surface/50 border border-border/20 text-[12px] text-muted/70 whitespace-pre-wrap font-mono max-h-72 overflow-y-auto">{l.transcript || 'Sin transcripción.'}</pre>
                          </td></tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ MARKETING ═══════════ */}
        {tab === 'marketing' && (
          <div className="space-y-5">
            <div className={card}>
              <h3 className="font-semibold text-sm mb-1 flex items-center gap-2"><Download className="w-4 h-4 text-neon-blue" /> Audiencias para publicidad</h3>
              <p className="text-xs text-muted/50 mb-4">Exportá tus leads (demos + contrataciones + chat) con email y teléfono hasheados en SHA256, listos para subir como audiencia en Google Ads o Meta.</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => downloadAudience('google')} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border/30 text-sm text-white hover:border-neon-blue/40 hover:shadow-[0_0_15px_rgba(0,212,255,0.1)] transition-all"><Download className="w-4 h-4" /> Google Ads (Customer Match)</button>
                <button onClick={() => downloadAudience('meta')} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border/30 text-sm text-white hover:border-neon-purple/40 hover:shadow-[0_0_15px_rgba(124,58,237,0.1)] transition-all"><Download className="w-4 h-4" /> Meta (Custom Audience)</button>
              </div>
            </div>

            <div className={card}>
              <h3 className="font-semibold text-sm mb-1 flex items-center gap-2"><RefreshCw className="w-4 h-4 text-neon-green" /> Sincronización automática por API</h3>
              <p className="text-xs text-muted/50 mb-4">Envía tus leads directamente a la audiencia configurada (sin descargar CSV). Requiere las credenciales de cada plataforma en variables de entorno.</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => syncAudience('google')} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-neon-blue/80 to-neon-blue/40 text-white text-sm hover:shadow-[0_0_20px_rgba(0,212,255,0.25)] transition-all"><RefreshCw className="w-4 h-4" /> Sincronizar con Google Ads</button>
                <button onClick={() => syncAudience('meta')} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-neon-purple/80 to-neon-purple/40 text-white text-sm hover:shadow-[0_0_20px_rgba(124,58,237,0.25)] transition-all"><RefreshCw className="w-4 h-4" /> Sincronizar con Meta</button>
              </div>
              <p className="text-[11px] text-muted/40 mt-2">Meta: META_ACCESS_TOKEN, META_CUSTOM_AUDIENCE_ID · Google: GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CUSTOMER_ID, GOOGLE_ADS_USER_LIST_ID + OAuth.</p>
            </div>
            <div className={card}>
              <h3 className="font-semibold text-sm mb-1">Píxeles y seguimiento</h3>
              <p className="text-xs text-muted/50 mb-3">El seguimiento se activa cargando los IDs en <button onClick={() => setTab('sitio')} className="text-neon-blue underline">Contenido → Integraciones</button>.</p>
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                {([['Google Analytics', 'googleAnalyticsId'], ['Google Tag Manager', 'googleTagManagerId'], ['Google Ads', 'googleAdsConversionId'], ['Facebook Pixel', 'facebookPixelId']] as [string, string][]).map(([lbl, k]) => (
                  <div key={k} className="flex items-center justify-between p-2 rounded-lg bg-surface/40 border border-border/20"><span className="text-muted/70">{lbl}</span><span className={site?.integrations?.[k] ? 'text-neon-green' : 'text-muted/40'}>{site?.integrations?.[k] ? '✓ activo' : 'sin configurar'}</span></div>
                ))}
              </div>
            </div>
            <div className={card}>
              <h3 className="font-semibold text-sm mb-3">Generación de leads</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><div className="text-xl font-bold text-neon-green">{demos.length}</div><div className="text-[11px] text-muted/50">Demos</div></div>
                <div><div className="text-xl font-bold text-neon-blue">{chatLeads.length}</div><div className="text-[11px] text-muted/50">Chat IA</div></div>
                <div><div className="text-xl font-bold text-neon-purple">{subs.length}</div><div className="text-[11px] text-muted/50">Contrataciones</div></div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ BLOG ═══════════ */}
        {tab === 'blog' && (
          <div className="space-y-3">
            <p className="text-xs text-muted/50">Artículos del blog del CEO. El contenido admite Markdown (## título, **negrita**, - listas, [texto](url)).</p>
            {blog.map((post, i) => (
              <div key={post.id} className={`${card} space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-muted/70 cursor-pointer"><input type="checkbox" checked={post.published} onChange={(e) => { const a = [...blog]; a[i] = { ...a[i], published: e.target.checked }; setBlog(a); }} className="w-4 h-4 rounded accent-neon-purple" /> Publicado</label>
                    <span className="text-[11px] text-muted/40">/blog/{post.slug || '...'}</span>
                  </div>
                  <button onClick={() => setBlog(blog.filter((_, j) => j !== i))} className="p-2 text-muted/40 hover:text-neon-pink"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><label className={label}>Título</label><input value={post.title} onChange={(e) => { const a = [...blog]; const slug = a[i].slug || e.target.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); a[i] = { ...a[i], title: e.target.value, slug }; setBlog(a); }} className={input} /></div>
                  <div><label className={label}>Slug (URL)</label><input value={post.slug} onChange={(e) => { const a = [...blog]; a[i] = { ...a[i], slug: e.target.value }; setBlog(a); }} className={input} /></div>
                  <div><label className={label}>Autor</label><input value={post.author} onChange={(e) => { const a = [...blog]; a[i] = { ...a[i], author: e.target.value }; setBlog(a); }} className={input} /></div>
                  <div><label className={label}>Fecha</label><input type="date" value={(post.publishedAt || '').slice(0, 10)} onChange={(e) => { const a = [...blog]; a[i] = { ...a[i], publishedAt: new Date(e.target.value).toISOString() }; setBlog(a); }} className={input} /></div>
                  <div><label className={label}>Etiquetas (coma)</label><input value={post.tags.join(', ')} onChange={(e) => { const a = [...blog]; a[i] = { ...a[i], tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }; setBlog(a); }} className={input} /></div>
                  <div>
                    <label className={label}>Imagen de portada</label>
                    <div className="flex gap-2">
                      <input value={post.coverImage} onChange={(e) => { const a = [...blog]; a[i] = { ...a[i], coverImage: e.target.value }; setBlog(a); }} placeholder="URL o subir →" className={input} />
                      <label className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border/30 text-xs text-muted/70 hover:text-neon-blue cursor-pointer shrink-0"><Upload className="w-3.5 h-3.5" /><input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const url = await uploadImage(f); if (url) { const a = [...blog]; a[i] = { ...a[i], coverImage: url }; setBlog(a); } } }} /></label>
                    </div>
                  </div>
                </div>
                <div><label className={label}>Extracto</label><textarea value={post.excerpt} onChange={(e) => { const a = [...blog]; a[i] = { ...a[i], excerpt: e.target.value }; setBlog(a); }} rows={2} className={`${input} resize-none`} /></div>
                <div><label className={label}>Contenido (Markdown)</label><textarea value={post.content} onChange={(e) => { const a = [...blog]; a[i] = { ...a[i], content: e.target.value }; setBlog(a); }} rows={8} className={`${input} resize-none font-mono text-xs`} /></div>
                <div><label className={label}>Descripción SEO</label><input value={post.seoDescription} onChange={(e) => { const a = [...blog]; a[i] = { ...a[i], seoDescription: e.target.value }; setBlog(a); }} className={input} /></div>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setBlog([...blog, { id: `post-${Date.now()}`, slug: '', title: 'Nuevo artículo', excerpt: '', content: '## Título\n\nEscribí acá tu contenido en **Markdown**.', author: 'CEO', coverImage: '', tags: [], published: false, publishedAt: new Date().toISOString(), seoDescription: '' }])} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-dashed border-border/40 text-muted/60 hover:text-neon-blue hover:border-neon-blue/40 transition-all text-sm"><Plus className="w-4 h-4" /> Nuevo artículo</button>
              <button onClick={saveBlog} disabled={saving} className={btnPrimary}><Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar blog'}</button>
            </div>
          </div>
        )}

        {/* ═══════════ AJUSTES / CREDENCIALES ═══════════ */}
        {tab === 'ajustes' && (
          <div className="space-y-5">
            <div className={`${card} flex items-start gap-3`}>
              <KeyRound className="w-5 h-5 text-neon-blue mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-sm">Credenciales del sistema</h3>
                <p className="text-xs text-muted/50 mt-1">Configurá acá las claves de IA, pagos, marketing, email y WhatsApp. Se guardan en el servidor (fuera del repositorio) y nunca se muestran completas. Dejá un campo vacío para no modificarlo. Lo que cargues acá tiene prioridad sobre las variables de entorno.</p>
              </div>
            </div>
            {secrets.map((g) => (
              <div key={g.group} className={card}>
                <h3 className="font-semibold text-sm mb-4">{g.group}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {g.keys.map((k) => (
                    <div key={k.name}>
                      <label className={label}>
                        {k.label}
                        {k.configured && <span className={`ml-2 text-[10px] ${k.source === 'panel' ? 'text-neon-green' : 'text-neon-blue'}`}>✓ {k.source}</span>}
                      </label>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={secretDraft[k.name] ?? ''}
                        onChange={(e) => setSecretDraft({ ...secretDraft, [k.name]: e.target.value })}
                        placeholder={k.configured ? `configurado (${k.hint})` : 'sin configurar'}
                        className={input}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="sticky bottom-4 flex justify-end">
              <button onClick={saveSecrets} disabled={saving} className={btnPrimary}><Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar credenciales'}</button>
            </div>
          </div>
        )}

        {/* ═══════════ USUARIOS ═══════════ */}
        {tab === 'usuarios' && (
          <div className="space-y-4">
            <p className="text-xs text-muted/50">Gestioná los usuarios del panel y sus roles. <strong className="text-white">admin</strong>: acceso total. <strong className="text-white">editor</strong>: edita contenido. <strong className="text-white">viewer</strong>: solo lectura.</p>
            <div className={card}>
              <h3 className="font-semibold text-sm mb-4">Nuevo usuario</h3>
              <div className="grid sm:grid-cols-4 gap-3">
                <input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} placeholder="Usuario" className={input} />
                <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="Contraseña" className={input} />
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className={`${input} [&>option]:bg-surface`}>
                  <option value="viewer">Viewer</option><option value="editor">Editor</option><option value="admin">Admin</option>
                </select>
                <button onClick={addUser} className={btnPrimary}><Plus className="w-4 h-4" /> Crear</button>
              </div>
            </div>
            <div className="rounded-xl glass border border-border/20 overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border/20 text-left text-[11px] uppercase tracking-wide text-muted/50">
                  <th className="p-3 font-medium">Usuario</th><th className="p-3 font-medium">Rol</th><th className="p-3 font-medium">Creado</th><th className="p-3"></th>
                </tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border/10 hover:bg-white/[0.02]">
                      <td className="p-3 text-white">{u.username}</td>
                      <td className="p-3">
                        <select value={u.role} onChange={(e) => updateUserRole(u.id, e.target.value)} className="bg-surface/50 border border-border/30 rounded px-2 py-1 text-xs text-white focus:outline-none [&>option]:bg-surface">
                          <option value="viewer">Viewer</option><option value="editor">Editor</option><option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-3 text-xs text-muted/40">{new Date(u.createdAt).toLocaleDateString('es-PY')}</td>
                      <td className="p-3"><button onClick={() => deleteUser(u.id)} className="p-2 text-muted/40 hover:text-neon-pink"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
