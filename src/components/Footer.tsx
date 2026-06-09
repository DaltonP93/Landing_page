'use client';

import { Zap } from 'lucide-react';
import siteData from '@/data/site.json';
import products from '@/data/products.json';

export default function Footer() {
  const sorted = [...products].sort((a, b) => a.order - b.order);

  return (
    <footer className="relative border-t border-border/20">
      <div className="absolute inset-0 scifi-grid opacity-20" />

      <div className="relative max-w-6xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-[13px]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shadow-[0_0_10px_rgba(0,212,255,0.2)]">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">{siteData.company.name}</span>
            </div>
            <p className="text-muted/50 leading-relaxed">{siteData.footer.tagline}</p>
          </div>
          <div>
            <span className="text-[11px] font-medium text-neon-purple/60 uppercase tracking-wider">Productos</span>
            <ul className="mt-3 space-y-2">
              {sorted.map((p) => (
                <li key={p.id}><a href="#soluciones" className="text-muted/50 hover:text-neon-blue transition-colors">{p.name}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-[11px] font-medium text-neon-purple/60 uppercase tracking-wider">Empresa</span>
            <ul className="mt-3 space-y-2">
              <li><a href="#soluciones" className="text-muted/50 hover:text-neon-blue transition-colors">Soluciones</a></li>
              <li><a href="#precios" className="text-muted/50 hover:text-neon-blue transition-colors">Precios</a></li>
              <li><a href="#demo" className="text-muted/50 hover:text-neon-blue transition-colors">Demo Gratis</a></li>
              <li><a href="/blog" className="text-muted/50 hover:text-neon-blue transition-colors">Blog</a></li>
              <li><a href="#contacto" className="text-muted/50 hover:text-neon-blue transition-colors">Contacto</a></li>
            </ul>
          </div>
          <div>
            <span className="text-[11px] font-medium text-neon-purple/60 uppercase tracking-wider">Contacto</span>
            <ul className="mt-3 space-y-2 text-muted/50">
              <li>{siteData.company.email}</li>
              <li>{siteData.company.phone}</li>
              <li>{siteData.company.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted/30">
          <span>&copy; {new Date().getFullYear()} {siteData.company.name}. Todos los derechos reservados.</span>
          <div className="flex items-center gap-4">
            <a href={siteData.footer.socialLinks.instagram} className="hover:text-neon-blue transition-colors">Instagram</a>
            <a href={siteData.footer.socialLinks.linkedin} className="hover:text-neon-blue transition-colors">LinkedIn</a>
            <a href={siteData.footer.socialLinks.facebook} className="hover:text-neon-blue transition-colors">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
