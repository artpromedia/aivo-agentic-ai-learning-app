import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '@aivo/ui';
import {
  SparklesIcon,
  AcademicCapIcon,
  ChartBarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CubeTransparentIcon,
  ClipboardDocumentCheckIcon,
  BookOpenIcon,
  BoltIcon,
  HeartIcon,
  DevicePhoneMobileIcon,
  CloudIcon,
} from '@heroicons/react/24/outline';

export default function Features() {
  const heroFeatures = [
    {
      icon: SparklesIcon,
      title: 'Personal AI Model',
      description: 'Each child gets their own AI that learns their unique learning style, pace, and preferences.',
      color: 'primary',
    },
    {
      icon: AcademicCapIcon,
      title: 'IEP Integration',
      description: 'Automatically aligns lessons with IEP goals and tracks progress in real-time.',
      color: 'green',
    },
    {
      icon: ChartBarIcon,
      title: 'Advanced Analytics',
      description: 'Comprehensive insights into learning patterns, engagement, and goal achievement.',
      color: 'orange',
    },
  ];

  const coreFeatures = [
    {
      icon: ClipboardDocumentCheckIcon,
      title: 'Adaptive Learning Engine',
      description: 'Real-time difficulty adjustment based on performance and engagement levels.',
      benefits: [
        'Automatically adjusts content difficulty',
        'Maintains optimal challenge level',
        'Reduces frustration and anxiety',
        'Increases time in flow state',
      ],
    },
    {
      icon: BookOpenIcon,
      title: 'Comprehensive Curriculum',
      description: 'Standards-aligned content covering all core subjects for PreK-12.',
      benefits: [
        'Math, Reading, Science, Social Studies',
        'Life skills and social-emotional learning',
        'Vocational and career readiness',
        '10,000+ activities and lessons',
      ],
    },
    {
      icon: BoltIcon,
      title: 'Multi-Sensory Learning',
      description: 'Engages multiple senses to reinforce learning and accommodate different styles.',
      benefits: [
        'Visual, auditory, and kinesthetic modes',
        'Text-to-speech and speech-to-text',
        'Interactive animations and videos',
        'Hands-on virtual manipulatives',
      ],
    },
    {
      icon: HeartIcon,
      title: 'Emotional Intelligence',
      description: 'AI detects frustration, confusion, and disengagement to provide support.',
      benefits: [
        'Real-time emotion detection',
        'Adaptive encouragement and breaks',
        'Social-emotional learning activities',
        'Mindfulness and regulation tools',
      ],
    },
    {
      icon: UserGroupIcon,
      title: 'Collaborative Tools',
      description: 'Seamless communication between parents, teachers, and therapists.',
      benefits: [
        'Shared progress dashboards',
        'Secure messaging system',
        'Goal setting and tracking',
        'Activity recommendations for home',
      ],
    },
    {
      icon: ShieldCheckIcon,
      title: 'Privacy & Security',
      description: 'COPPA and FERPA compliant with enterprise-grade security.',
      benefits: [
        'End-to-end encryption',
        'Private AI models (data never shared)',
        'SOC 2 Type II certified',
        'Regular third-party audits',
      ],
    },
  ];

  const platformFeatures = [
    {
      icon: DevicePhoneMobileIcon,
      title: 'Cross-Platform Access',
      description: 'Works on any device - tablets, computers, phones, and Aivo Pad.',
    },
    {
      icon: CloudIcon,
      title: 'Offline Mode',
      description: 'Download lessons for learning anywhere, anytime without internet.',
    },
    {
      icon: CubeTransparentIcon,
      title: 'Seamless Sync',
      description: 'Progress syncs automatically across all devices and platforms.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Platform Features
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Everything You Need for
              <br />
              <span className="text-primary-600">Personalized Special Education</span>
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Aivo combines AI technology, evidence-based practices, and user-friendly design to create
              the most comprehensive learning platform for neurodiverse children.
            </p>
          </div>

          {/* Hero Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {heroFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              const colorMap = {
                primary: 'bg-primary-100 text-primary-600',
                green: 'bg-green-100 text-green-600',
                orange: 'bg-orange-100 text-orange-600',
              };
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-8 shadow-lg border-2 border-neutral-100 hover:border-primary-200 transition"
                >
                  <div className={`w-14 h-14 ${colorMap[feature.color as keyof typeof colorMap]} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">{feature.title}</h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Core Features
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Powerful tools designed specifically for special education
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-neutral-50 to-white rounded-2xl p-8 border border-neutral-200 hover:shadow-lg transition"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">{feature.title}</h3>
                  <p className="text-neutral-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, bidx) => (
                      <li key={bidx} className="flex items-start gap-2 text-sm text-neutral-700">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Available Everywhere
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Learn on any device, anywhere, anytime
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {platformFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">{feature.title}</h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">10,000+</div>
              <div className="text-primary-100">Learning Activities</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">350+</div>
              <div className="text-primary-100">Students in Pilot</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">92%</div>
              <div className="text-primary-100">Engagement Rate</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">4.9/5</div>
              <div className="text-primary-100">Satisfaction Score</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Ready to Transform Learning?
          </h2>
          <p className="text-xl text-neutral-600 mb-8">
            Join our pilot program and experience the future of special education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/signup/select-role">
              <Button variant="primary" size="lg">
                Try for Free
              </Button>
            </a>
            <a href="/pricing">
              <Button variant="outline" size="lg">
                View Pricing
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

