import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '@aivo/ui';
import { CheckIcon } from '@heroicons/react/24/outline';

export function Integrations() {
  const integrations = [
    {
      name: 'Clever',
      category: 'SSO & Rostering',
      logo: '🔐',
      description: 'Seamless single sign-on and automatic roster sync for schools.',
      features: [
        'One-click SSO for students and teachers',
        'Automatic roster updates',
        'Secure Library authentication',
        'Real-time class sync',
      ],
      status: 'Available',
    },
    {
      name: 'Google Classroom',
      category: 'LMS Integration',
      logo: '📚',
      description: 'Sync assignments, grades, and student progress with Google Classroom.',
      features: [
        'Assignment push/pull',
        'Grade sync',
        'Student roster import',
        'Google Drive integration',
      ],
      status: 'Available',
    },
    {
      name: 'Canvas LMS',
      category: 'LMS Integration',
      logo: '🎨',
      description: 'Full integration with Canvas for assignments and gradebook.',
      features: [
        'LTI 1.3 integration',
        'Assignment passback',
        'Grade sync',
        'Deep linking support',
      ],
      status: 'Available',
    },
    {
      name: 'Schoology',
      category: 'LMS Integration',
      logo: '🏫',
      description: 'Connect AIVO with Schoology for unified learning management.',
      features: [
        'Assignment integration',
        'Grade passback',
        'SSO support',
        'Course rostering',
      ],
      status: 'Available',
    },
    {
      name: 'Microsoft Teams for Education',
      category: 'Collaboration',
      logo: '👥',
      description: 'Embed AIVO directly in Microsoft Teams channels and assignments.',
      features: [
        'Teams app integration',
        'Assignment sync',
        'Azure AD SSO',
        'OneNote integration',
      ],
      status: 'Available',
    },
    {
      name: 'ClassLink',
      category: 'SSO & Rostering',
      logo: '🔗',
      description: 'Single sign-on and roster sync via ClassLink.',
      features: [
        'OneRoster v1.1 support',
        'Instant Rostering',
        'SSO authentication',
        'Automated provisioning',
      ],
      status: 'Available',
    },
    {
      name: 'Infinite Campus',
      category: 'SIS Integration',
      logo: '🏛️',
      description: 'Student information system integration for enrollment and demographics.',
      features: [
        'Student demographic sync',
        'IEP data import',
        'Enrollment updates',
        'Parent contact sync',
      ],
      status: 'Available',
    },
    {
      name: 'PowerSchool',
      category: 'SIS Integration',
      logo: '⚡',
      description: 'Comprehensive SIS integration for student data and gradebook.',
      features: [
        'PowerSchool SIS API',
        'Grade export',
        'Student data sync',
        'Custom fields support',
      ],
      status: 'Available',
    },
    {
      name: 'Blackboard Learn',
      category: 'LMS Integration',
      logo: '🎓',
      description: 'Enterprise LMS integration for higher ed and K-12.',
      features: [
        'LTI 1.3 support',
        'Grade passback',
        'Deep linking',
        'Roster sync',
      ],
      status: 'Available',
    },
    {
      name: 'Moodle',
      category: 'LMS Integration',
      logo: '📖',
      description: 'Open-source LMS integration for flexible learning environments.',
      features: [
        'LTI integration',
        'Assignment submission',
        'Grade sync',
        'Custom fields',
      ],
      status: 'Available',
    },
    {
      name: 'Edmodo',
      category: 'LMS Integration',
      logo: '🌐',
      description: 'Social learning network integration for K-12 classrooms.',
      features: [
        'Assignment sharing',
        'Progress tracking',
        'Class groups sync',
        'Parent access',
      ],
      status: 'Coming Soon',
    },
    {
      name: 'Seesaw',
      category: 'Portfolio & Communication',
      logo: '📱',
      description: 'Student portfolio integration for elementary classrooms.',
      features: [
        'Student work sharing',
        'Parent communication',
        'Portfolio export',
        'Multi-modal content',
      ],
      status: 'Coming Soon',
    },
  ];

  const categories = [
    {
      name: 'Single Sign-On (SSO)',
      icon: '🔐',
      description: 'Secure authentication through existing school identity providers.',
    },
    {
      name: 'Rostering',
      icon: '👥',
      description: 'Automatic class and student roster synchronization.',
    },
    {
      name: 'Grade Sync',
      icon: '📊',
      description: 'Bi-directional grade synchronization with LMS platforms.',
    },
    {
      name: 'SIS Integration',
      icon: '🏫',
      description: 'Connect with Student Information Systems for enrollment and demographics.',
    },
  ];

  const benefits = [
    'Reduce admin workload with automatic roster sync',
    'Single sign-on eliminates password fatigue',
    'Seamless workflow within existing LMS',
    'Real-time grade updates to parent portals',
    'IEP data automatically imported',
    'No manual CSV uploads or data entry',
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Seamless Integrations with Your Existing Tools
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              AIVO connects with the learning platforms you already use—Clever, Google Classroom, 
              Canvas LMS, and more. No disruption to your workflow.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" size="lg">
                View All Integrations
              </Button>
              <Button variant="secondary" size="lg" className="bg-white/10 hover:bg-white/20 text-white">
                Request Integration
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-12">
            Integration Capabilities
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.name}
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition"
              >
                <div className="text-5xl mb-4">{category.icon}</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-neutral-600">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-12">
            Why Schools Love Our Integrations
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <CheckIcon className="w-6 h-6 text-success-500 flex-shrink-0 mt-1" />
                <p className="text-lg text-neutral-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-12">
            Available Integrations
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{integration.logo}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-900">
                        {integration.name}
                      </h3>
                      <p className="text-sm text-neutral-600">{integration.category}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      integration.status === 'Available'
                        ? 'bg-success-100 text-success-700'
                        : 'bg-warning-100 text-warning-700'
                    }`}
                  >
                    {integration.status}
                  </span>
                </div>
                <p className="text-neutral-700 mb-4">{integration.description}</p>
                <ul className="space-y-2">
                  {integration.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-neutral-600">
                      <CheckIcon className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Access */}
      <section className="py-20 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Need a Custom Integration?</h2>
          <p className="text-xl text-neutral-300 mb-8">
            We offer a robust REST API for districts and enterprise customers who need custom integrations 
            with proprietary systems.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/api-reference">
              <Button variant="outline" size="lg">
                API Documentation
              </Button>
            </a>
            <a href="mailto:integrations@aivolearning.com">
              <Button variant="secondary" size="lg" className="bg-white/10 hover:bg-white/20 text-white">
                Contact Integration Team
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">
            Ready to Connect AIVO to Your School?
          </h2>
          <p className="text-lg text-neutral-700 mb-8">
            Most integrations can be set up in under 10 minutes. Our support team is here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="primary" size="lg">
              Schedule Integration Demo
            </Button>
            <Button variant="secondary" size="lg">
              View Setup Guides
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Integrations;
