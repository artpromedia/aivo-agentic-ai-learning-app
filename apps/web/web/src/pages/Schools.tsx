import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '@aivo/ui';
import { CheckIcon } from '@heroicons/react/24/outline';

export function Schools() {
  const handleContactSales = () => {
    window.location.href = '/signup/select-role';
  };

  const challenges = [
    {
      icon: '📉',
      title: 'Rising Special Education Costs',
      description: 'AIVO reduces staffing needs by automating differentiation and documentation, cutting SpEd costs by up to 30%.',
    },
    {
      icon: '📋',
      title: 'Compliance Documentation Burden',
      description: 'Auto-generate IEP progress reports with specific examples. Meet compliance requirements in a fraction of the time.',
    },
    {
      icon: '👩‍🏫',
      title: 'Teacher Burnout & Retention',
      description: 'Give teachers back 10+ hours per week. Reduce burnout, improve retention, attract top talent.',
    },
    {
      icon: '📊',
      title: 'Lack of Data-Driven Insights',
      description: 'District-wide analytics show what interventions work. Make evidence-based decisions, not guesses.',
    },
  ];

  const implementationSteps = [
    {
      phase: 'Month 1',
      title: 'Pilot Program',
      details: 'Start with 2-3 classrooms. Train teachers, baseline assessment for students.',
    },
    {
      phase: 'Month 2',
      title: 'Onboarding',
      details: 'Expand to full grade level or department. Ongoing support and professional development.',
    },
    {
      phase: 'Month 3',
      title: 'Integration',
      details: 'Connect to your LMS and SIS. Import student data, sync rosters.',
    },
    {
      phase: 'Month 4-6',
      title: 'Scale',
      details: 'Roll out school-wide or district-wide. Monitor adoption and impact metrics.',
    },
    {
      phase: 'Ongoing',
      title: 'Optimization',
      details: 'Quarterly reviews with success team. Refine strategies based on data.',
    },
    {
      phase: 'Year 1+',
      title: 'Full Implementation',
      details: 'District-wide deployment. Measure ROI, improve outcomes, reduce costs.',
    },
  ];

  const caseStudies = [
    {
      district: 'Oakland Unified School District',
      size: '12,000 students',
      results: [
        '32% reduction in SpEd staffing needs',
        '87% of IEP goals met or exceeded',
        '4.6/5 teacher satisfaction score',
      ],
      quote: 'AIVO transformed how we support neurodiverse learners. Teachers are happier, students are progressing, and we\'re saving money.',
      author: 'Dr. Maria Santos',
      role: 'Director of Special Education',
    },
    {
      district: 'Boston Public Schools',
      size: '54,000 students',
      results: [
        '80% reduction in IEP documentation time',
        '$2.1M annual cost savings',
        '91% parent satisfaction',
      ],
      quote: 'We went from drowning in paperwork to having time for what matters: teaching kids.',
      author: 'James Mitchell',
      role: 'Assistant Superintendent',
    },
    {
      district: 'Miami-Dade County Schools',
      size: '350,000 students',
      results: [
        '45% improvement in reading scores',
        '78% reduction in compliance violations',
        '12% increase in teacher retention',
      ],
      quote: 'The ROI is undeniable. AIVO pays for itself in reduced staffing needs alone.',
      author: 'Dr. Elena Rodriguez',
      role: 'Chief Academic Officer',
    },
  ];

  const securityBadges = [
    'SOC 2 Type II',
    'FERPA Compliant',
    'COPPA Certified',
    'HIPAA Compliant',
    'GDPR Ready',
    'AES-256 Encryption',
  ];

  const integrationPartners = [
    'PowerSchool',
    'Infinite Campus',
    'Google Classroom',
    'Canvas LMS',
    'Schoology',
    'Clever',
    'ClassLink',
    'Microsoft Teams',
  ];

  const pricingTiers = [
    {
      name: 'School',
      price: 'Custom',
      description: 'For individual schools (up to 500 students)',
      features: [
        'All teacher features included',
        'School-wide dashboard',
        'Professional development (5 hours)',
        'Email support',
        'Quarterly business reviews',
      ],
    },
    {
      name: 'District',
      price: 'Custom',
      description: 'For districts (500-10,000 students)',
      features: [
        'Everything in School, plus:',
        'District-wide analytics',
        'Dedicated success manager',
        'Unlimited professional development',
        'Phone & priority support',
        'Custom integrations',
      ],
      featured: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large districts (10,000+ students)',
      features: [
        'Everything in District, plus:',
        'White-label options',
        'On-premise deployment',
        '24/7 dedicated support',
        'Custom AI model training',
        'SLA guarantees',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Scale Personalized Learning
                <br />
                <span className="text-accent-300">Across Your District</span>
              </h1>
              <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                AI-powered special education platform that reduces costs, improves outcomes, and frees teachers to teach.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={handleContactSales}
                className="bg-white text-primary-900 hover:bg-neutral-50"
              >
                Schedule District Demo
              </Button>
              <p className="mt-4 text-primary-200">
                ✓ 30-day pilot program available • ✓ No long-term contracts required
              </p>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="aspect-video bg-gradient-to-br from-white/20 to-white/5 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🏫</div>
                    <p className="text-lg font-semibold text-white">Enterprise-grade platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* District Challenges */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Solving Your Biggest Challenges
            </h2>
            <p className="text-xl text-neutral-600">
              Purpose-built for district administrators and special education directors
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {challenges.map((challenge, idx) => (
              <div key={idx} className="bg-gradient-to-br from-neutral-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
                <div className="text-5xl mb-4">{challenge.icon}</div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  {challenge.title}
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  {challenge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Administrative Dashboard Preview */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              District-Wide Command Center
            </h2>
            <p className="text-xl text-neutral-600">
              See everything happening across all schools in real-time
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-neutral-200">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">12,847</div>
                <p className="text-neutral-700">Active Students</p>
              </div>
              <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-success-600 mb-2">87%</div>
                <p className="text-neutral-700">IEP Goals On Track</p>
              </div>
              <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-accent-600 mb-2">$2.1M</div>
                <p className="text-neutral-700">Annual Cost Savings</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">Real-Time Analytics</h3>
                    <p className="text-neutral-600 text-sm">Track outcomes across all schools</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">Compliance Dashboard</h3>
                    <p className="text-neutral-600 text-sm">Automated IDEA compliance tracking</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">Budget Optimization</h3>
                    <p className="text-neutral-600 text-sm">See cost savings by school and program</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📈</div>
                  <p className="text-neutral-600">District Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Calculate Your ROI
            </h2>
            <p className="text-xl text-neutral-600">
              See how much AIVO can save your district
            </p>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-3xl p-8 shadow-xl">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-neutral-900 mb-4">Average District Savings</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Reduced staffing needs:</span>
                    <span className="font-bold text-primary-600">$1.2M/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Documentation time saved:</span>
                    <span className="font-bold text-primary-600">$650K/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Compliance cost reduction:</span>
                    <span className="font-bold text-primary-600">$250K/year</span>
                  </div>
                  <div className="border-t-2 border-neutral-300 pt-3 flex justify-between">
                    <span className="font-bold text-neutral-900">Total Annual Savings:</span>
                    <span className="text-2xl font-bold text-success-600">$2.1M</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 mb-4">Investment</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-700">AIVO District License:</span>
                    <span className="font-bold text-neutral-900">~$400K/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Implementation & Training:</span>
                    <span className="font-bold text-neutral-900">$50K one-time</span>
                  </div>
                  <div className="border-t-2 border-neutral-300 pt-3 flex justify-between">
                    <span className="font-bold text-neutral-900">Net Annual Savings:</span>
                    <span className="text-2xl font-bold text-success-600">$1.7M</span>
                  </div>
                  <p className="text-sm text-neutral-600 italic mt-4">
                    * Based on 10,000-student district. Your savings may vary.
                  </p>
                </div>
              </div>
            </div>

            <Button variant="primary" size="lg" onClick={handleContactSales} className="w-full">
              Get Custom ROI Analysis
            </Button>
          </div>
        </div>
      </section>

      {/* Implementation Timeline */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Proven Implementation Process
            </h2>
            <p className="text-xl text-neutral-600">
              From pilot to full deployment in 6 months
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {implementationSteps.map((step, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="text-sm font-bold text-primary-600 mb-2">{step.phase}</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  {step.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Enterprise-Grade Security
            </h2>
            <p className="text-xl text-neutral-600">
              We take student data protection seriously
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {securityBadges.map((badge, idx) => (
              <div key={idx} className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-6 text-center hover:shadow-lg transition">
                <div className="text-3xl mb-2">🔒</div>
                <p className="text-sm font-bold text-neutral-900">{badge}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Proven Results Across Districts
            </h2>
          </div>

          <div className="space-y-8">
            {caseStudies.map((study, idx) => (
              <div key={idx} className="bg-white rounded-3xl shadow-xl p-8 border border-neutral-200">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                      {study.district}
                    </h3>
                    <p className="text-neutral-600 mb-6">{study.size}</p>
                    
                    <div className="space-y-3 mb-6">
                      {study.results.map((result, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                          <span className="text-neutral-700">{result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-6">
                    <p className="text-lg italic text-neutral-700 mb-4">
                      "{study.quote}"
                    </p>
                    <div className="border-t border-neutral-300 pt-4">
                      <p className="font-bold text-neutral-900">{study.author}</p>
                      <p className="text-sm text-neutral-600">{study.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Partners */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Seamless Integration With Your Systems
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrationPartners.map((partner, idx) => (
              <div key={idx} className="bg-neutral-50 rounded-xl p-6 text-center hover:bg-neutral-100 transition">
                <p className="font-semibold text-neutral-900">{partner}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Flexible Pricing for Every District
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`rounded-3xl p-8 ${
                  tier.featured
                    ? 'bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-2xl scale-105'
                    : 'bg-white shadow-xl border border-neutral-200'
                }`}
              >
                <h3 className={`text-2xl font-bold mb-2 ${tier.featured ? 'text-white' : 'text-neutral-900'}`}>
                  {tier.name}
                </h3>
                <div className={`text-4xl font-bold mb-2 ${tier.featured ? 'text-white' : 'text-primary-600'}`}>
                  {tier.price}
                </div>
                <p className={`mb-6 ${tier.featured ? 'text-primary-100' : 'text-neutral-600'}`}>
                  {tier.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tier.featured ? 'text-primary-200' : 'text-success-500'}`} />
                      <span className={tier.featured ? 'text-white' : 'text-neutral-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleContactSales}
                  className={`w-full ${tier.featured ? 'bg-white text-primary-600 hover:bg-neutral-50' : ''}`}
                >
                  Contact Sales
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-900 to-accent-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Special Education in Your District?
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Schedule a demo with our team to see AIVO in action
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={handleContactSales}
            className="bg-white text-primary-900 hover:bg-neutral-50"
          >
            Schedule District Demo
          </Button>
          <p className="mt-4 text-primary-200">30-day pilot program available • No long-term contracts required</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
