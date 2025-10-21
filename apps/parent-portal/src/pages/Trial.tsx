export function Trial() {
  const trialDaysLeft = 12;
  const trialDaysTotal = 14;
  const trialProgress = ((trialDaysTotal - trialDaysLeft) / trialDaysTotal) * 100;

  const features = {
    free: {
      name: 'Free Trial',
      price: '$0',
      period: '14 days',
      features: [
        { name: 'All 3 subjects (Reading, Math, Speech)', included: true },
        { name: 'AI-powered personalized learning', included: true },
        { name: 'Basic progress tracking', included: true },
        { name: 'Up to 2 devices', included: true },
        { name: 'Email support', included: true },
        { name: 'Detailed analytics', included: false },
        { name: 'Unlimited devices', included: false },
        { name: 'Priority support', included: false },
        { name: 'Family sharing', included: false },
      ],
    },
    pro: {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      popular: true,
      features: [
        { name: 'All 3 subjects (Reading, Math, Speech)', included: true },
        { name: 'AI-powered personalized learning', included: true },
        { name: 'Advanced progress tracking', included: true },
        { name: 'Up to 5 devices', included: true },
        { name: 'Priority email support', included: true },
        { name: 'Detailed analytics & reports', included: true },
        { name: 'Monthly progress reports', included: true },
        { name: 'Family sharing (up to 4 members)', included: true },
        { name: 'Custom learning goals', included: false },
      ],
    },
    premium: {
      name: 'Premium',
      price: '$49',
      period: 'per month',
      features: [
        { name: 'All 3 subjects (Reading, Math, Speech)', included: true },
        { name: 'AI-powered personalized learning', included: true },
        { name: 'Advanced progress tracking', included: true },
        { name: 'Unlimited devices', included: true },
        { name: '24/7 priority support', included: true },
        { name: 'Detailed analytics & reports', included: true },
        { name: 'Weekly progress reports', included: true },
        { name: 'Unlimited family sharing', included: true },
        { name: 'Custom learning goals', included: true },
        { name: 'One-on-one educator consultations', included: true },
      ],
    },
  };

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Parent of 2',
      avatar: '👩',
      text: "Aivo Learning has been a game-changer for my son with autism. The personalized AI model understands his learning style perfectly!",
      rating: 5,
    },
    {
      name: 'David K.',
      role: 'Parent',
      avatar: '👨',
      text: 'The progress tracking is amazing. I can see exactly where my daughter excels and where she needs more support.',
      rating: 5,
    },
    {
      name: 'Emily R.',
      role: 'Parent of 3',
      avatar: '👩',
      text: 'My kids actually look forward to learning time now. The activities are engaging and perfectly adapted to their needs.',
      rating: 5,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Trial Status Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Free Trial</h1>
            <p className="text-lg text-white/90">
              {trialDaysLeft} days remaining • Upgrade anytime to continue learning
            </p>
          </div>
          <div className="text-right">
            <div className="text-6xl font-bold">{trialDaysLeft}</div>
            <div className="text-white/90">days left</div>
          </div>
        </div>
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${trialProgress}%` }}
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-200">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-neutral-900 mb-3">
            Don't Lose Your Child's Progress
          </h2>
          <p className="text-lg text-neutral-600">
            Upgrade now to keep the personalized AI model and continue your child's learning journey
          </p>
        </div>
        <div className="flex justify-center">
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg px-12 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl">
            Upgrade Now and Save 20% 🎉
          </button>
        </div>
      </div>

      {/* Pricing Plans */}
      <div>
        <h2 className="text-3xl font-bold text-neutral-900 text-center mb-3">
          Choose Your Plan
        </h2>
        <p className="text-neutral-600 text-center mb-8">
          All plans include full access to our AI-powered learning platform
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Free Trial */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-neutral-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">{features.free.name}</h3>
              <div className="flex items-end justify-center mb-1">
                <span className="text-5xl font-bold text-neutral-900">{features.free.price}</span>
              </div>
              <p className="text-neutral-600">{features.free.period}</p>
            </div>
            <ul className="space-y-3 mb-6">
              {features.free.features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm">
                  <span className={`mr-2 flex-shrink-0 ${feature.included ? 'text-green-600' : 'text-neutral-300'}`}>
                    {feature.included ? '✓' : '✗'}
                  </span>
                  <span className={feature.included ? 'text-neutral-700' : 'text-neutral-400'}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
            <button className="w-full bg-neutral-100 text-neutral-500 font-semibold py-3 rounded-xl cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* Pro */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-500 relative">
            {features.pro.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>
            )}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">{features.pro.name}</h3>
              <div className="flex items-end justify-center mb-1">
                <span className="text-5xl font-bold text-purple-600">{features.pro.price}</span>
                <span className="text-neutral-600 ml-2 mb-2">/ month</span>
              </div>
              <p className="text-neutral-600">{features.pro.period}</p>
            </div>
            <ul className="space-y-3 mb-6">
              {features.pro.features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm">
                  <span className={`mr-2 flex-shrink-0 ${feature.included ? 'text-green-600' : 'text-neutral-300'}`}>
                    {feature.included ? '✓' : '✗'}
                  </span>
                  <span className={feature.included ? 'text-neutral-700' : 'text-neutral-400'}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
            <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all">
              Upgrade to Pro
            </button>
          </div>

          {/* Premium */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-neutral-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">{features.premium.name}</h3>
              <div className="flex items-end justify-center mb-1">
                <span className="text-5xl font-bold text-neutral-900">{features.premium.price}</span>
                <span className="text-neutral-600 ml-2 mb-2">/ month</span>
              </div>
              <p className="text-neutral-600">{features.premium.period}</p>
            </div>
            <ul className="space-y-3 mb-6">
              {features.premium.features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span className="text-neutral-700">{feature.name}</span>
                </li>
              ))}
            </ul>
            <button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3 rounded-xl transition-colors">
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
        <h2 className="text-2xl font-bold text-neutral-900 text-center mb-8">
          What Parents Are Saying
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-neutral-50 rounded-xl p-6 border border-neutral-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold text-neutral-900">{testimonial.name}</p>
                  <p className="text-sm text-neutral-600">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-neutral-700 text-sm leading-relaxed">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-neutral-900 mb-2">
              What happens when my trial ends?
            </h3>
            <p className="text-neutral-600 text-sm">
              Your account will automatically switch to the free tier with limited features. Your child's progress 
              and AI model will be saved, but access to advanced features will require upgrading to a paid plan.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-2">
              Can I cancel anytime?
            </h3>
            <p className="text-neutral-600 text-sm">
              Yes! You can cancel your subscription at any time from the Billing page. Your access will continue 
              until the end of your current billing period.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-2">
              Do you offer family discounts?
            </h3>
            <p className="text-neutral-600 text-sm">
              Yes! All plans include multiple child profiles. Contact our sales team for custom family plans.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Sales */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-3">Need a Custom Plan?</h2>
        <p className="text-neutral-300 mb-6">
          Contact our team for schools, institutions, or large families
        </p>
        <button className="bg-white hover:bg-neutral-100 text-neutral-900 font-semibold px-8 py-3 rounded-xl transition-colors">
          Contact Sales Team
        </button>
      </div>
    </div>
  );
}
