import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export function Privacy() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-neutral-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-neutral-600 mb-12">Last Updated: October 27, 2025</p>

        <div className="prose prose-neutral max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">1. Introduction</h2>
            <p className="text-neutral-700 mb-4">
              At AIVO Learning ("we," "our," or "us"), we take the privacy and security of your information seriously. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use 
              our AI-powered learning platform for neurodiverse children.
            </p>
            <p className="text-neutral-700 mb-4">
              We are committed to complying with:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li><strong>FERPA</strong> (Family Educational Rights and Privacy Act)</li>
              <li><strong>HIPAA</strong> (Health Insurance Portability and Accountability Act)</li>
              <li><strong>COPPA</strong> (Children's Online Privacy Protection Act)</li>
              <li><strong>CCPA</strong> (California Consumer Privacy Act)</li>
              <li><strong>GDPR</strong> (General Data Protection Regulation, where applicable)</li>
            </ul>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">2.1 Student Information</h3>
            <p className="text-neutral-700 mb-4">
              With parental or guardian consent, we may collect:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>Name, age, and grade level</li>
              <li>Learning assessments and academic performance data</li>
              <li>IEP (Individualized Education Program) goals and accommodations</li>
              <li>Diagnoses relevant to learning (e.g., ADHD, dyslexia, autism spectrum)</li>
              <li>Learning preferences and interaction data</li>
              <li>Voice recordings (for speech-to-text features, with explicit consent)</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">2.2 Parent/Guardian Information</h3>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>Name, email address, and phone number</li>
              <li>Payment information (processed securely through third-party providers)</li>
              <li>Communication preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">2.3 Educator Information</h3>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>Name, email address, and school affiliation</li>
              <li>Professional credentials and certifications</li>
              <li>Classroom and student management data</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-900 mb-3">2.4 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Device information (browser type, operating system)</li>
              <li>IP address and approximate location (for security purposes)</li>
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>Log files and error reports</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-neutral-700 mb-4">We use collected information to:</p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Provide personalized AI tutoring and learning experiences</li>
              <li>Track academic progress and generate reports</li>
              <li>Improve our AI models and platform features</li>
              <li>Communicate with parents, educators, and administrators</li>
              <li>Process payments and manage subscriptions</li>
              <li>Comply with legal obligations (FERPA, HIPAA, etc.)</li>
              <li>Detect and prevent fraud or security threats</li>
              <li>Conduct research (only with explicit consent and in de-identified form)</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">4. How We Share Your Information</h2>
            <p className="text-neutral-700 mb-4">
              We do <strong>not</strong> sell student data to third parties. We may share information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li><strong>With Educators:</strong> Parents can choose to share student data with authorized teachers</li>
              <li><strong>With Schools:</strong> If using AIVO through a school account, the school may access student data</li>
              <li><strong>Service Providers:</strong> Trusted third parties (e.g., cloud hosting, payment processors) under strict confidentiality agreements</li>
              <li><strong>Legal Compliance:</strong> When required by law, subpoena, or court order</li>
              <li><strong>Safety:</strong> To protect the safety of students, staff, or others</li>
              <li><strong>Business Transfers:</strong> In the event of a merger or acquisition (with notice to users)</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">5. Data Security</h2>
            <p className="text-neutral-700 mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
              <li>SOC 2 Type II certified data centers</li>
              <li>Regular security audits and penetration testing</li>
              <li>Role-based access controls and multi-factor authentication</li>
              <li>HIPAA-compliant infrastructure for health-related data</li>
              <li>Automated backup and disaster recovery systems</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">6. Your Privacy Rights</h2>
            <p className="text-neutral-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li><strong>Access:</strong> Request a copy of your data</li>
              <li><strong>Correct:</strong> Update inaccurate or incomplete information</li>
              <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
              <li><strong>Export:</strong> Download your data in a portable format</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Object:</strong> Restrict certain data processing activities</li>
            </ul>
            <p className="text-neutral-700 mt-4">
              To exercise these rights, contact us at <a href="mailto:privacy@aivolearning.com" className="text-primary-600 hover:underline">privacy@aivolearning.com</a>
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">7. Children's Privacy (COPPA)</h2>
            <p className="text-neutral-700 mb-4">
              AIVO is designed for children with learning differences. We:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Require verifiable parental consent before collecting child data</li>
              <li>Collect only information necessary for educational purposes</li>
              <li>Do not display advertising to children</li>
              <li>Allow parents to review, modify, or delete their child's data</li>
              <li>Do not condition a child's participation on providing more data than necessary</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">8. Data Retention</h2>
            <p className="text-neutral-700 mb-4">
              We retain data as follows:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li><strong>Active Accounts:</strong> Data retained while account is active</li>
              <li><strong>After Cancellation:</strong> 90 days retention period for account recovery</li>
              <li><strong>Legal Requirements:</strong> Some data retained longer to comply with legal obligations</li>
              <li><strong>De-identified Data:</strong> May be retained indefinitely for research and product improvement</li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">9. Cookies and Tracking</h2>
            <p className="text-neutral-700 mb-4">
              We use cookies and similar technologies for:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Authentication and session management</li>
              <li>Analytics (Google Analytics, with IP anonymization)</li>
              <li>Security and fraud prevention</li>
            </ul>
            <p className="text-neutral-700 mt-4">
              You can control cookies through your browser settings. Note that disabling cookies may affect functionality.
            </p>
          </section>

          {/* International Users */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">10. International Users</h2>
            <p className="text-neutral-700">
              AIVO is based in the United States. If you access our services from outside the US, your data may be 
              transferred to and processed in the US. By using AIVO, you consent to this transfer.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">11. Changes to This Policy</h2>
            <p className="text-neutral-700">
              We may update this Privacy Policy periodically. We will notify you of significant changes via email or 
              in-app notification. Continued use of AIVO after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">12. Contact Us</h2>
            <p className="text-neutral-700 mb-4">
              For privacy-related questions or concerns, contact us:
            </p>
            <div className="bg-neutral-100 rounded-lg p-6">
              <p className="text-neutral-900 font-semibold mb-2">AIVO Learning Privacy Team</p>
              <p className="text-neutral-700">1400 Van Buren, Minneapolis, MN 55413</p>
              <p className="text-neutral-700">Email: <a href="mailto:privacy@aivolearning.com" className="text-primary-600 hover:underline">privacy@aivolearning.com</a></p>
              <p className="text-neutral-700">Phone: 1-800-AIVO-HELP (1-800-248-6435)</p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Privacy;
