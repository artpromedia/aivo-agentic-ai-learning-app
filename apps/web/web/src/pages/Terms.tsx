import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export function Terms() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-neutral-900 mb-6">Terms of Service</h1>
        <p className="text-sm text-neutral-600 mb-12">
          <strong>Effective Date:</strong> October 27, 2025<br />
          <strong>Last Updated:</strong> October 27, 2025
        </p>

        <div className="prose prose-neutral max-w-none">
          {/* 1. Agreement to Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-neutral-700 mb-4">
              Welcome to AIVO Learning ("we," "our," or "us"). These Terms of Service ("Terms") govern your 
              access to and use of the AIVO Learning platform, including our website at{' '}
              <a href="https://aivolearning.com" className="text-primary-600 hover:underline">aivolearning.com</a>, 
              mobile applications, and the AIVO Pad hardware device (collectively, the "Service").
            </p>
            <p className="text-neutral-700 mb-4">
              By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these 
              Terms, do not use our Service.
            </p>
            <p className="text-neutral-700">
              <strong>Note:</strong> AIVO Learning was previously known as aivoai.com. These Terms apply to the 
              rebranded service under the aivolearning.com domain.
            </p>
          </section>

          {/* 2. Accounts and Registration */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">2. Accounts and Registration</h2>
            
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">2.1 Eligibility</h3>
            <p className="text-neutral-700 mb-4">
              The AIVO Learning platform is designed for K-12 educational use. Account types include:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li><strong>Student Accounts:</strong> Must be created by parents/guardians or school administrators. Students under 13 require parental consent (COPPA compliance).</li>
              <li><strong>Educator Accounts:</strong> Must be 18+ years old and affiliated with an educational institution.</li>
              <li><strong>Parent/Guardian Accounts:</strong> Must be 18+ years old and provide valid contact information.</li>
              <li><strong>School/District Accounts:</strong> Must be created by authorized administrators with proper institutional credentials.</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">2.2 Account Security</h3>
            <p className="text-neutral-700 mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Ensuring accuracy of account information</li>
            </ul>
          </section>

          {/* 3. Subscriptions and Payment */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">3. Subscriptions and Payment</h2>
            
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">3.1 Subscription Plans</h3>
            <p className="text-neutral-700 mb-4">
              We offer the following subscription types:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li><strong>Individual Educator:</strong> Starting at $9/user/month</li>
              <li><strong>School License:</strong> Custom pricing for 50-500 students</li>
              <li><strong>District License:</strong> Custom pricing for 500+ students</li>
              <li><strong>Parent/Family Plans:</strong> Starting at $29/month for up to 2 children</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">3.2 Billing</h3>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>Subscriptions are billed monthly or annually, depending on your selected plan</li>
              <li>Payment is due at the beginning of each billing cycle</li>
              <li>We accept major credit cards, ACH transfers, and purchase orders (schools/districts only)</li>
              <li>All fees are non-refundable unless otherwise stated</li>
              <li>Prices are subject to change with 30 days notice</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">3.3 Free Trials</h3>
            <p className="text-neutral-700 mb-4">
              We offer a 14-day free trial for new accounts. No credit card required. Your subscription will not 
              auto-renew unless you provide payment information and confirm enrollment.
            </p>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">3.4 Refund Policy</h3>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Monthly subscriptions: Refunds available within 7 days of initial purchase</li>
              <li>Annual subscriptions: Pro-rated refunds available within 30 days</li>
              <li>School/District licenses: Custom refund terms negotiated in contract</li>
              <li>No refunds for partial months or unused portions of subscriptions</li>
            </ul>
          </section>

          {/* 4. User Responsibilities */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">4. User Responsibilities</h2>
            
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">4.1 Acceptable Use</h3>
            <p className="text-neutral-700 mb-4">You agree to use the Service only for lawful educational purposes. You will NOT:</p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>Share account credentials with others</li>
              <li>Use the Service to cheat or violate academic integrity policies</li>
              <li>Attempt to reverse engineer, hack, or compromise the platform</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Harass, bully, or harm other users</li>
              <li>Share personally identifiable information (PII) of students without consent</li>
              <li>Use the Service for commercial purposes without authorization</li>
              <li>Scrape, copy, or redistribute platform content</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">4.2 Educator Responsibilities</h3>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>Ensure compliance with FERPA when handling student data</li>
              <li>Obtain necessary parental consents for student accounts</li>
              <li>Monitor student use in accordance with school policies</li>
              <li>Provide appropriate supervision for AI-generated content</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">4.3 Student Responsibilities</h3>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Use the Service under parental or educator supervision</li>
              <li>Follow school academic integrity policies</li>
              <li>Respect other users and maintain appropriate conduct</li>
              <li>Protect AIVO Pad hardware from damage or loss</li>
            </ul>
          </section>

          {/* 5. Intellectual Property */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">5. Intellectual Property</h2>
            
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">5.1 AIVO Learning Ownership</h3>
            <p className="text-neutral-700 mb-4">
              AIVO Learning owns all rights, title, and interest in:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>The AIVO platform software, algorithms, and AI models</li>
              <li>Platform interface, design, and features</li>
              <li>AIVO branding, logos, and trademarks</li>
              <li>Educational content, templates, and media library</li>
              <li>AIVO Pad hardware design and firmware</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">5.2 User-Generated Content</h3>
            <p className="text-neutral-700 mb-4">
              You retain ownership of all content you create using the Service (student work, lesson plans, etc.). 
              By using the Service, you grant AIVO Learning a limited license to:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>Store and process your content to provide the Service</li>
              <li>Use de-identified, aggregated data to improve AI models</li>
              <li>Display your content to authorized users (educators, parents) as configured</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">5.3 AI-Generated Content</h3>
            <p className="text-neutral-700">
              Content generated by AIVO's AI (feedback, suggestions, generated lessons) is licensed to you for 
              educational use. You may not redistribute AI-generated content for commercial purposes without permission.
            </p>
          </section>

          {/* 6. AIVO Pad Hardware */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">6. AIVO Pad Hardware Terms</h2>
            
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">6.1 Hardware License</h3>
            <p className="text-neutral-700 mb-4">
              The AIVO Pad is provided as part of certain subscription plans or may be purchased separately. 
              Schools/districts may lease devices on a per-student basis.
            </p>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">6.2 Warranty</h3>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>1-year limited warranty covering manufacturing defects</li>
              <li>Accidental damage protection available for additional fee</li>
              <li>Warranty void if device is opened, modified, or used improperly</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">6.3 Return Policy</h3>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>30-day return window for individual purchases</li>
              <li>Device must be in original condition with all accessories</li>
              <li>Restocking fee may apply</li>
              <li>Schools/districts: Custom return terms in purchase agreement</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">6.4 Lost or Stolen Devices</h3>
            <p className="text-neutral-700">
              Report lost or stolen devices immediately. Replacement devices available for purchase. 
              Schools may establish their own device loss policies.
            </p>
          </section>

          {/* 7. Service Modifications */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">7. Service Modifications</h2>
            <p className="text-neutral-700 mb-4">
              We reserve the right to:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Modify, suspend, or discontinue features with reasonable notice</li>
              <li>Perform scheduled maintenance (communicated in advance)</li>
              <li>Update AI models and algorithms to improve performance</li>
              <li>Change pricing with 30 days notice for existing subscribers</li>
            </ul>
          </section>

          {/* 8. Termination */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">8. Account Termination</h2>
            
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">8.1 Termination by You</h3>
            <p className="text-neutral-700 mb-4">
              You may cancel your subscription at any time through your account settings. Cancellation takes 
              effect at the end of your current billing period.
            </p>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">8.2 Termination by Us</h3>
            <p className="text-neutral-700 mb-4">
              We may suspend or terminate your account if you:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>Violate these Terms</li>
              <li>Fail to pay subscription fees</li>
              <li>Engage in fraudulent or harmful activity</li>
              <li>Misuse the platform in ways that harm other users</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">8.3 Data Portability</h3>
            <p className="text-neutral-700">
              Upon termination, you may export your data for 90 days. After 90 days, data is permanently deleted 
              per our Privacy Policy, unless legally required to retain it.
            </p>
          </section>

          {/* 9. Disclaimers and Warranties */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">9. Disclaimers and Warranties</h2>
            
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">9.1 Educational Use</h3>
            <p className="text-neutral-700 mb-4">
              AIVO Learning is a supplemental educational tool. It is NOT a substitute for:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>Qualified teaching by licensed educators</li>
              <li>Professional educational or psychological evaluations</li>
              <li>Medical diagnosis or treatment</li>
              <li>IEP development (though it can assist in tracking goals)</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">9.2 AI Limitations</h3>
            <p className="text-neutral-700 mb-4">
              Our AI is designed to assist learning, but:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>AI-generated content may contain errors</li>
              <li>Educators should review AI feedback before relying on it</li>
              <li>AI is a tool to augment, not replace, human judgment</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">9.3 No Guaranteed Outcomes</h3>
            <p className="text-neutral-700">
              We do not guarantee specific academic outcomes, test scores, or learning improvements. Results vary 
              based on student effort, educator implementation, and other factors beyond our control.
            </p>
          </section>

          {/* 10. Limitation of Liability */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">10. Limitation of Liability</h2>
            <p className="text-neutral-700 mb-4">
              To the fullest extent permitted by law:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>AIVO Learning is not liable for indirect, incidental, or consequential damages</li>
              <li>Our total liability is limited to the amount you paid in the last 12 months</li>
              <li>We are not responsible for data loss due to user error or third-party failures</li>
              <li>Some jurisdictions do not allow liability limitations—these may not apply to you</li>
            </ul>
          </section>

          {/* 11. Dispute Resolution */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">11. Dispute Resolution</h2>
            
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">11.1 Informal Resolution</h3>
            <p className="text-neutral-700 mb-4">
              Before filing a claim, contact us at{' '}
              <a href="mailto:legal@aivolearning.com" className="text-primary-600 hover:underline">
                legal@aivolearning.com
              </a>{' '}
              to attempt informal resolution.
            </p>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">11.2 Arbitration</h3>
            <p className="text-neutral-700 mb-4">
              Any disputes will be resolved through binding arbitration under the American Arbitration Association 
              rules, except for claims that may be brought in small claims court.
            </p>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">11.3 Class Action Waiver</h3>
            <p className="text-neutral-700">
              You agree to resolve disputes individually, not as part of a class action or collective proceeding.
            </p>
          </section>

          {/* 12. General Provisions */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">12. General Provisions</h2>
            
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">12.1 Governing Law</h3>
            <p className="text-neutral-700 mb-4">
              These Terms are governed by the laws of the State of Minnesota, without regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">12.2 Changes to Terms</h3>
            <p className="text-neutral-700 mb-4">
              We may update these Terms periodically. We will notify you of material changes via email or in-app 
              notification at least 30 days before they take effect. Continued use after changes constitutes acceptance.
            </p>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">12.3 Severability</h3>
            <p className="text-neutral-700 mb-4">
              If any provision of these Terms is found unenforceable, the remaining provisions remain in effect.
            </p>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">12.4 Entire Agreement</h3>
            <p className="text-neutral-700">
              These Terms, along with our Privacy Policy, constitute the entire agreement between you and AIVO Learning.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">13. Contact Us</h2>
            <p className="text-neutral-700 mb-4">
              For questions about these Terms, contact us:
            </p>
            <div className="bg-neutral-100 rounded-lg p-6">
              <p className="text-neutral-900 font-semibold mb-2">AIVO Learning Legal Team</p>
              <p className="text-neutral-700">1400 Van Buren, Minneapolis, MN 55413</p>
              <p className="text-neutral-700">Email: <a href="mailto:legal@aivolearning.com" className="text-primary-600 hover:underline">legal@aivolearning.com</a></p>
              <p className="text-neutral-700">Phone: 1-800-AIVO-HELP (1-800-248-6435)</p>
            </div>
          </section>

          {/* Download */}
          <div className="bg-primary-50 rounded-lg p-6 text-center">
            <p className="text-neutral-700 mb-4">
              <strong>Download:</strong> <a href="#" className="text-primary-600 hover:underline">Terms of Service PDF</a>
            </p>
            <p className="text-sm text-neutral-600">
              By using AIVO Learning, you acknowledge that you have read and agree to these Terms of Service.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Terms;
