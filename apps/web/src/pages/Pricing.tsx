import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '@aivo/ui';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function Pricing() {
  const plans = [
    {
      name: 'Parent Essential',
      price: '$29',
      period: '/month',
      description: 'Perfect for individual families',
      features: [
        'Up to 2 children',
        '10 hours AI tutoring/month',
        'Basic progress tracking',
        'Email support',
        'Learning assessments',
        'Mobile app access',
      ],
      notIncluded: [
        'IEP goal tracking',
        'Teacher collaboration',
        'Advanced analytics',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Parent Pro',
      price: '$79',
      period: '/month',
      description: 'Best for families with multiple children',
      features: [
        'Up to 5 children',
        'Unlimited AI tutoring',
        'Advanced progress tracking',
        'IEP goal tracking',
        'Teacher collaboration tools',
        'Priority email support',
        'Custom learning paths',
        'Detailed analytics',
        'Parent portal access',
      ],
      notIncluded: [
        'Dedicated account manager',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Educator',
      price: '$199',
      period: '/month',
      description: 'For individual teachers & tutors',
      features: [
        'Up to 30 students',
        'Unlimited AI tutoring',
        'Classroom management',
        'IEP creation & tracking',
        'Progress reports',
        'Parent communication',
        'Professional development',
        'Priority support',
        'Custom assessments',
      ],
      notIncluded: [],
      cta: 'Start Free Trial',
      popular: false,
    },
  ];

  const enterprisePlans = [
    {
      name: 'School',
      price: 'Custom',
      period: '',
      description: 'For schools with 50-500 students',
      features: [
        'Unlimited students',
        'Unlimited teachers',
        'School-wide analytics',
        'District integration',
        'Dedicated onboarding',
        'Training & support',
        'Custom branding',
        'API access',
        'FERPA/HIPAA compliance',
        'SIS integration',
      ],
      cta: 'Schedule Demo',
      icon: '🏫',
    },
    {
      name: 'District',
      price: 'Custom',
      period: '',
      description: 'For districts with 500+ students',
      features: [
        'Everything in School plan',
        'Multi-school management',
        'District-wide reporting',
        'Dedicated success manager',
        'Custom integrations',
        '99.9% uptime SLA',
        'White-label options',
        'Advanced security',
        'Professional development',
        'Implementation support',
      ],
      cta: 'Contact Sales',
      icon: '🏛️',
    },
  ];

  const faqs = [
    {
      question: 'Is there a free trial?',
      answer: 'Yes! All plans include a 14-day free trial. No credit card required.',
    },
    {
      question: 'Can I change plans later?',
      answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and purchase orders for school/district plans.',
    },
    {
      question: 'Do you offer discounts for non-profits?',
      answer: 'Yes! Non-profit organizations and Title I schools receive a 25% discount. Contact us for details.',
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No setup fees for any plan. School and District plans include free onboarding and training.',
    },
    {
      question: 'What happens to my data if I cancel?',
      answer: 'You can export all your data at any time. After cancellation, your data is retained for 90 days before permanent deletion.',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto mb-8">
            Choose the plan that's right for you. All plans include a 14-day free trial.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckIcon className="w-5 h-5 text-success-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="w-5 h-5 text-success-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="w-5 h-5 text-success-400" />
              <span>Money-back guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Individual Plans */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Individual & Educator Plans
            </h2>
            <p className="text-lg text-neutral-600">
              Perfect for parents and individual educators
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl shadow-lg border-2 p-8 ${
                  plan.popular
                    ? 'border-primary-500 relative'
                    : 'border-neutral-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-neutral-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-neutral-900">
                      {plan.price}
                    </span>
                    <span className="text-neutral-600 ml-2">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-neutral-400">
                      <XMarkIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? 'primary' : 'secondary'}
                  size="lg"
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Plans */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              School & District Plans
            </h2>
            <p className="text-lg text-neutral-600">
              Custom solutions for educational institutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {enterprisePlans.map((plan) => (
              <div
                key={plan.name}
                className="bg-gradient-to-br from-neutral-50 to-white rounded-2xl shadow-lg border-2 border-neutral-200 p-8"
              >
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">{plan.icon}</div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-neutral-600 mb-4">{plan.description}</p>
                  <div className="text-3xl font-bold text-neutral-900">
                    {plan.price}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button variant="primary" size="lg" className="w-full">
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>

          {/* Volume Pricing */}
          <div className="mt-16 bg-primary-50 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">
              Volume Discounts Available
            </h3>
            <p className="text-lg text-neutral-700 mb-6 max-w-2xl mx-auto">
              We offer special pricing for large districts and state-wide implementations.
              Contact our sales team for a custom quote.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg">
                Schedule Demo
              </Button>
              <Button variant="secondary" size="lg">
                Download Pricing Guide
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-neutral-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Learning?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of families and educators using AIVO
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" size="lg">
              Start Free Trial
            </Button>
            <Button variant="secondary" size="lg" className="bg-white/10 hover:bg-white/20 text-white">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Pricing;
