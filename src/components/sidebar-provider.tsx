'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider as BaseSidebarProvider } from '@/components/ui/sidebar';

type SidebarContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ 
  children,
  initialOpen 
}: { 
  children: React.ReactNode;
  initialOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(initialOpen ?? true);
  const pathname = usePathname();

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname]);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      <BaseSidebarProvider defaultOpen={isOpen}>
        {children}
      </BaseSidebarProvider>
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
