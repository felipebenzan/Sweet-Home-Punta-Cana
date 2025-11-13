
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import GuestServicesCarousel from '@/components/guest-services-carousel';

export default function BeachAccessPage() {
  return (
    <div className="bg-white text-shpc-ink">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center text-center text-white bg-black">
        <Image
          src="https://picsum.photos/seed/beach1/1800/1200"
          alt="Expansive view of Bávaro Beach with turquoise waters"
          fill
          priority
          className="object-cover opacity-50"
          data-ai-hint="bavaro beach turquoise"
        />
        <div className="relative z-10 p-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-playfair font-bold">
            Your Private Key to Paradise
          </h1>
          <p className="mt-6 text-base md:text-lg font-light max-w-3xl mx-auto">
            As our guest, you’ll enjoy exclusive access to the award-winning Bávaro Beach—home to turquoise waters, soft white sand, and world-class seaside living.
          </p>
        </div>
      </section>

      {/* Main Content - Editorial Style */}
      <div className="max-w-4xl mx-auto px-6 py-24 space-y-24">

        {/* Editorial Text Block 1 */}
        <section className="text-center max-w-3xl mx-auto">
            <p className="text-lg md:text-xl leading-relaxed text-neutral-700">
                When staying at Sweet Home Punta Cana, we provide you with a personalized Visitor Pass. This pass gives you privileged access to our residential complex and direct entry to Bávaro Beach—one of the Dominican Republic’s most celebrated shorelines.
            </p>
        </section>

        {/* Image Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md">
                <Image 
                    src="https://picsum.photos/seed/beach2/600/800"
                    alt="A secluded path leading to the beach with palm trees"
                    fill
                    className="object-cover"
                    data-ai-hint="beach path palms"
                />
            </div>
            <div className="space-y-8">
                 <div className="relative aspect-video rounded-2xl overflow-hidden shadow-md">
                    <Image 
                        src="https://picsum.photos/seed/beach3/800/450"
                        alt="Close-up of gentle waves washing over white sand"
                        fill
                        className="object-cover"
                        data-ai-hint="waves sand"
                    />
                </div>
                 <div className="relative aspect-video rounded-2xl overflow-hidden shadow-md">
                    <Image 
                        src="https://picsum.photos/seed/beach4/800/450"
                        alt="Sunbeds under a palm leaf umbrella on the beach"
                        fill
                        className="object-cover"
                        data-ai-hint="sunbeds beach"
                    />
                </div>
            </div>
        </section>

        {/* Editorial Text Block 2 */}
        <section className="text-left max-w-3xl mx-auto relative">
             <div className="absolute top-0 -left-20 w-px h-full bg-neutral-200 hidden md:block"></div>
             <p className="text-lg md:text-xl leading-relaxed text-neutral-700">
                Step onto the same golden sands enjoyed by world-class resorts like Lopesan—but without the hefty bill. To the left, discover Bibijagua Shopping Plaza for colorful souvenirs, and the iconic Jellyfish Restaurant, renowned for its beachfront dining. Here, luxury and local charm blend seamlessly.
            </p>
        </section>

      </div>

      <GuestServicesCarousel />

    </div>
  );
}
