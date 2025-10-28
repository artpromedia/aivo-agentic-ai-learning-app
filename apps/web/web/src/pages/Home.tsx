import { Button, Card, Grid } from '@aivo/ui';

export default function Home() {
  const handleGetStarted = () => {
    // Redirect to parent portal enrollment wizard
    window.location.href = 'http://localhost:3001/signup/parent';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold text-primary-600">Aivo Learning</h1>
          <div className="space-x-4">
            <a href="/about" className="text-gray-700 hover:text-primary-600">About</a>
            <a href="/features" className="text-gray-700 hover:text-primary-600">Features</a>
            <a href="/contact" className="text-gray-700 hover:text-primary-600">Contact</a>
          </div>
        </nav>
        
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Personalized Learning for Every Child
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered special education platform designed for neurodiverse learners
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted}>Get Started</Button>
            <Button size="lg" variant="outline">Watch Demo</Button>
          </div>
        </div>
      </header>

      {/* Explainable AI Section - NEW */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl my-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              ✨ New: Transparent AI Personalization
            </div>
            <h3 className="text-4xl font-bold text-neutral-900 mb-4">
              Your Child's AI Brain - Fully Explained
            </h3>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              We believe parents deserve complete transparency. See exactly how we create your child's personalized learning model, what data we use, and why.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl mb-3">🔍</div>
              <h4 className="text-xl font-semibold text-neutral-900 mb-2">Full Transparency</h4>
              <p className="text-neutral-600">
                Watch in real-time as we build your child's personalized AI model. Every step explained in plain language.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl mb-3">🔒</div>
              <h4 className="text-xl font-semibold text-neutral-900 mb-2">Privacy First</h4>
              <p className="text-neutral-600">
                FERPA & COPPA compliant. Your consent required. Complete audit trail. Your data, your control.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl mb-3">✍️</div>
              <h4 className="text-xl font-semibold text-neutral-900 mb-2">Parent Control</h4>
              <p className="text-neutral-600">
                Correct baseline assessments, adjust privacy settings, and request model deletion anytime.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="text-xl font-semibold text-neutral-900 mb-2">Model Documentation</h4>
              <p className="text-neutral-600">
                Receive a complete "Model Card" explaining your child's AI, including strengths and areas of focus.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-2xl text-center">
            <h4 className="text-2xl font-bold mb-3">See How It Works</h4>
            <p className="mb-6 text-purple-100">
              After enrollment, you'll be guided through our transparent AI personalization process
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handleGetStarted}
            >
              Start Your Journey →
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12 text-neutral-900">Why Choose Aivo?</h3>
        <Grid cols="3" gap="lg">
          <Card padding="lg" hover icon={<span className="text-3xl">🎯</span>} iconColor="bg-primary-100" title="Personalized AI">
            <p className="text-neutral-600">
              Adaptive learning models tailored to each child&apos;s unique needs and learning style
            </p>
          </Card>
          <Card padding="lg" hover icon={<span className="text-3xl">👨‍👩‍👧</span>} iconColor="bg-reading-100" title="Parent Dashboard">
            <p className="text-neutral-600">
              Track progress, view insights, and stay connected with your child&apos;s journey
            </p>
          </Card>
          <Card padding="lg" hover icon={<span className="text-3xl">👩‍🏫</span>} iconColor="bg-math-100" title="Teacher Tools">
            <p className="text-neutral-600">
              Comprehensive tools for IEP management and individualized lesson planning
            </p>
          </Card>
        </Grid>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Learning?</h3>
          <p className="text-xl mb-8">Join thousands of families empowering their children</p>
          <Button size="lg" variant="secondary" onClick={handleGetStarted}>
            Start Free Trial
          </Button>
        </div>
      </section>
    </div>
  );
}
