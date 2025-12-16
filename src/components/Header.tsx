import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/rooms', label: 'Rooms' },
    { href: '/booking-status', label: 'Check Booking' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl font-serif font-bold text-gold">
              Luxe Haven
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
            <Link to="/admin">
              <Button variant="outline" size="sm" className="border-gold text-gold hover:bg-gold hover:text-primary-foreground">
                Admin
              </Button>
            </Link>
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
            <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
              <Button variant="outline" size="sm" className="mt-4 border-gold text-gold hover:bg-gold hover:text-primary-foreground">
                Admin
              </Button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
