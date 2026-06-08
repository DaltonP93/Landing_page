'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Save, Plus, Trash2, ArrowLeft, Eye, Package, Settings2,
  Users as UsersIcon, LogOut, ChevronDown, RefreshCw, Search,
  Lock,
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

type Tab = 'productos' | 'sitio' | 'leads';

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
  const [authenticated, setAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [site, setSite] = useState<SiteData | null>(null);
  const [demos, setDemos] = useState<Demo[]>([]);
  const [tab, setTab] = useState<Tab>('productos');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState<string | null>(null);

  /* ── Sesión persistente ── */
  useEffect(() => {
    const stored = sessionStorage.getItem('admin_key');
    if (stored) { setApiKey(stored); setAuthenticated(true); }
  }, []);

  const loadAll = useCallback((key: string) => {
    fetch('/api/products').then((r) => r.json()).then(setProducts).catch(() => {});
    fetch('/api/site').then((r) => r.json()).then(setSite).catch(() => {});
    fetch('/api/demo', { headers: { 'x-api-key': key } })
      .then((r) => (r.ok ? r.json() : []))
      .then(setDemos)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (authenticated && apiKey) loadAll(apiKey);
  }, [authenticated, apiKey, loadAll]);

  const flash = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const login = async () => {
    if (!apiKey) return;
    setLoggingIn(true); setLoginError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Clave incorrecta');
      }
      sessionStorage.setItem('admin_key', apiKey);
      setAuthenticated(true);
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('admin_key');
    setAuthenticated(false); setApiKey('');
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
      badge: '', demoUrl: '#', order: products.length + 1,
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
            type="password" placeholder="API Key" value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
            className={`${input} mb-3`}
          />
          {loginError && <p className="text-xs text-neon-pink mb-3">{loginError}</p>}
          <button onClick={login} disabled={loggingIn || !apiKey} className={`${btnPrimary} w-full justify-center`}>
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
        <div className="flex gap-1 p-1 rounded-xl glass border border-border/20 w-fit">
          {([
            ['productos', 'Productos', Package, products.length],
            ['sitio', 'Contenido del sitio', Settings2, null],
            ['leads', 'Leads / Demos', UsersIcon, activeDemos],
          ] as [Tab, string, React.ComponentType<React.SVGProps<SVGSVGElement>>, number | null][]).map(([t, lbl, Ico, count]) => (
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

            <div className="sticky bottom-4 flex justify-end">
              <button onClick={saveSite} disabled={saving} className={btnPrimary}><Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar todo el sitio'}</button>
            </div>
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
          </div>
        )}
      </div>
    </div>
  );
}
