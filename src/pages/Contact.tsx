import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { contactInfo } from '@/lib/api';
import { submitContact } from '@/lib/backend-api';
import { Mail, Phone, MessageCircle, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitContact(formData);
      toast({
        title: 'Message Sent!',
        description: 'We will get back to you shortly.',
      });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to send message';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
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
                    href={`tel:${contactInfo.whatsapp}`}
                    className="text-muted-foreground hover:text-gold transition-colors text-sm"
                  >
                    {contactInfo.whatsapp}
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

            <div className="max-w-2xl mx-auto mt-16">
              <h2 className="text-2xl font-serif font-bold mb-8 text-center">Send us a Message</h2>
              <Card>
                <CardContent className="pt-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <textarea
                        id="message"
                        placeholder="Your message here..."
                        rows={5}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gold hover:bg-gold/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
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
