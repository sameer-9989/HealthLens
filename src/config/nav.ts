
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Stethoscope, MessageCircleHeart, BookHeart, Settings,
  FileText, Activity, UserCheck, BotMessageSquare, HelpCircle, ShieldAlert, Brain, Palette,
  PowerOff, Youtube as YoutubeIcon, Zap as StressIcon, Image as ImageIcon,
  Lightbulb, GitCompareArrows, Wind, AnatomicalHeart, Users // Added new icons
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
    description: 'Chat for med info, term explanations, mindfulness, & health guidance.',
    color: "bg-blue-100 dark:bg-blue-900"
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
    title: 'Digital Detox Tool',
    href: '/digital-detox',
    icon: PowerOff,
    description: 'Guidance and tools for managing screen time and digital wellness.',
    color: "bg-purple-100 dark:bg-purple-900"
  },
  { 
    title: 'Symptom Timeline', 
    href: '/symptom-timeline', 
    icon: Activity,
    description: 'Manually log and analyze your symptom progression over time.',
    color: "bg-red-100 dark:bg-red-900"
  },
  { 
    title: 'Cognitive Tracker', 
    href: '/cognitive-tracker', 
    icon: Brain,
    description: 'Daily prompts to assess cognitive functions and emotional wellness.',
    color: "bg-lime-100 dark:bg-lime-900"
  },
  {
    title: 'Health Myth Buster',
    href: '/health-myth-buster',
    icon: Lightbulb,
    description: 'AI-powered debunking of common health myths.',
    color: "bg-yellow-100 dark:bg-yellow-900"
  },
  {
    title: 'Habit Conflict Detector',
    href: '/habit-conflict-detector',
    icon: GitCompareArrows,
    description: 'Analyze potential conflicts in your health routines.',
    color: "bg-indigo-100 dark:bg-indigo-900"
  },
  {
    title: 'Focus & Mental Reset',
    href: '/focus-mental-reset',
    icon: Wind, // Using Wind as a general icon for reset/calm
    description: 'Access guided breathing, nature sounds, and meditations.',
    color: "bg-cyan-100 dark:bg-cyan-900"
  },
  {
    title: 'Body Scan Visualizer',
    href: '/body-scan-visualizer',
    icon: Users, // Using Users as a general body icon
    description: 'Learn about body parts, common issues, and care.',
    color: "bg-pink-100 dark:bg-pink-900"
  },
  { 
    title: 'AI Image Gallery', 
    href: '/ai-image-gallery', 
    icon: ImageIcon,
    description: 'View and manage AI-generated images (Feature Removed).',
    color: "bg-gray-100 dark:bg-gray-700",
    disabled: true,
  },
  { 
    title: 'Journal Synthesizer', 
    href: '/journal-synthesizer', 
    icon: FileText,
    description: 'Convert journal entries into medical summaries (Placeholder).',
    color: "bg-fuchsia-100 dark:bg-fuchsia-900"
  },
  { 
    title: 'Mental Health Check-In', 
    href: '/mental-health-checkin', 
    icon: UserCheck,
    description: 'Emotionally intelligent mental health support (Placeholder).',
    color: "bg-rose-100 dark:bg-rose-900"
  },
  { 
    title: 'Question Formulator', 
    href: '/question-formulator', 
    icon: HelpCircle,
    description: 'Formulate questions for your doctor visits (Placeholder).',
    color: "bg-violet-100 dark:bg-violet-900"
  },
  { 
    title: 'Emergency Info', 
    href: '/emergency-info', 
    icon: ShieldAlert,
    description: 'Create a downloadable emergency information sheet (Placeholder).',
    color: "bg-amber-100 dark:bg-amber-900"
  },
];

export const secondaryNavItems: NavItem[] = [
  { title: 'Settings', href: '/settings', icon: Settings },
];
