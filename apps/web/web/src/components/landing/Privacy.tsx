import { LockClosedIcon, UserGroupIcon, DocumentTextIcon, CloudIcon } from '@heroicons/react/24/outline';

export function Privacy() {
  const features = [
    {
      icon: LockClosedIcon,
      bg: 'bg-primary-50',
      iconColor: 'text-primary-600',
      title: 'Data Isolation',
      points: [
        'Each AI model is completely isolated',
        'Your child\'s data stays with their model',
        'No cross-student data sharing',
        'Encrypted at rest and in transit',
      ],
    },
    {
      icon: UserGroupIcon,
      bg: 'bg-primary-50',
      iconColor: 'text-primary-600',
      title: 'COPPA Compliant',
      points: [
        'Parental consent required',
        'No targeted advertising',
        'Limited data collection',
        'Easy data deletion',
      ],
    },
    {
      icon: DocumentTextIcon,
      bg: 'bg-green-50',
      iconColor: 'text-green-600',
      title: 'FERPA Certified',
      points: [
        'Education records protected',
        'Parent access rights',
        'School data agreements',
        'Audit trails maintained',
      ],
    },
    {
      icon: CloudIcon,
      bg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      title: 'Enterprise Grade',
      points: [
        'SOC 2 Type II certified',
        '99.9% uptime SLA',
        'Regular security audits',
        'Penetration testing',
      ],
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-neutral-50 to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Your Child's AI Model is Private, Secure, and Yours
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-4">
                  {feature.title}
                </h3>
                <ul className="space-y-2">
                  {feature.points.map((point, i) => (
                    <li key={i} className="text-sm text-neutral-600 flex items-start gap-2">
                      <span className="text-neutral-400 mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Callout Box */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-50 border-l-4 border-primary-600 rounded-xl p-8 mb-8">
          <p className="text-lg leading-relaxed">
            <span className="font-bold text-primary-600">Your child's AI model learns only from their data.</span>{' '}
            <span className="text-neutral-700">
              We never train on or share your child's information with other models or organizations. 
              The model belongs to your child and can be exported or deleted at any time.
            </span>
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <a href="#privacy" className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition">
            Read Privacy Policy
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <span className="text-neutral-400">•</span>
          <a href="#security" className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition">
            View Security Docs
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
