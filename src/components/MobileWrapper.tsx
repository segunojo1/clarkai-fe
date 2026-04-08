import { useIsMobile } from '@/hooks/use-mobile';
import React from 'react'
import MobileView from './mobile-view';

export default function MobileWrapper({ children}: {children: React.ReactNode}) {
    const isMobile = useIsMobile();

    console.log(isMobile);
    

    if (isMobile) {
        return <MobileView />
    }
  return <>{children}</>
}
