import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '@aivo/ui';
import {
  MagnifyingGlassIcon,
  RocketLaunchIcon,
  BookOpenIcon,
  AcademicCapIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

export function Documentation() {
  const handleGetStarted = () => {
    window.location.href = '/signup/select-role';
  };

  const quickStart = [
    {
      icon: RocketLaunchIcon,
      title: 'Quick Start Guide',
      description: 'Get up and running in 5 minutes',
      link: '#quick-start',
    },
    {
      icon: AcademicCapIcon,
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      link: '#tutorials',
    },
    {
      icon: DocumentTextIcon,
      title: 'Setup Checklist',
      description: 'Complete setup checklist for teachers',
      link: '#setup',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'FAQ',
      description: 'Answers to common questions',
      link: '#faq',
    },
  ];

  const categories = [
    {
      icon: AcademicCapIcon,
      title: 'For Parents',
      description: 'Setting up your child\'s account, monitoring progress, and understanding AI insights',
      articles: 12,
      link: '#parents',
    },
    {
      icon: BookOpenIcon,
      title: 'For Teachers',
      description: 'Classroom management, IEP tracking, differentiation tools, and parent communication',
      articles: 24,
      link: '#teachers',
    },
    {
      icon: WrenchScrewdriverIcon,
      title: 'For Administrators',
      description: 'District setup, analytics, compliance, and integration with existing systems',
      articles: 18,
      link: '#administrators',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Privacy & Security',
      description: 'COPPA compliance, data protection, FERPA guidelines, and security best practices',
      articles: 8,
      link: '#security',
    },
    {
      icon: WrenchScrewdriverIcon,
      title: 'Technical Documentation',
      description: 'API reference, webhooks, integrations, and developer resources',
      articles: 32,
      link: '/api-reference',
    },
  ];

  const popularArticles = [
    {
      title: 'How does AIVO create a personalized AI model for my child?',
      category: 'Parents',
      readTime: '5 min',
    },
    {
      title: 'Setting up your first classroom in AIVO',
      category: 'Teachers',
      readTime: '8 min',
    },
    {
      title: 'Tracking IEP goals and generating progress reports',
      category: 'Teachers',
      readTime: '10 min',
    },
    {
      title: 'Understanding AIVO\'s sensory-friendly interface options',
      category: 'Parents',
      readTime: '4 min',
    },
    {
      title: 'Integrating AIVO with Google Classroom',
      category: 'Teachers',
      readTime: '6 min',
    },
    {
      title: 'District-wide deployment best practices',
      category: 'Administrators',
      readTime: '12 min',
    },
    {
      title: 'What data does AIVO collect and how is it protected?',
      category: 'Security',
      readTime: '7 min',
    },
    {
      title: 'Sharing progress with therapists and specialists',
      category: 'Parents',
      readTime: '5 min',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section with Search */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-accent-600 text-white py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            AIVO Documentation
          </h1>
          <p className="text-xl text-primary-100 mb-10">
            Everything you need to get the most out of AIVO
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full pl-14 pr-4 py-4 rounded-xl text-neutral-900 text-lg focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-xl"
            />
          </div>

          <p className="mt-6 text-primary-100 text-sm">
            Popular searches: IEP tracking, sensory settings, parent dashboard, API integration
          </p>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Quick Start
            </h2>
            <p className="text-xl text-neutral-600">
              Get started with AIVO in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickStart.map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                className="bg-gradient-to-br from-neutral-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition group"
              >
                <item.icon className="w-12 h-12 text-primary-600 mb-4 group-hover:scale-110 transition" />
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-neutral-600">
                  {item.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Browse by Category
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.slice(0, 3).map((category, idx) => (
              <a
                key={idx}
                href={category.link}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition group"
              >
                <category.icon className="w-12 h-12 text-primary-600 mb-4 group-hover:scale-110 transition" />
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  {category.title}
                </h3>
                <p className="text-neutral-600 mb-4 leading-relaxed">
                  {category.description}
                </p>
                <p className="text-sm text-primary-600 font-semibold">
                  {category.articles} articles →
                </p>
              </a>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            {categories.slice(3, 5).map((category, idx) => (
              <a
                key={idx}
                href={category.link}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition group"
              >
                <category.icon className="w-12 h-12 text-primary-600 mb-4 group-hover:scale-110 transition" />
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  {category.title}
                </h3>
                <p className="text-neutral-600 mb-4 leading-relaxed">
                  {category.description}
                </p>
                <p className="text-sm text-primary-600 font-semibold">
                  {category.articles} articles →
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Popular Articles
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {popularArticles.map((article, idx) => (
              <a
                key={idx}
                href="#"
                className="block bg-neutral-50 rounded-xl p-6 hover:bg-neutral-100 transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
                        {article.category}
                      </span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                  <DocumentTextIcon className="w-6 h-6 text-neutral-400 group-hover:text-primary-600 transition flex-shrink-0 ml-4" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Still Need Help?
            </h2>
            <p className="text-xl text-neutral-600">
              We're here to support you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <ChatBubbleLeftRightIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Live Chat Support
              </h3>
              <p className="text-neutral-600 mb-6">
                Chat with our support team Monday-Friday, 9am-6pm ET
              </p>
              <Button variant="primary" size="md" onClick={handleGetStarted}>
                Start Chat
              </Button>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <EnvelopeIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Email Support
              </h3>
              <p className="text-neutral-600 mb-6">
                Send us an email and we&apos;ll respond within 24 hours
              </p>
              <Button variant="secondary" size="md" onClick={() => window.location.href = 'mailto:support@aivo.ai'}>
                Email Us
              </Button>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <AcademicCapIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Schedule Training
              </h3>
              <p className="text-neutral-600 mb-6">
                Book a 1-on-1 training session with our education specialists
              </p>
              <Button variant="secondary" size="md" onClick={handleGetStarted}>
                Book Session
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-accent-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started with AIVO?
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Join thousands of families and educators using AIVO
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={handleGetStarted}
            className="bg-white text-primary-600 hover:bg-neutral-50"
          >
            Start Free Assessment
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
