import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchPublicAnnouncements } from '@/lib/backend-api';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<any | null>(null);
  const location = useLocation();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/rooms', label: 'Rooms' },
    { href: '/booking-status', label: 'Check Booking' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    fetchPublicAnnouncements().then(list => {
      const stored = JSON.parse(localStorage.getItem("public_announcements_dismissed") || "[]");
      const next = (list || []).find((a: any) => !stored.includes(a.id));
      setAnnouncement(next || null);
    }).catch(() => undefined);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      {announcement && (
        <div className="w-full bg-amber-50 border-b border-amber-200 text-amber-900">
          <div className="container mx-auto px-4 flex items-center justify-between gap-4 py-2 text-xs md:text-sm">
            <div className="font-medium">{announcement.title}</div>
            <div className="hidden md:block">{announcement.message}</div>
            <button
              className="text-xs underline"
              onClick={() => {
                const stored = JSON.parse(localStorage.getItem("public_announcements_dismissed") || "[]");
                localStorage.setItem("public_announcements_dismissed", JSON.stringify([...stored, announcement.id]));
                setAnnouncement(null);
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl font-serif font-bold text-gold">
              Abobby Nwa Suite
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-gold ${
                  isActive(link.href) ? 'text-gold' : 'text-foreground/80'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block py-3 text-sm font-medium tracking-wide uppercase transition-colors hover:text-gold ${
                  isActive(link.href) ? 'text-gold' : 'text-foreground/80'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
