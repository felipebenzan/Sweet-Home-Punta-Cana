
import Link from 'next/link';
import { Youtube, Instagram, Facebook } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  const quickLinks = [
    { href: '/rooms', label: 'Rooms' },
    { href: '/excursions', label: 'Excursions' },
    { href: '/guest-services', label: 'Guest Services' },
    { href: '/location', label: 'Find Us' },
    { href: '/faqs', label: 'FAQs' },
  ];

  const legalLinks = [
    { href: '/terms', label: 'Terms of Service' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/rules', label: 'Rules' },
  ];

  const socialLinks = [
    { href: 'https://www.facebook.com/sweethomepc/', icon: '/facebook-logo-facebook-icon-transparent-free-png.png', label: 'Facebook' },
    { href: 'https://www.instagram.com/sweethome_puntacana/', icon: '/instagram.jpeg', label: 'Instagram', className: 'p-1' },
    { href: 'https://www.youtube.com/@IAMPUNTACANA', icon: '/youtube-logo-youtube-icon-transparent-free-png.png', label: 'YouTube' },
  ];

  return (
    <footer className="bg-background border-t border-shpc-edge">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Sweet Home Punta Cana</span>
              <Image
                className="h-14 w-auto"
                src="/sweet-home-logo-2.png"
                alt="Sweet Home Punta Cana"
                width={280}
                height={84}
              />
            </Link>

            <address className="mt-4 not-italic text-neutral-600 space-y-2 text-sm">
              <p>Punta Cana, Dominican Republic</p>


            </address>
          </div>
          <div>
            <h4 className="font-semibold text-shpc-ink">Quick Links</h4>
            <ul className="mt-4 space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-neutral-600 hover:text-shpc-ink text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-shpc-ink">Legal</h4>
            <ul className="mt-4 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-neutral-600 hover:text-shpc-ink text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}

            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-shpc-ink">Follow Us</h4>
            <div className="mt-4 flex justify-start items-center gap-[20px]">
              {socialLinks.map((social) => {
                let sizeClass = 'w-[40px] h-[40px]';
                let sizeNum = 40;

                if (social.label === 'YouTube') {
                  sizeClass = 'w-[58px] h-[58px]';
                  sizeNum = 58;
                } else if (social.label === 'Facebook') {
                  sizeClass = 'w-[48px] h-[48px]';
                  sizeNum = 48;
                }

                return (
                  <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className={`text-neutral-500 hover:text-shpc-ink relative ${sizeClass}`} aria-label={social.label}>
                    <Image
                      src={social.icon}
                      alt={social.label}
                      fill
                      className={`object-contain ${social.className || ''}`}
                      sizes={`${sizeNum}px`}
                    />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-shpc-edge text-center text-sm text-neutral-500">
          <p>&copy; {new Date().getFullYear()} Sweet Home Punta Cana. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
