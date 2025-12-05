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

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        header.classList.add('nav-hidden');
        document.documentElement.style.setProperty('--header-offset', '0px');
      } else {
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
