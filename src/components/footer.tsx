
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
    { href: 'https://www.facebook.com/sweethomepc/', icon: <Image src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/facebook%20sweet%20home%20punta%20cana%20guest%20house.png?alt=media&token=9576b0e2-0d2d-4c8f-89a5-d97e0bbd56a7" alt="Facebook" width={20} height={20} className="h-5 w-5 object-contain" />, label: 'Facebook' },
    { href: 'https://www.instagram.com/sweethome_puntacana/', icon: <Image src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/instagram%20sweet%20home%20punta%20cana.png?alt=media&token=27380234-317d-49d1-ac8b-527d171308d1" alt="Instagram" width={20} height={20} className="h-5 w-5 object-contain" />, label: 'Instagram' },
    { href: 'https://www.youtube.com/@IAMPUNTACANA', icon: <Image src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/youtube%20sweet%20home%20punta%20cana%20i%20am%20punta%20cana%20scooters%20punta%20cana.jpg?alt=media&token=f1eb40ef-feda-4780-b892-2e554237ae98" alt="YouTube" width={20} height={20} className="h-5 w-5 object-contain" />, label: 'YouTube' },
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
            <div className="mt-4 flex space-x-4">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-shpc-ink" aria-label={social.label}>
                  {social.icon}
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
