import { Card } from '@/components/ui/card';

export function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        
        <Card className="bg-slate-800 border-slate-700 p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Subscription & Usage Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              By accessing Rockin' Rockin' Boogie, you agree to these terms and conditions. 
              Our service is provided "as is" for entertainment, educational, and archival purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. User Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree not to use the service for illegal or harmful purposes</li>
              <li>You agree to respect all intellectual property rights</li>
              <li>You agree not to distribute or reproduce content without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Content License</h2>
            <p className="text-slate-300 leading-relaxed">
              All content on this platform is licensed for personal, non-commercial use only. 
              Commercial use, redistribution, or modification requires explicit permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Limitation of Liability</h2>
            <p className="text-slate-300 leading-relaxed">
              We are not liable for any indirect, incidental, special, or consequential damages 
              arising from your use of our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Changes to Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of the service 
              constitutes acceptance of updated terms.
            </p>
          </section>

          <p className="text-slate-400 text-sm pt-6 border-t border-slate-700">
            Last updated: January 25, 2026
          </p>
        </Card>
      </div>
    </div>
  );
}

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        
        <Card className="bg-slate-800 border-slate-700 p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Protection & Your Rights</h2>
            <p className="text-slate-300 leading-relaxed">
              We are committed to protecting your personal data and respecting your privacy rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>Account information (name, email, username)</li>
              <li>Usage data (listening history, preferences)</li>
              <li>Technical data (IP address, browser type, device information)</li>
              <li>Payment information (processed securely through Stripe)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Data</h2>
            <p className="text-slate-300 leading-relaxed">
              We use your data to provide and improve our service, personalize your experience, 
              process payments, and communicate with you about updates and offers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>Right to access your personal data</li>
              <li>Right to correct inaccurate data</li>
              <li>Right to request deletion of your data</li>
              <li>Right to opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
            <p className="text-slate-300 leading-relaxed">
              We implement industry-standard security measures to protect your data from unauthorized access, 
              alteration, or disclosure.
            </p>
          </section>

          <p className="text-slate-400 text-sm pt-6 border-t border-slate-700">
            Last updated: January 25, 2026
          </p>
        </Card>
      </div>
    </div>
  );
}

export function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Disclaimer</h1>
        
        <Card className="bg-slate-800 border-slate-700 p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Content & Liability</h2>
            <p className="text-slate-300 leading-relaxed">
              This website is an archival and educational resource. All content is provided for 
              historical preservation and informational purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Accuracy of Information</h2>
            <p className="text-slate-300 leading-relaxed">
              While we strive for accuracy, we make no warranties about the completeness, reliability, 
              or accuracy of any content. All claims are supported by documentation and evidence.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Content</h2>
            <p className="text-slate-300 leading-relaxed">
              This site may contain links to third-party websites. We are not responsible for the content, 
              accuracy, or practices of external sites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Medical & Legal Disclaimers</h2>
            <p className="text-slate-300 leading-relaxed">
              This content is not medical, legal, or financial advice. Please consult appropriate professionals 
              before making decisions based on information from this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
            <p className="text-slate-300 leading-relaxed">
              In no event shall Rockin' Rockin' Boogie or its operators be liable for any damages 
              arising from your use of this site.
            </p>
          </section>

          <p className="text-slate-400 text-sm pt-6 border-t border-slate-700">
            Last updated: January 25, 2026
          </p>
        </Card>
      </div>
    </div>
  );
}

export function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Refund Policy</h1>
        
        <Card className="bg-slate-800 border-slate-700 p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Cancellation & Refunds</h2>
            <p className="text-slate-300 leading-relaxed">
              We want you to be satisfied with your subscription. If you're not happy, 
              we offer a straightforward refund process.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Refund Eligibility</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>Refunds are available within 30 days of purchase</li>
              <li>Subscription cancellations take effect at the end of the current billing period</li>
              <li>Refunds are issued to the original payment method</li>
              <li>Processing time: 5-10 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How to Request a Refund</h2>
            <ol className="list-decimal list-inside space-y-2 text-slate-300">
              <li>Log into your account</li>
              <li>Navigate to Billing & Subscriptions</li>
              <li>Click "Request Refund"</li>
              <li>Provide a reason (optional)</li>
              <li>Confirm your request</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Non-Refundable Items</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>Donations to Sweet Miracles projects</li>
              <li>Purchases made more than 30 days ago</li>
              <li>Digital content already downloaded or accessed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Questions?</h2>
            <p className="text-slate-300 leading-relaxed">
              Contact our support team at support@rockinrockinboogie.com for assistance with refunds or cancellations.
            </p>
          </section>

          <p className="text-slate-400 text-sm pt-6 border-t border-slate-700">
            Last updated: January 25, 2026
          </p>
        </Card>
      </div>
    </div>
  );
}

export function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Contact Support</h1>
        
        <Card className="bg-slate-800 border-slate-700 p-8">
          <p className="text-slate-300 mb-6">
            Have questions or need assistance? We're here to help!
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Email</h3>
              <a href="mailto:support@rockinrockinboogie.com" className="text-amber-400 hover:text-amber-300">
                support@rockinrockinboogie.com
              </a>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Response Time</h3>
              <p className="text-slate-300">We typically respond within 24-48 hours</p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Common Issues</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-300">
                <li>Account access and password reset</li>
                <li>Subscription and billing questions</li>
                <li>Technical issues and playback problems</li>
                <li>Content requests and feedback</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
