
'use client';

import { cn } from '@/lib/utils';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

// Create a context to hold the header's visibility state
const HeaderStateContext = createContext(false);

// Create a custom hook to easily access the context value
export function useHeaderState() {
  return useContext(HeaderStateContext);
}

export default function HeaderManager({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  const [hidden, setHidden] = useState(false);
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
        lastYRef.current = window.scrollY;
    }
  }, []);

  useEffect(() => {
    const measure = () => {
      if (!headerRef.current) return;
      const h = Math.round(headerRef.current.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--header-height', `${h}px`);
    };

    if (isMounted) {
      measure();
      window.addEventListener('resize', measure, { passive: true });
      window.addEventListener('load', measure);
      return () => {
        window.removeEventListener('resize', measure);
        window.removeEventListener('load', measure);
      };
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastYRef.current;
        if (Math.abs(delta) >= 6) {
          if (delta > 0 && y > 24) {
            if (!hidden) setHidden(true);
          } else {
            if (hidden) setHidden(false);
          }
          lastYRef.current = y;
        }
        tickingRef.current = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMounted, hidden]);
  
  const [header, ...pageContent] = React.Children.toArray(children);

  return (
    // Provide the hidden state to all children through the context
    <HeaderStateContext.Provider value={hidden}>
      <div
        id="mainHeader"
        ref={headerRef}
        className={cn(
          'fixed top-0 left-0 right-0 z-[1000] bg-white transition-transform duration-500 ease-in-out will-change-transform',
          hidden ? 'header-hidden' : 'header-visible',
          !hidden && lastYRef.current > 2 && 'shadow-soft'
        )}
        data-header-hidden={hidden}
        style={{
          pointerEvents: "auto",
        }}
      >
        {header}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {pageContent}
    </HeaderStateContext.Provider>
  );
}

    