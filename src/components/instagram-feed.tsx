
'use client';

import Script from 'next/script';

export default function InstagramFeed() {

  return (
    <section id="ig-feed" className="py-16 lg:py-24 bg-shpc-sand">
        <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div className='mb-6 md:mb-0'>
                <h2 className="text-center md:text-left text-4xl md:text-5xl font-playfair font-bold text-shpc-ink">
                    From Our World to Yours
                </h2>
                <p className="mt-2 text-center md:text-left text-lg text-neutral-600">
                    Glance inside paradise, one post at a time.
                </p>
                </div>
                <a href="https://www.instagram.com/sweethome_puntacana/" target="_blank" rel="noopener" className="inline-flex items-center justify-center gap-2 bg-shpc-yellow px-4 py-2 rounded-full font-semibold text-shpc-ink hover:bg-shpc-yellow/90 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                    <span>Follow Us</span>
                </a>
            </div>
            <Script src="https://cdn.lightwidget.com/widgets/lightwidget.js" />
            <iframe 
                src="https://cdn.lightwidget.com/widgets/4cc6c525af2050b89e02cdbda01cec55.html" 
                scrolling="no" 
                allowtransparency="true"
                className="lightwidget-widget" 
                style={{ width:'100%', border:0, overflow:'hidden' }}>
            </iframe>
        </div>
    </section>
  );
}
