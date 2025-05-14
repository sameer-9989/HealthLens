import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Stethoscope, MessageCircleHeart, BookHeart, Library, UsersIcon, Settings,
  FileText, Activity, Languages, UserCheck, BotMessageSquare, HelpCircle, ShieldAlert, ListChecks, Brain, Palette
} from 'lucide-react'; // Changed some icons for better fit

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
    description: 'Get diagnostic suggestions for your symptoms.',
    color: "bg-teal-100 dark:bg-teal-900"
  },
  { 
    title: 'Virtual Assistant', 
    href: '/virtual-assistant', 
    icon: MessageCircleHeart,
    description: 'Chat for medication reminders and health guidance.',
    color: "bg-blue-100 dark:bg-blue-900"
  },
  { 
    title: 'Self-Care Plans', 
    href: '/self-care-plans', 
    icon: BookHeart,
    description: 'Access various plans for your well-being.',
    color: "bg-green-100 dark:bg-green-900"
  },
  { 
    title: 'Health Literacy Coach', 
    href: '/health-literacy-coach', 
    icon: HelpCircle,
    description: 'Understand medical terms in plain language.',
    color: "bg-purple-100 dark:bg-purple-900"
  },
  { 
    title: 'Digital Therapeutics', 
    href: '/therapeutics-library', 
    icon: Library,
    description: 'Interactive exercises for mental wellness.',
    color: "bg-indigo-100 dark:bg-indigo-900"
  },
  { 
    title: 'Care Coordination', 
    href: '/care-coordination', 
    icon: UsersIcon,
    description: 'Organize notes for doctor visits and summarize outcomes.',
    color: "bg-pink-100 dark:bg-pink-900"
  },
  { 
    title: 'Routine Builder', 
    href: '/routine-builder', 
    icon: ListChecks,
    description: 'Create personalized daily health checklists.',
    color: "bg-yellow-100 dark:bg-yellow-900"
  },
  { 
    title: 'Symptom Timeline', 
    href: '/symptom-timeline', 
    icon: Activity,
    description: 'Track your symptom progression over time.',
    color: "bg-red-100 dark:bg-red-900"
  },
  { 
    title: 'Multilingual Companion', 
    href: '/multilingual-companion', 
    icon: Languages,
    description: 'Culturally sensitive health guidance in multiple languages.',
    color: "bg-orange-100 dark:bg-orange-900"
  },
  { 
    title: 'Conversational Coach', 
    href: '/health-coach', 
    icon: BotMessageSquare,
    description: 'Personalized habit-building conversations.',
    color: "bg-cyan-100 dark:bg-cyan-900"
  },
  { 
    title: 'Cognitive Tracker', 
    href: '/cognitive-tracker', 
    icon: Brain,
    description: 'Daily prompts to assess cognitive functions.',
    color: "bg-lime-100 dark:bg-lime-900"
  },
  { 
    title: 'Journal Synthesizer', 
    href: '/journal-synthesizer', 
    icon: FileText,
    description: 'Convert journal entries into medical summaries.',
    color: "bg-fuchsia-100 dark:bg-fuchsia-900"
  },
  { 
    title: 'Mental Health Check-In', 
    href: '/mental-health-checkin', 
    icon: UserCheck,
    description: 'Emotionally intelligent mental health support.',
    color: "bg-rose-100 dark:bg-rose-900"
  },
  { 
    title: 'Question Formulator', 
    href: '/question-formulator', 
    icon: HelpCircle, // Can be same as literacy coach, or find another
    description: 'Formulate questions for your doctor visits.',
    color: "bg-violet-100 dark:bg-violet-900"
  },
  { 
    title: 'Emergency Info', 
    href: '/emergency-info', 
    icon: ShieldAlert,
    description: 'Create a downloadable emergency information sheet.',
    color: "bg-amber-100 dark:bg-amber-900"
  },
];

export const secondaryNavItems: NavItem[] = [
  { title: 'Settings', href: '/settings', icon: Settings },
  // { title: 'Theme', href: '/theme-editor', icon: Palette } // Example for a theme editor page
];
