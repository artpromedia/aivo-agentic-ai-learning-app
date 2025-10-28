import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  ServerIcon,
  KeyIcon,
  BellAlertIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export function Security() {
  const features = [
    {
      icon: <LockClosedIcon className="w-12 h-12" />,
      title: 'Military-Grade Encryption',
      description: 'AES-256 encryption for data at rest and TLS 1.3 for data in transit. Your data is protected with the same encryption used by financial institutions and government agencies.',
    },
    {
      icon: <ShieldCheckIcon className="w-12 h-12" />,
      title: 'SOC 2 Type II Certified',
      description: 'Independently audited and certified for security, availability, confidentiality, and privacy controls. Annual audits ensure ongoing compliance.',
    },
    {
      icon: <KeyIcon className="w-12 h-12" />,
      title: 'Advanced Access Controls',
      description: 'Multi-factor authentication (MFA), role-based access controls (RBAC), SSO integration with Google, Microsoft, and Clever. Session management and automatic timeout.',
    },
    {
      icon: <ServerIcon className="w-12 h-12" />,
      title: 'Secure Infrastructure',
      description: 'Hosted on SOC 2 certified cloud infrastructure with 99.9% uptime SLA. Geographic redundancy, DDoS protection, and network segmentation.',
    },
    {
      icon: <BellAlertIcon className="w-12 h-12" />,
      title: '24/7 Security Monitoring',
      description: 'Real-time threat detection, intrusion prevention systems, automated security alerts, and incident response team on standby.',
    },
    {
      icon: <ClockIcon className="w-12 h-12" />,
      title: 'Automated Backups',
      description: 'Daily encrypted backups with 30-day retention. Point-in-time recovery capabilities. Geographic backup redundancy for disaster recovery.',
    },
  ];

  const compliance = [
    {
      name: 'FERPA',
      description: 'Family Educational Rights and Privacy Act',
      badge: '✓ Compliant',
    },
    {
      name: 'COPPA',
      description: 'Children\'s Online Privacy Protection Act',
      badge: '✓ Compliant',
    },
    {
      name: 'SOC 2 Type II',
      description: 'System and Organization Controls',
      badge: '✓ Certified',
    },
    {
      name: 'GDPR',
      description: 'General Data Protection Regulation',
      badge: '✓ Compliant',
    },
  ];

  const bestPractices = [
    {
      title: 'For Administrators',
      tips: [
        'Enable multi-factor authentication for all accounts',
        'Regularly review user access permissions',
        'Conduct annual security training for staff',
        'Monitor activity logs for unusual behavior',
        'Set strong password requirements',
      ],
    },
    {
      title: 'For Educators',
      tips: [
        'Use unique, strong passwords (12+ characters)',
        'Never share your login credentials',
        'Log out when using shared computers',
        'Report suspicious activity immediately',
        'Review student access levels regularly',
      ],
    },
    {
      title: 'For Parents',
      tips: [
        'Monitor your child\'s account activity',
        'Enable parental controls and notifications',
        'Teach children about online safety',
        'Keep devices updated with latest security patches',
        'Use secure Wi-Fi networks',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShieldCheckIcon className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Security You Can Trust
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Protecting student data is our highest priority. AIVO Learning employs enterprise-grade security 
            measures to keep your information safe.
          </p>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-12">
            Our Security Measures
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="text-primary-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-12">
            Compliance & Certifications
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {compliance.map((item) => (
              <div
                key={item.name}
                className="bg-gradient-to-br from-success-50 to-white rounded-lg shadow-md p-6 text-center border-2 border-success-200"
              >
                <div className="text-3xl font-bold text-success-600 mb-2">{item.badge}</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{item.name}</h3>
                <p className="text-sm text-neutral-600">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-neutral-700 mb-6">
              Our security practices are independently audited and certified. We undergo annual SOC 2 Type II audits 
              and maintain compliance with all applicable education privacy laws.
            </p>
            <a
              href="#"
              className="text-primary-600 hover:underline font-semibold"
            >
              Download SOC 2 Report (for schools/districts) →
            </a>
          </div>
        </div>
      </section>

      {/* AIVO Pad Security */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-6">AIVO Pad Device Security</h2>
            <p className="text-lg text-neutral-300 mb-8">
              Our hardware device includes additional security measures for offline learning:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Local Encryption</h3>
                <p className="text-neutral-300 mb-6">
                  All data stored on the device is encrypted with AES-256. Even if a device is lost or stolen, 
                  student work remains protected.
                </p>
                <h3 className="text-xl font-semibold mb-3">Secure Sync</h3>
                <p className="text-neutral-300">
                  Data synchronization uses encrypted channels with mutual TLS authentication. Only authenticated 
                  devices can sync with our servers.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Remote Wipe</h3>
                <p className="text-neutral-300 mb-6">
                  Administrators can remotely wipe lost or stolen devices to protect student privacy. Data is 
                  securely deleted and unrecoverable.
                </p>
                <h3 className="text-xl font-semibold mb-3">Device Management</h3>
                <p className="text-neutral-300">
                  Schools can enforce security policies: automatic lock after inactivity, password requirements, 
                  and app restrictions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-12">
            Security Best Practices
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {bestPractices.map((category) => (
              <div key={category.title} className="bg-neutral-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                  {category.title}
                </h3>
                <ul className="space-y-3">
                  {category.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-neutral-700">
                      <span className="text-success-500 mt-1">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Incident Response */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-8">
            Incident Response & Monitoring
          </h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  24/7 Security Monitoring
                </h3>
                <p className="text-neutral-700">
                  Our security operations center monitors all systems around the clock. Automated alerts detect 
                  suspicious activity, unauthorized access attempts, and potential threats.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Incident Response Team
                </h3>
                <p className="text-neutral-700">
                  In the event of a security incident, our dedicated response team follows a documented protocol 
                  to contain, investigate, and remediate threats. We notify affected users within 72 hours.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Breach Notification
                </h3>
                <p className="text-neutral-700">
                  We comply with all state and federal breach notification requirements. Users are informed promptly 
                  of any data breaches affecting their accounts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report Security Issues */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Report a Security Issue</h2>
          <p className="text-xl text-primary-100 mb-8">
            Found a vulnerability? We appreciate responsible disclosure. Report security issues to our team.
          </p>
          <div className="bg-white/10 rounded-lg p-6 mb-8">
            <p className="text-lg mb-2">
              <strong>Security Team:</strong> <a href="mailto:security@aivolearning.com" className="underline">security@aivolearning.com</a>
            </p>
            <p className="text-sm text-primary-100">
              PGP Key available upon request for encrypted communications
            </p>
          </div>
          <p className="text-sm text-primary-100">
            We commit to responding to security reports within 48 hours and providing updates every 72 hours until resolved.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Questions About Our Security?
          </h2>
          <p className="text-lg text-neutral-700 mb-8">
            Our security team is here to answer questions from schools, districts, and concerned parents.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:security@aivolearning.com" className="text-primary-600 hover:underline font-semibold">
              Contact Security Team
            </a>
            <span className="text-neutral-400">•</span>
            <a href="#" className="text-primary-600 hover:underline font-semibold">
              Download Security Whitepaper
            </a>
            <span className="text-neutral-400">•</span>
            <a href="#" className="text-primary-600 hover:underline font-semibold">
              Request SOC 2 Report
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Security;
