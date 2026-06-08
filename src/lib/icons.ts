import {
  Heart, Clock, Ticket, UtensilsCrossed, Camera, Users,
  Shield, Zap, Headphones, TrendingUp, Building2, Briefcase,
  Calendar, CreditCard, Database, FileText, Globe, Lock, Mail,
  MessageSquare, Settings, Smartphone, Star, Truck, Wallet,
  BarChart3, Bell, Box, Cloud, Cpu, Fingerprint, Layers,
  LineChart, Map, Package, PieChart, Server, ShoppingCart,
  Stethoscope, Video, Wifi, Activity,
} from 'lucide-react';

export type IconName = keyof typeof ICONS;

/** Registro único de íconos disponibles en toda la app (landing + admin). */
export const ICONS = {
  Heart, Clock, Ticket, UtensilsCrossed, Camera, Users,
  Shield, Zap, Headphones, TrendingUp, Building2, Briefcase,
  Calendar, CreditCard, Database, FileText, Globe, Lock, Mail,
  MessageSquare, Settings, Smartphone, Star, Truck, Wallet,
  BarChart3, Bell, Box, Cloud, Cpu, Fingerprint, Layers,
  LineChart, Map, Package, PieChart, Server, ShoppingCart,
  Stethoscope, Video, Wifi, Activity,
} as const;

/** Lista de nombres para el selector visual del panel admin. */
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

/** Devuelve el componente de ícono por nombre, con fallback a Box. */
export function getIcon(name: string): React.ComponentType<React.SVGProps<SVGSVGElement>> {
  return (ICONS as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[name] || Box;
}
