import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '@aivo/ui';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export function Parents() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleJoinFamilies = () => {
    window.location.href = '/signup/select-role';
  };

  const painPoints = [
    {
      icon: '😔',
      problem: 'My child shuts down with traditional lessons',
      solution: 'AIVO adjusts difficulty in real-time. Reduces frustration, builds confidence.',
    },
    {
      icon: '🤔',
      problem: 'I don\'t know if they\'re really learning',
      solution: 'Real-time dashboard shows progress. See exactly what strategies work.',
    },
    {
      icon: '😰',
      problem: 'School says one thing, we see another at home',
      solution: 'Share insights with teachers & therapists. Everyone stays on the same page.',
    },
    {
      icon: '😤',
      problem: 'Every app is one-size-fits-all',
      solution: 'AIVO creates a unique AI model for YOUR child. Not generic content for all kids.',
    },
  ];

  const transparency = [
    {
      title: 'See the AI Model',
      items: [
        'Watch how we build your child\'s model',
        'Understand every personalization decision',
        'No black boxes',
      ],
    },
    {
      title: 'Your Data, Your Control',
      items: [
        'COPPA compliant privacy',
        'Delete anytime',
        'Never sold or shared',
      ],
    },
    {
      title: 'Explainable Results',
      items: [
        'Why did the AI recommend this?',
        'How is my child progressing?',
        'Plain-language explanations',
      ],
    },
  ];

  const faqs = [
    {
      question: 'Is this safe for my child?',
      answer: 'Yes. AIVO is COPPA compliant, meaning we meet strict standards for protecting children\'s privacy online. We never share or sell data, and you control what information is collected.',
    },
    {
      question: 'Will this replace their teacher?',
      answer: 'No. AIVO is designed to support teachers, not replace them. It handles differentiation and documentation so teachers can focus on human connection and instruction.',
    },
    {
      question: 'What if my child has multiple diagnoses?',
      answer: 'AIVO is designed for co-occurring conditions. The AI understands that many children have ADHD + autism, dyslexia + ADHD, or other combinations, and adapts accordingly.',
    },
    {
      question: 'Can I use this alongside therapy?',
      answer: 'Absolutely! AIVO complements speech therapy, OT, PT, and other services. You can share progress with therapists to coordinate care.',
    },
    {
      question: 'How long until I see results?',
      answer: 'Most parents notice increased engagement within the first week. Measurable academic progress typically shows within 4-6 weeks of consistent use.',
    },
    {
      question: 'What ages does this work for?',
      answer: 'AIVO is designed for ages 5-18, covering elementary through high school. Content adapts to developmental level, not just grade level.',
    },
    {
      question: 'Do you share data with schools?',
      answer: 'Only if you explicitly choose to share. You control all data sharing through your parent dashboard. You can share as much or as little as you want.',
    },
    {
      question: 'Can I try it first?',
      answer: 'Yes! We offer a free baseline assessment so you can see how AIVO works for your child before committing. No credit card required.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
                Finally, Learning That
                <br />
                <span className="text-primary-600">Works for Your Child</span>
              </h1>
              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                Stop searching for what works. AIVO's AI learns your child's unique strengths and challenges, then adapts every lesson to their needs.
              </p>
              <Button variant="primary" size="lg" onClick={handleJoinFamilies}>
                Join Our Growing Community
              </Button>
              <p className="text-sm text-neutral-500 mt-4">
                350+ families in our pilot program seeing real results
              </p>
            </div>
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-100 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">👨‍👩‍👧</div>
                    <p className="text-lg font-semibold text-neutral-700">Learning together</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              We Know What You're Going Through
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {painPoints.map((point, idx) => (
              <div key={idx} className="bg-neutral-50 rounded-2xl p-8">
                <div className="text-5xl mb-4">{point.icon}</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  "{point.problem}"
                </h3>
                <p className="text-success-600 font-semibold mb-2">✓ AIVO Solution:</p>
                <p className="text-neutral-700 leading-relaxed">
                  {point.solution}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parent Dashboard Preview */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Your Parent Dashboard
            </h2>
            <p className="text-xl text-neutral-600">
              See everything, control everything
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-neutral-200">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-2">Real-time Progress Tracking</h3>
                    <p className="text-neutral-600">See what your child is learning right now</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-2">Learning Insights</h3>
                    <p className="text-neutral-600">Understand patterns and what strategies work</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-2">Home Support Recommendations</h3>
                    <p className="text-neutral-600">Activities and tips for supporting at home</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-2">Easy Sharing</h3>
                    <p className="text-neutral-600">One-click sharing with teachers and therapists</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📱</div>
                  <p className="text-neutral-600">Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparency Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              You Deserve to Know How AI Works for Your Child
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {transparency.map((item, idx) => (
              <div key={idx} className="bg-gradient-to-br from-white to-neutral-50 rounded-2xl p-8 shadow-lg border border-neutral-100">
                <h3 className="text-2xl font-bold text-neutral-900 mb-6">
                  {item.title}
                </h3>
                <ul className="space-y-3">
                  {item.items.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Simple, Family-Friendly Pricing
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-primary-200">
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-primary-600 mb-2">$29.99<span className="text-2xl text-neutral-600">/month</span></div>
              <p className="text-xl text-neutral-600">For 1 child</p>
              <p className="text-lg text-neutral-500 mt-2">$25/child/month for multiple children</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <CheckIcon className="w-6 h-6 text-success-500" />
                <span className="text-neutral-700">Free baseline assessment</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon className="w-6 h-6 text-success-500" />
                <span className="text-neutral-700">Unlimited learning sessions</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon className="w-6 h-6 text-success-500" />
                <span className="text-neutral-700">Real-time parent dashboard</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon className="w-6 h-6 text-success-500" />
                <span className="text-neutral-700">Share with teachers & therapists</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon className="w-6 h-6 text-success-500" />
                <span className="text-neutral-700">Cancel anytime</span>
              </li>
            </ul>

            <Button variant="primary" size="lg" onClick={handleJoinFamilies} className="w-full">
              Start Free Assessment
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-neutral-50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-100 transition"
                >
                  <span className="font-semibold text-neutral-900">{faq.question}</span>
                  <ChevronDownIcon className={`w-5 h-5 text-neutral-600 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4">
                    <p className="text-neutral-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Give Your Child the Learning They Deserve
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Join thousands of families who've discovered personalized AI learning
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={handleJoinFamilies}
            className="bg-white text-primary-600 hover:bg-neutral-50"
          >
            Start Free Assessment
          </Button>
          <p className="mt-4 text-primary-100">No credit card required • Cancel anytime</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
