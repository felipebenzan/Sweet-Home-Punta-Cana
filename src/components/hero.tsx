
'use client'

import Image from 'next/image';

export default function Hero({ children }: { children?: React.ReactNode }) {
  return (
    <section className="relative h-[72vh] md:h-[84vh] w-full flex flex-col justify-center text-white text-center bg-black">
      <Image
        src="https://iampuntacana.com/wp-content/uploads/2025/09/Generated-Image-September-01-2025-4_38PM.jpeg"
        alt="Friends enjoying a beachside cabana in Punta Cana"
        fill
        className="object-cover opacity-50"
        priority
        data-ai-hint="beach friends"
      />
      <div className="relative z-10 p-6 flex-grow flex flex-col justify-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight uppercase">
          HOLIDAYS PRESALE
        </h1>
        <p className="mt-4 text-5xl md:text-7xl font-bold text-shpc-yellow">
          UP TO 55% OFF
        </p>
        <p className="mt-6 text-base md:text-lg">
          + 1,000 USD RESORT CREDIT + AIRPORT TRANSFER + KIDS STAY FREE
        </p>
      </div>
       {children && <div className="relative z-20 w-full px-6 pb-10">{children}</div>}
    </section>
  );
}
