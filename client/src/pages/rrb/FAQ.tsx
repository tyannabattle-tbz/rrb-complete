import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'wouter';
import { HelpCircle, Music, Users, Tv, Bot, Handshake, Headphones, ShieldCheck, Mail } from 'lucide-react';

const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        className="flex justify-between items-center w-full py-4 px-6 text-left text-lg font-semibold text-foreground hover:bg-card transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? '-rotate-180' : ''}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-foreground/80">
          {children}
        </div>
      )}
    </div>
  );
};

export default function FAQ() {
  const faqs = [
    {
      question: "What is RockinRockinBoogie.com?",
      answer: "RockinRockinBoogie.com is a digital platform dedicated to preserving and promoting the legacy of Seabrun Candy Hunter, a pioneering songwriter whose significant contributions to the music industry have been systematically overlooked. The site serves as a central hub for his music, story, and the ongoing efforts to restore his rightful place in history.",
    },
    {
      question: "Who was Seabrun Candy Hunter?",
      answer: "Seabrun Candy Hunter was a prolific and influential songwriter active during the mid-20th century. Despite his immense talent and the success of the songs he penned, his name was often omitted from the credits, denying him the recognition and royalties he deserved. This platform aims to rectify that injustice.",
    },
    {
      question: "What is Canryn Production Inc.?",
      answer: "Canryn Production Inc. is the organization behind RockinRockinBoogie.com. It was established by the family and estate of Seabrun Candy Hunter to manage his catalog, advocate for his legacy, and oversee related projects that honor his memory and contributions.",
    },
    {
      question: "What is Sweet Miracles?",
      answer: "Sweet Miracles is the community outreach arm of Canryn Production Inc. It focuses on supporting emerging artists from underrepresented backgrounds, providing mentorship, resources, and opportunities to help them navigate the music industry. Learn more at our <Link href=\"/rrb/sweet-miracles\" className=\"text-red-500 hover:underline\">Sweet Miracles page</Link>.",
    },
    {
      question: "What is QUMUS?",
      answer: "QUMUS (Quantum-based Autonomous Music Orchestration System) is an innovative technology developed by Canryn Production Inc. It uses autonomous systems to orchestrate and generate new musical arrangements based on Seabrun Candy Hunter's extensive catalog, bringing his work to a new generation. Discover more on the <Link href=\"/rrb/qumus\" className=\"text-amber-500 hover:underline\">QUMUS project page</Link>.",
    },
    {
      question: "What is HybridCast?",
      answer: "HybridCast is a public safety initiative by Canryn Production Inc. It is an emergency broadcast system designed to disseminate critical information during crises, leveraging a resilient and decentralized network to ensure communication lines remain open. For more details, visit the <Link href=\"/rrb/hybridcast\" className=\"text-orange-500 hover:underline\">HybridCast page</Link>.",
    },
    {
      question: "How can I support the legacy?",
      answer: "You can support the legacy by sharing the music, educating others about Seabrun Candy Hunter's story, and contributing to the Sweet Miracles outreach program. Financial contributions help us continue our work in music preservation and artist support.",
    },
    {
      question: "How can I listen to the music?",
      answer: "The official and verified catalog of Seabrun Candy Hunter's music is available exclusively through this platform. Visit our <Link href=\"/rrb/music\" className=\"text-red-500 hover:underline\">Music page</Link> to stream and explore his extensive body of work.",
    },
    {
      question: "Are the claims of omitted credits verified?",
      answer: "Yes, our claims are supported by extensive research, including historical documents, eyewitness accounts, and legal affidavits. We are committed to transparency and have made a selection of our findings available on the <Link href=\"/rrb/verified-claims\" className=\"text-amber-500 hover:underline\">Verified Claims page</Link>.",
    },
    {
      question: "How do I contact the family or the production company?",
      answer: "For all inquiries, please use the contact form on our <Link href=\"/rrb/contact\" className=\"text-orange-500 hover:underline\">Contact page</Link>. We welcome messages from fans, researchers, and potential collaborators.",
    },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12 md:mb-16">
          <HelpCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto">Find answers to common questions about RockinRockinBoogie.com, Seabrun Candy Hunter, and our initiatives.</p>
        </div>

        <Card className="max-w-4xl mx-auto bg-card border-border shadow-lg">
          <div className="divide-y divide-border">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} title={faq.question}>
                <p dangerouslySetInnerHTML={{ __html: faq.answer }} />
              </AccordionItem>
            ))}
          </div>
        </Card>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold">Still have questions?</h2>
          <p className="mt-2 text-foreground/70">We're here to help. Reach out to us directly.</p>
          <Link href="/rrb/contact">
            <button className="mt-6 inline-flex items-center gap-2 bg-red-500 text-white font-semibold px-6 py-3 rounded-md hover:bg-red-600 transition-colors duration-200">
              <Mail className="h-5 w-5" />
              Contact Us
            </button>
          </Link>
        </div>
      </main>

      <footer className="bg-card border-t border-border mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-foreground/60">
          <p>&copy; {new Date().getFullYear()} Canryn Production Inc. All Rights Reserved.</p>
          <p className="mt-2">Dedicated to the enduring legacy of Seabrun Candy Hunter.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/rrb/privacy-policy" className="hover:text-red-500">Privacy Policy</Link>
            <Link href="/rrb/terms-of-service" className="hover:text-red-500">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
