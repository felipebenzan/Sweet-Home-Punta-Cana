'use client';

import React, { useEffect } from 'react';

export default function HeaderManager({
  children,
}: {
  children: React.ReactNode;
}) {
  const lastScrollY = React.useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const header = document.getElementById('main-header');

      if (!header) return;

      // Always show at the very top to avoid getting stuck
      if (currentScrollY < 50) {
        header.classList.remove('nav-hidden');
        document.documentElement.style.setProperty('--header-offset', 'var(--header-height)');
        lastScrollY.current = currentScrollY;
        return;
      }

      // Scrolling Down -> Hide
      if (currentScrollY > lastScrollY.current) {
        header.classList.add('nav-hidden');
        document.documentElement.style.setProperty('--header-offset', '0px');
      }
      // Scrolling Up -> Show
      else if (currentScrollY < lastScrollY.current) {
        header.classList.remove('nav-hidden');
        document.documentElement.style.setProperty('--header-offset', 'var(--header-height)');
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return <>{children}</>;
}
