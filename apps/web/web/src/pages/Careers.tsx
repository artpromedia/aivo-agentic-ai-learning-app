import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '@aivo/ui';
import {
  HeartIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

export function Careers() {
  const positions = [
    {
      title: 'Senior AI/ML Engineer',
      department: 'Engineering',
      location: 'Minneapolis, MN (Hybrid) or Remote',
      type: 'Full-time',
      description: 'Build cutting-edge AI models for personalized learning experiences.',
    },
    {
      title: 'Full Stack Engineer (React/Node)',
      department: 'Engineering',
      location: 'Minneapolis, MN (Hybrid) or Remote',
      type: 'Full-time',
      description: 'Create intuitive interfaces for parents, teachers, and students.',
    },
    {
      title: 'Special Education Curriculum Designer',
      department: 'Content',
      location: 'Remote',
      type: 'Full-time',
      description: 'Design evidence-based learning content for neurodiverse learners.',
    },
    {
      title: 'Customer Success Manager (Education)',
      department: 'Customer Success',
      location: 'Minneapolis, MN (Hybrid) or Remote',
      type: 'Full-time',
      description: 'Help schools and districts maximize their AIVO implementation.',
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      description: 'Design accessible, delightful experiences for neurodiverse children.',
    },
    {
      title: 'Data Scientist',
      department: 'Data',
      location: 'Minneapolis, MN (Hybrid) or Remote',
      type: 'Full-time',
      description: 'Analyze learning data to improve outcomes and drive product decisions.',
    },
    {
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build and maintain secure, scalable infrastructure (HIPAA/FERPA compliant).',
    },
    {
      title: 'Sales Director (K-12 EdTech)',
      department: 'Sales',
      location: 'Minneapolis, MN (Hybrid)',
      type: 'Full-time',
      description: 'Lead sales strategy for school and district partnerships.',
    },
    {
      title: 'Content Marketing Manager',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time',
      description: 'Tell our story and educate families about neurodiverse learning.',
    },
  ];

  const benefits = [
    {
      icon: <HeartIcon className="w-8 h-8" />,
      title: 'Mission-Driven',
      description: 'Work on technology that genuinely improves lives for neurodiverse children.',
    },
    {
      icon: <MapPinIcon className="w-8 h-8" />,
      title: 'Remote-First',
      description: 'Work from anywhere in the US. Optional access to our Minneapolis office.',
    },
    {
      icon: <ClockIcon className="w-8 h-8" />,
      title: 'Flexible Hours',
      description: 'Family-friendly schedule. We understand life with neurodiverse kids.',
    },
    {
      icon: <UserGroupIcon className="w-8 h-8" />,
      title: 'Competitive Comp',
      description: 'Top-tier salary, equity, health insurance, 401k, and unlimited PTO.',
    },
    {
      icon: <AcademicCapIcon className="w-8 h-8" />,
      title: 'Learning Budget',
      description: '$2,000/year for courses, conferences, and professional development.',
    },
    {
      icon: <RocketLaunchIcon className="w-8 h-8" />,
      title: 'Ground Floor',
      description: 'Join early and shape the future of special education technology.',
    },
  ];

  const hiringProcess = [
    {
      step: '1',
      title: 'Application',
      description: 'Submit your resume and a brief note about why AIVO excites you.',
    },
    {
      step: '2',
      title: 'Phone Screen',
      description: '30-minute conversation with our team to learn about you and the role.',
    },
    {
      step: '3',
      title: 'Technical/Skills Assessment',
      description: 'Role-specific exercise (take-home project or live problem-solving).',
    },
    {
      step: '4',
      title: 'Team Interviews',
      description: 'Meet 3-4 team members to dive deeper into your skills and our culture.',
    },
    {
      step: '5',
      title: 'Offer',
      description: 'We make our decision quickly. Most processes take 2-3 weeks total.',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Join Us in Transforming Education
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              We're building the future of personalized learning for neurodiverse children.
              Built by a parent, for parents—with a team that cares deeply about making a difference.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" size="lg">
                View Open Positions
              </Button>
              <Button variant="secondary" size="lg" className="bg-white/10 hover:bg-white/20 text-white">
                Learn About Our Culture
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">
            Why Work at AIVO?
          </h2>
          <p className="text-lg text-neutral-700 mb-8">
            Our founder, <strong>Ofem Ekapong Ofem</strong>, started AIVO after struggling to find the right 
            educational support for his own neurodiverse children. We're not just building software—we're 
            building a movement to ensure <em>every child</em> gets the personalized education they deserve.
          </p>
          <div className="bg-primary-50 rounded-2xl p-8 text-left">
            <p className="text-lg text-neutral-800 italic">
              "Every child we help feels personal to me. That's my kids, your kids, and thousands of families 
              who just want their children to thrive. If that mission resonates with you, we want you on our team."
            </p>
            <p className="text-sm text-neutral-600 mt-4">
              — Ofem Ekapong Ofem, Founder & CEO
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-12">
            Perks & Benefits
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="flex justify-center text-primary-600 mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-neutral-700">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-12">
            Open Positions
          </h2>
          <div className="space-y-4">
            {positions.map((position) => (
              <div
                key={position.title}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                      {position.title}
                    </h3>
                    <p className="text-neutral-700 mb-3">{position.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-neutral-600">
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">📁</span> {position.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">📍</span> {position.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">⏰</span> {position.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button variant="primary" size="md">
                      Apply Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Not seeing a fit? */}
          <div className="mt-12 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">
              Don't See a Perfect Fit?
            </h3>
            <p className="text-lg text-neutral-700 mb-6">
              We're always looking for exceptional people. Send us your resume and tell us what you're passionate about.
            </p>
            <Button variant="primary" size="lg">
              Email: careers@aivolearning.com
            </Button>
          </div>
        </div>
      </section>

      {/* Hiring Process */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-12">
            Our Hiring Process
          </h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary-200" />

            <div className="space-y-12">
              {hiringProcess.map((stage, index) => (
                <div
                  key={stage.step}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Step Number */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-primary-600 text-white rounded-full items-center justify-center font-bold text-lg z-10">
                    {stage.step}
                  </div>

                  {/* Content */}
                  <div
                    className={`md:w-5/12 bg-white rounded-lg shadow-md p-6 ${
                      index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2 md:hidden">
                      <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                        {stage.step}
                      </div>
                      <h3 className="text-xl font-semibold text-neutral-900">
                        {stage.title}
                      </h3>
                    </div>
                    <h3 className="hidden md:block text-xl font-semibold text-neutral-900 mb-2">
                      {stage.title}
                    </h3>
                    <p className="text-neutral-700">{stage.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Help us transform education for neurodiverse children everywhere.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" size="lg">
              View Open Positions
            </Button>
            <a href="mailto:careers@aivolearning.com">
              <Button variant="secondary" size="lg" className="bg-white/10 hover:bg-white/20 text-white">
                Email Us
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Careers;
