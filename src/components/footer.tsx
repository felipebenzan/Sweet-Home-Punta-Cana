
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
    { href: 'https://www.instagram.com/sweethome_puntacana/', icon: '/instagram.jpeg', label: 'Instagram' },
    { href: 'https://www.youtube.com/@IAMPUNTACANA', icon: '/youtube-logo-youtube-icon-transparent-free-png.png', label: 'YouTube' },
  ];

  return (
    <footer className="bg-background border-t border-shpc-edge">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="block">
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/Sweet%20Home%20Punta%20Cana%20logo.png?alt=media&token=2daf1c25-1bb0-4f7e-9fd2-598f30501843"
                alt="Sweet Home Punta Cana Logo"
                width={1080}
                height={288}
                className="object-contain h-12 w-auto"
                priority
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
              <li>
                <Link href="/admin/login" className="text-neutral-600 hover:text-shpc-ink text-sm">
                  Admin
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-shpc-ink">Follow Us</h4>
            <div className="mt-4 flex justify-center items-center gap-[20px]">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-shpc-ink relative w-[40px] h-[40px]" aria-label={social.label}>
                  <Image
                    src={social.icon}
                    alt={social.label}
                    fill
                    className="object-contain"
                    sizes="40px"
                  />
                </a>
              ))}
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
