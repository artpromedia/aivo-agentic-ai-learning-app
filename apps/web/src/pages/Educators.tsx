import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '@aivo/ui';
import { CheckIcon } from '@heroicons/react/24/outline';

export function Educators() {
  const handleRequestDemo = () => {
    window.location.href = '/signup/select-role';
  };

  const painPoints = [
    {
      problem: 'You can\'t differentiate for 30 kids',
      solution: 'AIVO automatically adapts lessons to each student\'s needs. No more creating 5 versions of every assignment.',
    },
    {
      problem: 'IEP documentation takes hours',
      solution: 'Auto-generated progress reports with specific examples. Cut documentation time by 80%.',
    },
    {
      problem: 'You don\'t know what works for each child',
      solution: 'See exactly which strategies help each student. Evidence-based insights, not guesswork.',
    },
  ];

  const features = [
    {
      icon: '🎯',
      title: 'Auto-Differentiation',
      description: 'One lesson, 30 personalized versions. AIVO adapts reading level, pacing, and modality for each student.',
    },
    {
      icon: '📋',
      title: 'IEP Progress Tracking',
      description: 'Track goals automatically. Generate reports with specific examples in minutes, not hours.',
    },
    {
      icon: '🧠',
      title: 'Neurodiversity Expertise',
      description: 'Built-in strategies for ADHD, autism, dyslexia, and more. Like having a special ed consultant for every lesson.',
    },
    {
      icon: '👨‍👩‍👧',
      title: 'Parent Communication',
      description: 'Share progress with parents instantly. Automatically explain what\'s working and next steps.',
    },
    {
      icon: '⚙️',
      title: 'Easy Integration',
      description: 'Works with Google Classroom, Canvas, and Schoology. No new learning curve for students.',
    },
    {
      icon: '📊',
      title: 'Data-Driven Insights',
      description: 'See patterns across your class. Identify who needs support before they fall behind.',
    },
  ];

  const integrations = [
    'Google Classroom',
    'Canvas LMS',
    'Schoology',
    'Seesaw',
    'ClassDojo',
    'Clever',
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Special Education Teacher, Boston Public Schools',
      quote: 'AIVO gave me back 10 hours a week. I spend less time on documentation and more time actually teaching.',
      impact: '80% reduction in IEP documentation time',
    },
    {
      name: 'James Park',
      role: '3rd Grade Teacher, Oakland Unified',
      quote: 'My students with ADHD used to struggle to focus for 5 minutes. Now they engage for 20+ minutes independently.',
      impact: '4x increase in on-task time',
    },
    {
      name: 'Elena Rodriguez',
      role: 'Reading Specialist, Miami-Dade',
      quote: 'I finally have data that shows what interventions work for each child. No more guessing.',
      impact: '92% of students met IEP goals',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent-50 to-primary-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
                Empower Every Student
                <br />
                <span className="text-accent-600">Without the Overwhelm</span>
              </h1>
              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                AI-powered differentiation and documentation for special education teachers. Spend less time on paperwork, more time with students.
              </p>
              <Button variant="primary" size="lg" onClick={handleRequestDemo}>
                Request Teacher Demo
              </Button>
              <p className="mt-4 text-neutral-600">
                ✓ Free for educators • ✓ No credit card required
              </p>
            </div>
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <div className="aspect-video bg-gradient-to-br from-accent-100 to-primary-100 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">👩‍🏫</div>
                    <p className="text-lg font-semibold text-neutral-700">Teaching made easier</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              We Know Your Challenges
            </h2>
            <p className="text-xl text-neutral-600">
              Built by former special education teachers who've been there
            </p>
          </div>

          <div className="space-y-8">
            {painPoints.map((point, idx) => (
              <div key={idx} className="bg-neutral-50 rounded-2xl p-8 grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                    😓 {point.problem}
                  </h3>
                </div>
                <div className="border-l-4 border-success-500 pl-6">
                  <p className="text-success-600 font-semibold mb-2">✓ AIVO Solution:</p>
                  <p className="text-neutral-700 text-lg">
                    {point.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Everything You Need in One Platform
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Works With Tools You Already Use
            </h2>
            <p className="text-xl text-neutral-600">
              No new logins for students. Seamless integration with your LMS.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {integrations.map((integration, idx) => (
              <div key={idx} className="bg-neutral-50 rounded-xl p-8 text-center hover:bg-neutral-100 transition">
                <p className="text-lg font-semibold text-neutral-900">{integration}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Classroom Management Dashboard Preview */}
      <section className="py-20 bg-gradient-to-br from-accent-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Your Classroom Dashboard
            </h2>
            <p className="text-xl text-neutral-600">
              See every student's progress at a glance
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-2">Class-Wide View</h3>
                    <p className="text-neutral-600">See all students' progress in one dashboard</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-2">IEP Goal Tracking</h3>
                    <p className="text-neutral-600">Auto-track goals with specific evidence examples</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-2">Early Intervention Alerts</h3>
                    <p className="text-neutral-600">Get notified when a student needs support</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-2">One-Click Reports</h3>
                    <p className="text-neutral-600">Generate IEP progress reports in minutes</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💻</div>
                  <p className="text-neutral-600">Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educator Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Trusted by Educators Nationwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-gradient-to-br from-white to-neutral-50 rounded-2xl p-8 shadow-lg">
                <p className="text-neutral-700 italic mb-6 text-lg leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-neutral-200 pt-4">
                  <p className="font-bold text-neutral-900">{testimonial.name}</p>
                  <p className="text-sm text-neutral-600 mb-3">{testimonial.role}</p>
                  <p className="text-sm font-semibold text-success-600">
                    📈 {testimonial.impact}
                  </p>
                </div>
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
              Special Education Pricing
            </h2>
            <p className="text-xl text-neutral-600">
              Free for individual educators • School licenses available
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Individual Teacher */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-neutral-200">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Individual Teacher</h3>
              <div className="text-4xl font-bold text-accent-600 mb-4">Free</div>
              <p className="text-neutral-600 mb-6">For educators using AIVO in their classroom</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">Up to 35 students</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">Full differentiation engine</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">IEP progress tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">Parent communication tools</span>
                </li>
              </ul>

              <Button variant="primary" size="lg" onClick={handleRequestDemo} className="w-full">
                Start Free Account
              </Button>
            </div>

            {/* School License */}
            <div className="bg-gradient-to-br from-accent-600 to-primary-600 rounded-3xl shadow-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">School License</h3>
              <div className="text-4xl font-bold mb-4">Custom</div>
              <p className="text-accent-100 mb-6">For schools and districts</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-accent-200 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Unlimited students</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-accent-200 flex-shrink-0 mt-0.5" />
                  <span className="text-white">District-wide insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-accent-200 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Professional development</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-accent-200 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Dedicated support</span>
                </li>
              </ul>

              <Button
                variant="primary"
                size="lg"
                onClick={handleRequestDemo}
                className="w-full bg-white text-accent-600 hover:bg-neutral-50"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-accent-600 to-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Classroom?
          </h2>
          <p className="text-xl text-accent-100 mb-10">
            Join thousands of educators who are spending less time on paperwork and more time teaching
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={handleRequestDemo}
            className="bg-white text-accent-600 hover:bg-neutral-50"
          >
            Request Your Free Demo
          </Button>
          <p className="mt-4 text-accent-100">Free for educators • Set up in 5 minutes</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
