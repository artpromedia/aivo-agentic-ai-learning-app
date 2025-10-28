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
      title: 'Learns Your Child\'s Learning Style',
      description: 'AI detects whether your child is visual, auditory, or kinesthetic. Automatically adjusts content for ADHD attention spans, autism processing needs, or dyslexia reading support.',
      link: '/signup/select-role',
    },
    {
      icon: ChartBarIcon,
      title: 'Sensory-Friendly Interface',
      description: 'Customizable colors, sounds, and animations. Reduces overwhelm with minimal UI, predictable layouts, and calming design choices that work for sensory-sensitive children.',
      link: '/signup/select-role',
    },
    {
      icon: UserGroupIcon,
      title: 'Executive Function Scaffolding',
      description: 'Built-in timers, visual schedules, and task breakdown for children with ADHD or autism. AI provides gentle prompts and celebrates small wins to build momentum.',
      link: '/signup/select-role',
    },
    {
      icon: AcademicCapIcon,
      title: 'Multi-Sensory Learning Paths',
      description: 'Combines visuals, audio, movement, and hands-on activities. Perfect for children with dyslexia, dysgraphia, or those who learn best through multiple modalities.',
      link: '/signup/select-role',
    },
    {
      icon: BellAlertIcon,
      title: 'Emotional Regulation Support',
      description: 'AI monitors engagement and frustration levels. Automatically adjusts difficulty, offers breaks, and provides encouragement matched to your child\'s emotional state.',
      link: '/signup/select-role',
    },
    {
      icon: GlobeAltIcon,
      title: 'Parent Dashboard & Insights',
      description: 'See exactly what your child is learning, how they\'re progressing, and what strategies are working. Share insights with teachers and therapists in real-time.',
      link: '/signup/select-role',
    },
  ];

  return (
    <section id="features" className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-3">
            Designed for Neurodiversity
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900">
            How AIVO Adapts to Your Child's Unique Brain
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
