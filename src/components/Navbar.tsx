'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Zap } from 'lucide-react';
import siteData from '@/data/site.json';

const navLinks = [
  { href: '#soluciones', label: 'Soluciones' },
  { href: '#precios', label: 'Precios' },
  { href: '#demo', label: 'Demo' },
  { href: '#contacto', label: 'Contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
      scrolled ? 'glass-strong shadow-[0_4px_30px_rgba(0,0,0,0.3)]' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.3)]">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">{siteData.company.name}</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}
                className="text-[13px] text-muted hover:text-neon-blue transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-neon-blue after:transition-all hover:after:w-full">
                {link.label}
              </a>
            ))}
            <a href="#demo"
              className="text-[13px] px-5 py-2 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue text-white font-medium shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all duration-300">
              <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> 15 días gratis</span>
            </a>
          </div>

          <button className="md:hidden p-2 text-muted" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass-strong border-t border-border/30">
          <div className="px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}
                className="block text-sm text-muted hover:text-neon-blue py-2"
                onClick={() => setMobileOpen(false)}>
                {link.label}
              </a>
            ))}
            <a href="#demo" onClick={() => setMobileOpen(false)}
              className="block text-center text-sm px-4 py-2.5 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue text-white font-medium">
              15 días gratis
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
