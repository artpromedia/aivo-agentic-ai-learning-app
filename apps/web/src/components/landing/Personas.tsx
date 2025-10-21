import { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

export function Personas() {
  const [activeTab, setActiveTab] = useState('schools');

  const tabs = [
    { id: 'schools', label: 'For Schools' },
    { id: 'teachers', label: 'For Teachers' },
    { id: 'parents', label: 'For Parents' },
    { id: 'students', label: 'For Students' },
  ];

  const content = {
    schools: {
      title: 'Streamline District Operations',
      benefits: [
        'District-wide compliance reporting',
        'Caseload management across schools',
        'Federal & state reporting automation',
        'Budget tracking for special services',
        'Staff professional development tracking',
      ],
      cta: 'Explore for Schools',
    },
    teachers: {
      title: 'Simplify Your Workflow',
      benefits: [
        'AI-powered IEP goal writing',
        'Quick progress monitoring tools',
        'Behavior tracking and analysis',
        'Lesson plan integration',
        'Data collection made simple',
      ],
      cta: 'Explore for Teachers',
    },
    parents: {
      title: 'Stay Connected and Informed',
      benefits: [
        'Real-time progress updates',
        'Secure messaging with teachers',
        'Easy access to all IEP documents',
        'Goal tracking visibility',
        'Meeting schedule notifications',
      ],
      cta: 'Explore for Parents',
    },
    students: {
      title: 'Build Your Future',
      benefits: [
        'Self-advocacy skill development',
        'Transition planning tools',
        'Personal goal setting dashboard',
        'Career exploration resources',
        'Post-secondary preparation',
      ],
      cta: 'Explore for Students',
    },
  };

  const activeContent = content[activeTab as keyof typeof content];

  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <h2 className="text-4xl md:text-5xl font-bold text-center text-neutral-900 mb-12">
          Built for Everyone in Special Education
        </h2>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Screenshot Placeholder */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-neutral-200">
              {/* Mock Interface */}
              <div className="space-y-4">
                <div className="h-8 bg-gradient-to-r from-primary-200 to-primary-100 rounded w-3/4"></div>
                <div className="h-4 bg-neutral-100 rounded w-full"></div>
                <div className="h-4 bg-neutral-100 rounded w-5/6"></div>
                <div className="h-4 bg-neutral-100 rounded w-4/6"></div>
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="h-24 bg-success-50 rounded-lg"></div>
                  <div className="h-24 bg-primary-50 rounded-lg"></div>
                  <div className="h-24 bg-accent-50 rounded-lg"></div>
                </div>
                <div className="h-32 bg-neutral-50 rounded-lg mt-4"></div>
              </div>
            </div>
          </div>

          {/* Right: Benefits */}
          <div className="order-1 lg:order-2">
            <h3 className="text-3xl font-bold text-neutral-900 mb-6">
              {activeContent.title}
            </h3>

            <ul className="space-y-4 mb-8">
              {activeContent.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success-100 flex items-center justify-center mt-0.5">
                    <CheckIcon className="w-4 h-4 text-success-600" />
                  </div>
                  <span className="text-lg text-neutral-700">{benefit}</span>
                </li>
              ))}
            </ul>

            <a
              href="#"
              className="inline-flex items-center text-lg font-semibold text-primary-600 hover:text-primary-700 transition"
            >
              {activeContent.cta}
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
