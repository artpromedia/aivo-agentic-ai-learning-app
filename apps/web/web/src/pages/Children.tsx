import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '@aivo/ui';
import { CheckIcon } from '@heroicons/react/24/solid';

export function Children() {
  const handleStartAssessment = () => {
    window.location.href = '/signup/select-role';
  };

  const features = [
    {
      icon: '🎨',
      title: 'Sensory-Friendly Design',
      description: 'Adjustable colors, sounds, and animations. Reduces overwhelm with calm, predictable layouts.',
    },
    {
      icon: '⏱️',
      title: 'ADHD Focus Support',
      description: 'Built-in timers and break reminders. One thing at a time approach. Gamified progress tracking.',
    },
    {
      icon: '📅',
      title: 'Autism-Friendly Routines',
      description: 'Predictable structure and visual schedules. Clear expectations and social stories. Minimal surprises.',
    },
    {
      icon: '📖',
      title: 'Dyslexia Reading Tools',
      description: 'Dyslexia-friendly fonts (OpenDyslexic). Text-to-speech for every word. Adjustable line spacing.',
    },
    {
      icon: '🎭',
      title: 'Multi-Sensory Learning',
      description: 'See it, hear it, touch it, do it. Visual + auditory + kinesthetic. Perfect for all learning styles.',
    },
    {
      icon: '💚',
      title: 'Emotional Regulation',
      description: 'AI detects frustration levels. Offers calming breaks automatically. Celebrates small wins.',
    },
  ];

  const adaptations = [
    {
      title: 'For Autism',
      items: ['Visual schedules', 'Predictable routines', 'Social-emotional learning'],
    },
    {
      title: 'For ADHD',
      items: ['Focus timers', 'Task breakdown', 'Movement breaks'],
    },
    {
      title: 'For Dyslexia',
      items: ['Text-to-speech', 'Special fonts', 'Multi-sensory reading'],
    },
  ];

  const testimonials = [
    {
      name: 'Emma',
      age: 9,
      quote: 'AIVO makes learning fun! I love when it shows me pictures and lets me take breaks.',
      color: 'purple',
    },
    {
      name: 'Marcus',
      age: 11,
      quote: 'The timer helps me focus. I can do one thing at a time and I\'m getting better at math!',
      color: 'blue',
    },
    {
      name: 'Lily',
      age: 8,
      quote: 'I like that AIVO reads to me. The words don\'t jump around anymore.',
      color: 'green',
    },
  ];

  const parentQuotes = [
    {
      name: 'Sarah M.',
      quote: 'My daughter went from hating homework to asking for "AIVO time." It\'s incredible to see her confidence grow.',
    },
    {
      name: 'James T.',
      quote: 'Finally, something that works with my son\'s ADHD instead of against it. He can actually focus now.',
    },
    {
      name: 'Maria R.',
      quote: 'As a parent of a child with autism, seeing predictable routines built into the learning is a game-changer.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
                Learning That Understands
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  Your Brain
                </span>
              </h1>
              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                Every neurodiverse child deserves an AI companion that adapts to how they learn best—whether you have autism, ADHD, dyslexia, or think differently.
              </p>
              <Button variant="primary" size="lg" onClick={handleStartAssessment}>
                Try Free Assessment
              </Button>
            </div>
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-purple-200">
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🌟</div>
                    <p className="text-lg font-semibold text-neutral-700">Diverse learners, one platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              How AIVO Helps You Learn
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Every feature is designed with neurodiversity in mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-white to-neutral-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-neutral-100"
              >
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

      {/* How It Adapts */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Adapts to Your Unique Needs
            </h2>
            <p className="text-xl text-neutral-600">
              AIVO personalizes learning for different ways of thinking
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {adaptations.map((adaptation, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-neutral-900 mb-6">
                  {adaptation.title}
                </h3>
                <ul className="space-y-3">
                  {adaptation.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              What Kids Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br from-${testimonial.color}-50 to-${testimonial.color}-100 rounded-2xl p-8 shadow-lg`}
              >
                <div className="text-6xl mb-4">😊</div>
                <p className="text-lg text-neutral-700 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <p className="font-bold text-neutral-900">
                  {testimonial.name}, age {testimonial.age}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parent Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              What Parents Say About AIVO
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {parentQuotes.map((parent, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg">
                <p className="text-neutral-700 mb-4 italic leading-relaxed">
                  "{parent.quote}"
                </p>
                <p className="font-bold text-primary-600">— {parent.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to See Your Child Thrive?
          </h2>
          <p className="text-xl text-purple-100 mb-10">
            Start with a free assessment to see how AIVO can help your child learn better
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartAssessment}
            className="bg-white text-purple-600 hover:bg-neutral-50"
          >
            Start Free Assessment
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
