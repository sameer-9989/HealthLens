
"use client";

import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
// Search import removed
// Input import is kept as it's a general UI component, though not used in this specific simplified header anymore
import { Input } from '../ui/input'; 
import { usePathname } from 'next/navigation';
import { mainNavItems } from '@/config/nav';

export function AppHeader() {
  const pathname = usePathname();
  const currentPage = mainNavItems.find(item => item.href === pathname) || { title: "Dashboard" };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1">
        <h1 className="text-lg font-semibold">{currentPage.title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {/* Search bar div removed */}
        {/* Notification Bell and Profile Icon have been removed here */}
      </div>
    </header>
  );
}
