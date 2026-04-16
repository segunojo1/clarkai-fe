"use client";

import React, { useState, useEffect } from "react";
import MobileView from "./mobile-view";

const MOBILE_BREAKPOINT = 768;

export default function MobileWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // Check screen size only once on mount
    const initialIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
    setIsMobile(initialIsMobile);
    // Don't listen to resize events - keep the initial state
  }, []);

  // Show nothing while hydrating to avoid hydration mismatch
  if (isMobile === undefined) {
    return null;
  }

  if (isMobile) {
    return <MobileView />;
  }
  return <>{children}</>;
}
