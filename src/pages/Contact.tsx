import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { contactInfo } from '@/data/rooms';
import { Mail, Phone, MessageCircle, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20">
        <section className="py-12 bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <span className="text-gold uppercase tracking-[0.2em] text-sm font-medium">Get in Touch</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mt-2">Contact Us</h1>
            <p className="text-muted-foreground mt-4 max-w-2xl">
              Have questions about your booking or our services? We're here to help you 24/7.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-7 w-7 text-gold" />
                  </div>
                  <h3 className="font-semibold mb-2">Email Us</h3>
                  <a 
                    href={`mailto:${contactInfo.email}`}
                    className="text-muted-foreground hover:text-gold transition-colors text-sm break-all"
                  >
                    {contactInfo.email}
                  </a>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-7 w-7 text-gold" />
                  </div>
                  <h3 className="font-semibold mb-2">Call Us</h3>
                  <a 
                    href={`tel:${contactInfo.phone}`}
                    className="text-muted-foreground hover:text-gold transition-colors text-sm"
                  >
                    {contactInfo.phone}
                  </a>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-7 w-7 text-green-500" />
                  </div>
                  <h3 className="font-semibold mb-2">WhatsApp</h3>
                  <a 
                    href={`https://wa.me/${contactInfo.whatsapp.replace(/\+/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-green-500 transition-colors text-sm"
                  >
                    {contactInfo.whatsapp}
                  </a>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-7 w-7 text-gold" />
                  </div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p className="text-muted-foreground text-sm">
                    Nigeria
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="max-w-2xl mx-auto mt-16 text-center">
              <h2 className="text-2xl font-serif font-bold mb-4">Payment Inquiries</h2>
              <p className="text-muted-foreground mb-6">
                For payment confirmations and booking-related inquiries, please contact us via WhatsApp with your booking reference number. We typically respond within 30 minutes during business hours.
              </p>
              <a
                href={`https://wa.me/${contactInfo.whatsapp.replace(/\+/g, '')}?text=${encodeURIComponent('Hello! I have a question about my booking.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
