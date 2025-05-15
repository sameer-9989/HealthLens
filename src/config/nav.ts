
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Stethoscope, MessageCircleHeart, BookHeart, Settings,
  ActivityIcon, Palette, 
  Zap as StressIcon,
  Lightbulb, UtensilsCrossed, // Added UtensilsCrossed
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  description?: string;
  color?: string; // For dashboard cards
}

export const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview of your health and quick actions.',
    color: "bg-sky-100 dark:bg-sky-900"
  },
  {
    title: 'AI Symptom Checker',
    href: '/symptom-checker',
    icon: Stethoscope,
    description: 'Get diagnostic suggestions for your symptoms. Includes multilingual & cultural sensitivity options.',
    color: "bg-teal-100 dark:bg-teal-900"
  },
  {
    title: 'Virtual Assistant',
    href: '/virtual-assistant',
    icon: MessageCircleHeart,
    description: 'Chat for med info, term explanations, mindfulness, mental wellness support & health guidance.',
    color: "bg-blue-100 dark:bg-blue-900"
  },
  {
    title: 'AI Diet Planner',
    href: '/ai-diet-planner',
    icon: UtensilsCrossed,
    description: 'Get personalized meal plans based on your health goals and preferences.',
    color: "bg-lime-100 dark:bg-lime-900"
  },
   {
    title: 'Health Tracker',
    href: '/health-tracker',
    icon: ActivityIcon, 
    description: 'Log symptoms (session-based), get wellness tips, and basic session trends.',
    color: "bg-indigo-100 dark:bg-indigo-900"
  },
  {
    title: 'Self-Care Plans',
    href: '/self-care-plans',
    icon: BookHeart,
    description: 'AI-generated personalized plans for various conditions & goals.',
    color: "bg-green-100 dark:bg-green-900"
  },
  {
    title: 'Stress Relief Yoga',
    href: '/stress-relief-yoga',
    icon: StressIcon, 
    description: 'AI-suggested yoga types and example video routines for stress.',
    color: "bg-orange-100 dark:bg-orange-900"
  },
  {
    title: 'Health Myth Buster',
    href: '/health-myth-buster',
    icon: Lightbulb,
    description: 'AI-powered debunking of common health myths.',
    color: "bg-yellow-100 dark:bg-yellow-900"
  },
  {
    title: 'Focus & Mental Reset',
    href: '/focus-mental-reset',
    icon: Palette, 
    description: 'Access guided breathing, nature sounds, and meditations.',
    color: "bg-cyan-100 dark:bg-cyan-900"
  },
];


export const secondaryNavItems: NavItem[] = [
  { title: 'Settings', href: '/settings', icon: Settings },
];

    

    