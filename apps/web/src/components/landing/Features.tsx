import { 
  DocumentTextIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  BellAlertIcon, 
  GlobeAltIcon 
} from '@heroicons/react/24/outline';

export function Features() {
  const features = [
    {
      icon: DocumentTextIcon,
      title: 'IEP Builder with AI',
      description: 'Generate IDEA-compliant IEPs in minutes with AI-powered goal writing, progress monitoring, and automated documentation.',
      link: '#',
    },
    {
      icon: ChartBarIcon,
      title: 'Progress Tracking',
      description: 'Real-time data collection, visual progress reports, and data-driven insights for every goal and student.',
      link: '#',
    },
    {
      icon: UserGroupIcon,
      title: 'Team Collaboration',
      description: 'Connect teachers, therapists, parents, and administrators with secure, FERPA-compliant communication tools.',
      link: '#',
    },
    {
      icon: AcademicCapIcon,
      title: 'Transition Planning',
      description: 'Comprehensive transition assessments, post-secondary goals, and work-based learning tracking for ages 14+.',
      link: '#',
    },
    {
      icon: BellAlertIcon,
      title: 'Compliance Alerts',
      description: 'Never miss a deadline with automated reminders for IEP reviews, evaluations, and required meetings.',
      link: '#',
    },
    {
      icon: GlobeAltIcon,
      title: 'Parent Portal',
      description: 'Keep families engaged with real-time progress updates, secure messaging, and easy document access.',
      link: '#',
    },
  ];

  return (
    <section id="features" className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-3">
            Complete Platform
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900">
            Everything You Need for Special Education
          </h2>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="bg-white rounded-xl p-8 shadow-card hover:shadow-card-hover transition-shadow duration-300 group"
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-primary-600" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Learn More Link */}
              <a 
                href={feature.link} 
                className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700 transition"
              >
                Learn more
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
