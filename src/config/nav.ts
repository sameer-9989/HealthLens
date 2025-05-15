
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Stethoscope, MessageCircleHeart, BookHeart, Settings,
  Activity, UserCheck, BotMessageSquare, HelpCircle, ShieldAlert, Brain, Palette,
  PowerOff, YoutubeIcon, Zap as StressIcon,
  Lightbulb, GitCompareArrows, Wind, Users, Info, FileText, // Added FileText
  ListChecks // Added ListChecks
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
    title: 'Self-Care Plans',
    href: '/self-care-plans',
    icon: BookHeart,
    description: 'AI-generated personalized plans for various conditions & goals.',
    color: "bg-green-100 dark:bg-green-900"
  },
  {
    title: 'Stress Relief Yoga',
    href: '/stress-relief-yoga',
    icon: StressIcon, // Using Zap as StressIcon
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
    icon: Wind,
    description: 'Access guided breathing, nature sounds, and meditations.',
    color: "bg-cyan-100 dark:bg-cyan-900"
  },
  {
    title: 'Body Scan Visualizer',
    href: '/body-scan-visualizer',
    icon: Users, // Consider AnatomicalHeart if more specific
    description: 'Learn about body parts, common issues, and care.',
    color: "bg-pink-100 dark:bg-pink-900"
  },
  // Standalone Mental Health Check-in removed, functionality merged to Virtual Assistant
  // {
  //   title: 'Mental Health Check-In',
  //   href: '/mental-health-checkin',
  //   icon: UserCheck,
  //   description: 'Emotionally intelligent mental health support.',
  //   color: "bg-rose-100 dark:bg-rose-900"
  // },
];

// Features that were removed or merged, showing their original icons for reference if needed
const removedFeaturePlaceholders: NavItem[] = [
    { title: 'Health Literacy Coach', href: '/health-literacy-coach', icon: HelpCircle, description: "Merged into Virtual Assistant." },
    { title: 'Therapeutics Library', href: '/therapeutics-library', icon: Palette, description: "Merged into Virtual Assistant." }, // Palette was an example
    { title: 'Care Coordination', href: '/care-coordination', icon: Users /* or another icon like FileText */, description: "Removed." },
    { title: 'Routine Builder', href: '/routine-builder', icon: ListChecks, description: "Streamlined into Self-Care Plans." },
    { title: 'Multilingual Companion', href: '/multilingual-companion', icon: BotMessageSquare, description: "Merged into Symptom Checker." },
    { title: 'Symptom Timeline', href: '/symptom-timeline', icon: Activity, description: "Removed."},
    { title: 'Journal Synthesizer', href: '/journal-synthesizer', icon: FileText, description: "Removed."},
    { title: 'Question Formulator', href: '/question-formulator', icon: HelpCircle, description: "Removed."},
    { title: 'Emergency Info', href: '/emergency-info', icon: ShieldAlert, description: "Removed."}
];


export const secondaryNavItems: NavItem[] = [
  { title: 'Settings', href: '/settings', icon: Settings },
  // { title: 'Help & FAQ', href: '/help', icon: HelpCircle }, // Example, if added
];
