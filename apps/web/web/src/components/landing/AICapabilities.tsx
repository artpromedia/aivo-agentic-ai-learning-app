import { BookOpenIcon, ClipboardDocumentCheckIcon, HeartIcon, PencilSquareIcon, BeakerIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';

export function AICapabilities() {
  const capabilities = [
    {
      icon: BookOpenIcon,
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
      contentBg: 'bg-primary-50',
      title: 'Personalized Learning Paths',
      description: 'AI model analyzes IEP goals and creates custom curriculum. Recommends activities based on current level and interests. Adjusts difficulty in real-time as your child learns.',
      example: 'Struggling with fractions? Model simplifies, then gradually increases',
      exampleColor: 'text-primary-700 bg-primary-50 border-primary-200',
      learnColor: 'text-primary-600',
    },
    {
      icon: ClipboardDocumentCheckIcon,
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
      contentBg: 'bg-primary-50',
      title: 'IEP-Integrated Progress Tracking',
      description: 'Every learning session automatically updates IEP goal progress. Parents and teachers see real-time dashboards with detailed insights and data-driven recommendations.',
      example: 'No more manual progress notes - the AI does it for you',
      exampleColor: 'text-primary-700 bg-primary-50 border-primary-200',
      learnColor: 'text-primary-600',
    },
    {
      icon: HeartIcon,
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
      contentBg: 'bg-pink-50',
      title: 'Social-Emotional Learning Tracking',
      description: 'Monitor engagement levels, emotional responses, and social skill development. The AI model adapts content to maintain flow state and positive learning experiences.',
      example: '',
      exampleColor: '',
      learnColor: 'text-pink-600',
    },
    {
      icon: PencilSquareIcon,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      contentBg: 'bg-orange-50',
      title: 'AI-Powered Writing Workshop',
      description: '5-stage writing process with personalized AI coaching. From brainstorming to publishing, the model provides scaffolded support matched to writing level and IEP goals.',
      example: 'AI suggests sentence starters, vocabulary, and provides instant feedback',
      exampleColor: 'text-orange-700 bg-orange-50 border-orange-200',
      learnColor: 'text-orange-600',
    },
    {
      icon: BeakerIcon,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      contentBg: 'bg-green-50',
      title: 'NGSS-Aligned Science Curriculum',
      description: 'Interactive experiments and explorations adapted to each student\'s reading level and background knowledge. Virtual labs with AI guidance.',
      example: '',
      exampleColor: '',
      learnColor: 'text-green-600',
    },
    {
      icon: PuzzlePieceIcon,
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
      contentBg: 'bg-primary-50',
      title: 'Play-Based Learning for PreK-K',
      description: 'Developmentally appropriate games and activities that build foundational skills through play. AI adapts challenge level to maintain engagement.',
      example: 'Learning disguised as fun - children don\'t even realize they\'re learning',
      exampleColor: 'text-primary-700 bg-primary-50 border-primary-200',
      learnColor: 'text-primary-600',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            What Your Child's AI Model Can Do
          </h2>
        </div>

        {/* Capabilities Grid */}
        <div className="space-y-8">
          {capabilities.map((capability, idx) => {
            const Icon = capability.icon;
            const isEven = idx % 2 === 0;
            
            return (
              <div key={idx} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}>
                {/* Icon Card */}
                <div className={`flex-shrink-0 w-full lg:w-1/2 ${capability.contentBg} rounded-3xl p-12 flex items-center justify-center`}>
                  <div className={`${capability.iconBg} rounded-2xl p-8`}>
                    <Icon className={`w-24 h-24 ${capability.iconColor}`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className={`${capability.iconBg} ${capability.iconColor} inline-block p-2 rounded-lg mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                    {capability.title}
                  </h3>
                  <p className="text-neutral-600 mb-4 leading-relaxed">
                    {capability.description}
                  </p>
                  {capability.example && (
                    <div className={`${capability.exampleColor} border-l-4 pl-4 py-2 text-sm italic mb-4`}>
                      {capability.example}
                    </div>
                  )}
                  <a href="/signup/select-role" className={`inline-flex items-center gap-2 ${capability.learnColor} font-semibold hover:gap-3 transition-all`}>
                    Learn More
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
