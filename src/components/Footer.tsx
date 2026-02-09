import { contactInfo } from '@/lib/api';
import { Mail, Phone, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-serif font-bold text-gold mb-4">Abobby Nwa Suite</h3>
            <p className="text-muted-foreground leading-relaxed">
              Experience unparalleled luxury and comfort at our prestigious hotel. 
              Where elegance meets exceptional service.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 uppercase tracking-wide text-sm">Contact Us</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  {contactInfo.email}
                </a>
              </li>
              <li>
                <a 
                  href={`tel:${contactInfo.whatsapp}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  {contactInfo.whatsapp}
                </a>
              </li>
              <li>
                <a 
                  href={`https://wa.me/${contactInfo.whatsapp.replace(/\+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 uppercase tracking-wide text-sm">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/rooms" className="text-muted-foreground hover:text-gold transition-colors">Our Rooms</a></li>
              <li><a href="/booking-status" className="text-muted-foreground hover:text-gold transition-colors">Check Booking</a></li>
              <li><a href="/contact" className="text-muted-foreground hover:text-gold transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} Abobby Nwa Suite. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
