import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '@aivo/ui';
import { useState } from 'react';
import { CheckCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export function CaseStudies() {
  const [activeFilter, setActiveFilter] = useState('all');

  const handleStartAssessment = () => {
    window.location.href = '/signup/select-role';
  };

  const handleShareStory = () => {
    window.location.href = 'mailto:stories@aivolearning.com';
  };

  const filters = ['All', 'Families', 'Schools', 'Educators'];

  const impactMetrics = [
    {
      value: '350+',
      label: 'Students in pilot program',
    },
    {
      value: '92%',
      label: 'Improved learning engagement',
    },
    {
      value: '87%',
      label: 'Meeting or exceeding IEP goals',
    },
    {
      value: '4.9/5',
      label: 'Parent satisfaction score',
    },
    {
      value: '94%',
      label: 'Teacher recommendation rate',
    },
    {
      value: '12',
      label: 'Schools in pilot program',
    },
  ];

  const anonymizedCaseStudies = [
    {
      category: 'family',
      title: '9-Year-Old with ADHD & Dyslexia',
      location: 'Northern California',
      diagnoses: 'ADHD + Dyslexia',
      timeWithAivo: '6 months',
      results: 'Reading level +1.5 grades',
      quote: 'My daughter actually ASKS to do her lessons now. I never thought I\'d see that day.',
      attribution: 'Parent from Northern California',
      icon: '👧',
    },
    {
      category: 'school',
      title: 'Washington Elementary School District',
      location: 'Pacific Northwest',
      size: '450 students, 80 with IEPs',
      timeWithAivo: '1 year',
      results: [
        '25% improvement in IEP goal attainment',
        '300 teacher hours saved annually',
        '95% educator satisfaction',
      ],
      quote: 'AIVO transformed our special education program',
      attribution: 'School Principal',
      icon: '🏫',
    },
    {
      category: 'educator',
      title: '5th Grade Inclusion Teacher',
      location: 'San Francisco Bay Area',
      classroom: '28 students, 12 with IEPs',
      timeWithAivo: '8 months',
      results: 'Differentiation time reduced from hours to minutes',
      quote: 'This is the game-changer I\'ve been waiting for in my 15-year career.',
      attribution: 'Special Education Teacher',
      icon: '👩‍🏫',
    },
    {
      category: 'family',
      title: 'Twin Brothers, Ages 12',
      location: 'Texas',
      profiles: 'One with ADHD, one with Autism',
      timeWithAivo: '10 months',
      results: 'Each twin following personalized path, both thriving',
      quote: 'For the first time, we have ONE solution that works for BOTH boys.',
      attribution: 'Parent from Texas',
      icon: '👦👦',
    },
    {
      category: 'school',
      title: 'Large Urban District',
      location: 'Midwest',
      size: '12,000 students, 1,800 in special education',
      timeWithAivo: '18 months',
      results: [
        '$2M in operational efficiency savings',
        '95% teacher satisfaction',
        '30% reduction in IEP meeting time',
      ],
      quote: 'Transformative for our special education services',
      attribution: 'District Superintendent',
      icon: '🏛️',
    },
    {
      category: 'family',
      title: '10-Year-Old with Dysgraphia',
      location: 'Northeast US',
      diagnoses: 'Dysgraphia + Anxiety',
      timeWithAivo: '5 months',
      results: 'Writing confidence transformed, now writes stories voluntarily',
      quote: 'She went from refusing to write to asking for a journal for her birthday.',
      attribution: 'Parent from Northeast',
      icon: '✍️',
    },
    {
      category: 'educator',
      title: 'Speech-Language Pathologist',
      location: 'Southern California',
      caseload: '40 students with various speech needs',
      timeWithAivo: '7 months',
      results: [
        'Home practice compliance +80%',
        'Better generalization of skills',
      ],
      quote: 'Parents tell me their kids actually want to do their speech homework now.',
      attribution: 'Speech-Language Pathologist',
      icon: '🗣️',
    },
    {
      category: 'school',
      title: 'Virtual Charter Network',
      location: 'Multi-state (West Coast)',
      size: '6 schools, 100% remote learning',
      timeWithAivo: '1 year',
      results: [
        'Consistent quality across all sites',
        'Parent engagement up 60%',
        'Student retention improved',
      ],
      quote: 'AIVO solved our personalization challenge at scale.',
      attribution: 'Network Director',
      icon: '💻',
    },
  ];

  const filteredCaseStudies = activeFilter === 'all' 
    ? anonymizedCaseStudies 
    : anonymizedCaseStudies.filter(study => {
        if (activeFilter === 'families') return study.category === 'family';
        if (activeFilter === 'schools') return study.category === 'school';
        if (activeFilter === 'educators') return study.category === 'educator';
        return true;
      });

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-accent-600 text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Real Stories, Real Results
          </h1>
          <p className="text-xl text-primary-100 mb-10 max-w-3xl mx-auto">
            See how families, educators, and schools are transforming learning with AIVO
          </p>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter.toLowerCase())}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  activeFilter === filter.toLowerCase()
                    ? 'bg-white text-primary-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Case Study - Founder's Story */}
      <section className="py-20 bg-gradient-to-br from-accent-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-primary-200">
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 px-8 py-6">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
                <span className="text-sm font-semibold text-white uppercase tracking-wide">
                  The Founder&apos;s Story • Full Consent Provided
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Why We Built This: Jayden and Jason Ofem&apos;s Journey
              </h2>
            </div>

            <div className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-neutral-700 leading-relaxed mb-6">
                  AIVO wasn&apos;t born in a lab or a boardroom—it was born at a kitchen table, watching two brilliant boys struggle with a one-size-fits-all education system.
                </p>

                <p className="text-lg text-neutral-600 mb-6">
                  Meet <strong>Jayden Ofem (11, 6th grade)</strong> and <strong>Jason Ofem (14, 9th grade)</strong>—the two reasons AIVO exists.
                </p>

                <div className="grid md:grid-cols-2 gap-8 my-8">
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-4">Jason&apos;s Journey</h3>
                    <p className="text-neutral-700 mb-4">
                      Jason is a creative thinker with ADHD and dyslexia. School told us he was &apos;behind.&apos; We saw a child who could explain complex video game mechanics, build intricate Minecraft worlds, and solve problems in ways that amazed us—but traditional reading and writing felt like torture.
                    </p>
                    <p className="text-neutral-700 mb-4">
                      Homework battles. Tears. &apos;I&apos;m stupid&apos; became his nightly refrain. We tried tutors, accommodations, therapy. Nothing stuck because nothing adapted to how his brain actually worked.
                    </p>
                    <p className="text-neutral-700">
                      That&apos;s when we realized: the system wasn&apos;t broken—it just wasn&apos;t built for kids like Jason.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-4">Jayden&apos;s Journey</h3>
                    <p className="text-neutral-700 mb-4">
                      Jayden has autism and sensory processing differences. Traditional classrooms overwhelmed him—fluorescent lights, unpredictable noise, social demands. He&apos;d shut down or melt down, and teachers thought he was being defiant.
                    </p>
                    <p className="text-neutral-700 mb-4">
                      But give Jayden a calm environment, clear structure, and sensory accommodations? He thrives. He can focus for 45 minutes on topics he loves. He just needed learning that understood his brain.
                    </p>
                    <p className="text-neutral-700">
                      We couldn&apos;t keep watching brilliant kids be told they weren&apos;t enough.
                    </p>
                  </div>
                </div>

                <p className="text-lg text-neutral-700 mb-6">
                  So we built AIVO. Not as a side project, but as a mission. Because if Jason and Jayden needed this, thousands of other neurodiverse kids did too.
                </p>

                <div className="bg-success-50 rounded-2xl p-6 mb-6">
                  <h4 className="text-xl font-bold text-neutral-900 mb-4">The Results:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircleIcon className="w-6 h-6 text-success-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700"><strong>Jason Ofem:</strong> Reading +2 grade levels in 8 months, homework independence achieved, developed self-advocacy skills</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircleIcon className="w-6 h-6 text-success-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700"><strong>Jayden Ofem:</strong> 45-minute focus sessions, sensory accommodations working seamlessly, confidence growing daily</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-neutral-700 italic">
                  &quot;Every child we help is a reminder of why we started this journey. Jason and Jayden showed us what&apos;s possible when learning adapts to the child, not the other way around.&quot;
                </p>
                <p className="text-neutral-600 mt-2">
                  — Dr. Ofem, Founder & CEO, AIVO Learning
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Anonymized Case Studies Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              More Success Stories
            </h2>
            <p className="text-xl text-neutral-600">
              All testimonials comply with HIPAA and FERPA regulations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {filteredCaseStudies.map((study, idx) => (
              <div key={idx} className="bg-gradient-to-br from-neutral-50 to-white rounded-2xl p-8 shadow-lg border border-neutral-200">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl">{study.icon}</div>
                  <div className="flex-1">
                    <div className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                      {study.category.charAt(0).toUpperCase() + study.category.slice(1)}
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      {study.title}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {study.location} • {study.timeWithAivo}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {study.diagnoses && (
                    <p className="text-sm text-neutral-700">
                      <strong>Profile:</strong> {study.diagnoses}
                    </p>
                  )}
                  {study.size && (
                    <p className="text-sm text-neutral-700">
                      <strong>Size:</strong> {study.size}
                    </p>
                  )}
                  {study.classroom && (
                    <p className="text-sm text-neutral-700">
                      <strong>Classroom:</strong> {study.classroom}
                    </p>
                  )}
                  {study.caseload && (
                    <p className="text-sm text-neutral-700">
                      <strong>Caseload:</strong> {study.caseload}
                    </p>
                  )}
                  {study.profiles && (
                    <p className="text-sm text-neutral-700">
                      <strong>Profiles:</strong> {study.profiles}
                    </p>
                  )}
                </div>

                <div className="bg-success-50 rounded-xl p-4 mb-6">
                  <p className="text-sm font-semibold text-success-700 mb-2">Results:</p>
                  {Array.isArray(study.results) ? (
                    <ul className="space-y-1">
                      {study.results.map((result, i) => (
                        <li key={i} className="text-sm text-neutral-700 flex items-start gap-2">
                          <span className="text-success-500">•</span>
                          {result}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-neutral-700">{study.results}</p>
                  )}
                </div>

                <blockquote className="border-l-4 border-primary-500 pl-4 mb-4">
                  <p className="text-neutral-700 italic mb-2">&quot;{study.quote}&quot;</p>
                  <cite className="text-sm text-neutral-600 not-italic">
                    — {study.attribution}
                  </cite>
                </blockquote>

                <p className="text-xs text-neutral-500 italic">
                  Student identity protected per HIPAA/FERPA
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Compliance Notice */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-primary-200">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheckIcon className="w-8 h-8 text-primary-600" />
              <h2 className="text-2xl font-bold text-neutral-900">
                Privacy & Compliance Note
              </h2>
            </div>

            <p className="text-neutral-700 mb-6">
              All student success stories on this page comply with HIPAA and FERPA regulations:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-900">Jayden and Jason Ofem:</p>
                  <p className="text-sm text-neutral-600">Real names used with explicit parental consent (they are the founder&apos;s children)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-900">All other students:</p>
                  <p className="text-sm text-neutral-600">Anonymous identifiers used (e.g., &quot;9-year-old,&quot; &quot;Student A,&quot; &quot;6th grader&quot;)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-900">School/District names:</p>
                  <p className="text-sm text-neutral-600">Used only with proper agreements and no personally identifiable student information</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-900">Parent/Educator quotes:</p>
                  <p className="text-sm text-neutral-600">Anonymized or used with written consent</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-900">No photos of students:</p>
                  <p className="text-sm text-neutral-600">All visuals are illustrations or avatars</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-neutral-600 italic">
              We take student privacy seriously. If you&apos;d like to share your story, we&apos;ll work with you to ensure proper consent and anonymization. Contact us at{' '}
              <a href="mailto:stories@aivolearning.com" className="text-primary-600 hover:underline">
                stories@aivolearning.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Making a Difference Across Thousands of Families
            </h2>
            <p className="text-xl text-neutral-600">
              Aggregated, de-identified impact data
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {impactMetrics.map((metric, idx) => (
              <div key={idx} className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-8 text-center">
                <div className="text-5xl font-bold text-primary-600 mb-3">
                  {metric.value}
                </div>
                <p className="text-neutral-700">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-neutral-500 mt-8 italic">
            All metrics represent aggregated data with no individual student identification
          </p>
        </div>
      </section>

      {/* Share Your Story */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Share Your Story
          </h2>
          <p className="text-xl text-neutral-600 mb-8">
            Is AIVO making a difference for your child or classroom? We&apos;d love to hear from you!
          </p>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-left">
            <p className="font-semibold text-neutral-900 mb-4">Consent Options:</p>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1" />
                <span className="text-neutral-700">I consent to sharing my story anonymously</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1" />
                <span className="text-neutral-700">I consent to using my child&apos;s first name only (requires documentation)</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1" />
                <span className="text-neutral-700">I consent to using my school/district name (requires admin approval)</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1" />
                <span className="text-neutral-700">I prefer to remain completely anonymous</span>
              </label>
            </div>
          </div>

          <Button variant="primary" size="lg" onClick={handleShareStory}>
            Share Your Success Story
          </Button>
          <p className="mt-4 text-sm text-neutral-600">
            We&apos;ll work with you to ensure proper consent and privacy protection.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-accent-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Write Your Own Success Story?
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Join thousands of families transforming learning with AIVO
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartAssessment}
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
