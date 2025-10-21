import { Button, Card, Grid } from '@aivo/ui';

export default function Home() {
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
            <Button size="lg">Get Started</Button>
            <Button size="lg" variant="outline">Watch Demo</Button>
          </div>
        </div>
      </header>

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
          <Button size="lg" variant="secondary">Start Free Trial</Button>
        </div>
      </section>
    </div>
  );
}
