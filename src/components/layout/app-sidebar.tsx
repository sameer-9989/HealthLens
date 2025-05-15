
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { mainNavItems, secondaryNavItems } from '@/config/nav';
import { HealthLensLogo } from '@/components/icons/health-lens-logo';
import { Moon, Sun } from 'lucide-react'; // LogOut icon removed
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar();
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <HealthLensLogo size={32} className="text-primary" />
          {sidebarState === 'expanded' && (
            <h1 className="text-xl font-semibold">HealthLens</h1>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {mainNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={sidebarState === 'collapsed' ? item.title : undefined}
                  aria-label={item.title}
                  className={cn(
                    "justify-start",
                    sidebarState === 'collapsed' && "justify-center"
                  )}
                >
                  <item.icon className="shrink-0" />
                  {sidebarState === 'expanded' && <span>{item.title}</span>}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
           {secondaryNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={sidebarState === 'collapsed' ? item.title : undefined}
                  aria-label={item.title}
                   className={cn(
                    "justify-start",
                    sidebarState === 'collapsed' && "justify-center"
                  )}
                >
                  <item.icon className="shrink-0" />
                  {sidebarState === 'expanded' && <span>{item.title}</span>}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
             <SidebarMenuButton
              onClick={toggleTheme}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              tooltip={sidebarState === 'collapsed' ? (isDarkMode ? "Light mode" : "Dark mode") : undefined}
              className={cn(
                "justify-start",
                sidebarState === 'collapsed' && "justify-center"
              )}
            >
              {isDarkMode ? <Sun className="shrink-0" /> : <Moon className="shrink-0" />}
              {sidebarState === 'expanded' && <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* Logout option has been removed here */}
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
