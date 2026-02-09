import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2, Heart } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitContactMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success('Thank you! Your message has been received. We\'ll be in touch soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit form. Please try again.');
      setIsSubmitting(false);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    await submitContactMutation.mutateAsync(formData);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="py-16 md:py-24 bg-card border-b border-border">
        <div className="container max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-foreground/70">
            Have questions about Seabrun Candy Hunter's legacy? Want to share memories or contribute to the archive? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Contact Info */}
            <div className="md:col-span-1">
              <Card className="p-6 h-full">
                <h3 className="text-xl font-bold mb-6 text-foreground">Why Contact Us?</h3>
                <ul className="space-y-4 text-foreground/70">
                  <li className="flex gap-3">
                    <span className="text-accent">✓</span>
                    <span>Share memories or stories about Seabrun Candy Hunter</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent">✓</span>
                    <span>Ask questions about the legacy or documentation</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent">✓</span>
                    <span>Contribute archival materials or evidence</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent">✓</span>
                    <span>Inquire about media, interviews, or partnerships</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent">✓</span>
                    <span>Report corrections or additional information</span>
                  </li>
                </ul>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                      Your Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-foreground mb-2">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="What is this about?"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Share your message, memories, or questions here..."
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full min-h-[200px]"
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2 fill-current" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-xs text-foreground/60 text-center mt-6">
                  We respect your privacy. Your information will only be used to respond to your inquiry.
                </p>
              </Card>
            </div>
          </div>

          {/* Production Services Section */}
          <Card className="p-8 bg-card border border-border mb-8">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Production Services & Custom Packages</h3>
            <p className="text-foreground/70 mb-6">
              For inquiries about production services, custom documentary packages, media licensing, or other professional services, please contact:
            </p>
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
              <h4 className="text-xl font-bold text-foreground mb-2">Canryn Production Inc.</h4>
              <p className="text-foreground/70 mb-4">
                Specializing in legacy preservation, documentary production, and archival media services.
              </p>
              <p className="text-foreground font-semibold">Contact for Pricing & Availability</p>
            </div>
          </Card>

          {/* Additional Info */}
          <Card className="p-8 bg-accent/10 border-accent/20">
            <h3 className="text-2xl font-bold mb-4 text-foreground">What Happens Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl mb-3">📬</div>
                <h4 className="font-bold text-foreground mb-2">We Receive It</h4>
                <p className="text-foreground/70 text-sm">
                  Your message is securely received and logged in our system.
                </p>
              </div>
              <div>
                <div className="text-3xl mb-3">👀</div>
                <h4 className="font-bold text-foreground mb-2">We Review It</h4>
                <p className="text-foreground/70 text-sm">
                  Our team reviews your message and determines the best response.
                </p>
              </div>
              <div>
                <div className="text-3xl mb-3">💌</div>
                <h4 className="font-bold text-foreground mb-2">We Respond</h4>
                <p className="text-foreground/70 text-sm">
                  We'll get back to you via email within 5-7 business days.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
