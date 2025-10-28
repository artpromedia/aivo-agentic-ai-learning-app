import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '@aivo/ui';
import {
  AcademicCapIcon,
  HeartIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function About() {
  const handleStartAssessment = () => {
    window.location.href = '/signup/select-role';
  };

  const values = [
    {
      icon: HeartIcon,
      title: 'Child-First, Always',
      description: 'Jayden and Jason taught me: If it\'s not good for the child, it doesn\'t matter. Every decision starts with: "Would this help a kid like mine?"',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Transparency in AI',
      description: 'Parents deserve to understand how AI learns about their child. I explain every recommendation, every adaptation. No black boxes, no secrets.',
    },
    {
      icon: AcademicCapIcon,
      title: 'Evidence-Based',
      description: 'Grounded in neuroscience, special education research, and real-world testing. Continuous improvement through data and feedback.',
    },
    {
      icon: UserGroupIcon,
      title: 'Accessibility for All',
      description: 'Affordable for families. Scholarships available—cost should never be a barrier. Works in under-resourced schools.',
    },
  ];

  const advisoryBoard = [
    {
      name: 'Dr. Ike Osuji, MD',
      title: 'Advisory Board Chair',
      subtitle: 'Family Physician & Doctor of Internal Medicine',
      icon: '⚕️',
      credentials: [
        'Board Certified Family Physician',
        'Doctor of Internal Medicine',
        'Specialization in Pediatric Development',
        'ADHD & Autism Medical Management Expert',
      ],
      contributions: [
        'Medical review of learning protocols',
        'Child development milestone integration',
        'Health and wellness safeguards',
        'Coordination with medical care providers',
        'Family medicine perspective on neurodiversity',
      ],
      quote: 'As a family physician, I see the whole child—not just their diagnosis. AIVO\'s personalized approach aligns with how I practice medicine: treating the individual, understanding their unique needs, and supporting their growth holistically.',
      color: 'primary',
    },
    {
      name: 'Dr. Patrick Ukata, PhD',
      title: 'Professor of International Studies',
      subtitle: 'Johns Hopkins University',
      icon: '🎓',
      credentials: [
        'PhD in International Studies',
        'Professor at Johns Hopkins University (20+ years)',
        'Published Educational Researcher',
        'International Education Policy Expert',
        'Curriculum Development Specialist',
      ],
      contributions: [
        'Curriculum design and academic rigor',
        'Learning outcomes assessment',
        'International education standards',
        'Pedagogical best practices',
        'Content quality assurance',
      ],
      quote: 'In 20 years of teaching, I\'ve learned that the best education is personalized education. Traditional classrooms struggle to serve neurodiverse learners—not because these students can\'t learn, but because the system can\'t adapt.',
      color: 'accent',
    },
    {
      name: 'Edward Hamilton',
      title: '9/11 Veteran, NYPD',
      subtitle: 'Special Education Specialist',
      icon: '🛡️',
      credentials: [
        'NYPD 9/11 Veteran (Honorable Service)',
        'Special Education Specialist',
        '25+ years of experience in special education',
        'Crisis response and child safety expert',
        'Community advocate for neurodiverse children',
      ],
      contributions: [
        'Special education best practices and compliance',
        'IEP development and implementation guidance',
        'Student safety and well-being protocols',
        'Real-world classroom and home learning insights',
        'Community outreach and family support perspective',
      ],
      quote: 'After 9/11 and my years in the NYPD, I dedicated my life to serving vulnerable populations—especially neurodiverse children who need advocates. AIVO represents hope for families I\'ve worked with for 25 years.',
      color: 'success',
    },
    {
      name: 'Nnamdi Uzokwe',
      title: 'US Navy Veteran',
      subtitle: 'Medical Device Executive | Serial Entrepreneur',
      icon: '⚓',
      credentials: [
        'US Navy Veteran (Honorable Service)',
        '30+ years entrepreneurial experience',
        'Top-tier medical device sales executive',
        'Successfully built and scaled multiple businesses',
        'Deep network in healthcare and education',
      ],
      contributions: [
        'Go-to-market strategy and scaling',
        'Healthcare and school district partnerships',
        'Operational excellence and efficiency',
        'Strategic business development',
        'Medical device industry connections',
      ],
      quote: 'In the military, we have a saying: "No soldier left behind." The same principle should apply to education—no child left behind because the system can\'t meet their needs.',
      color: 'purple',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-accent-600 text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Built by a Parent,
            <br />
            For Parents
          </h1>
          <p className="text-xl text-primary-100 mb-10 max-w-3xl mx-auto">
            AIVO exists because two brothers—Jayden and Jason Ofem—deserved learning that understood how their brains work.
          </p>
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <p className="text-white text-lg font-semibold">
              Founded by Ofem Ekapong Ofem
            </p>
            <p className="text-primary-100 text-sm">
              Data Scientist with 12+ years AI experience & Father of Jayden and Jason
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-8 text-center">
            Why AIVO Exists: The Jayden & Jason Story
          </h2>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-neutral-700 mb-8 leading-relaxed">
              AIVO wasn&apos;t born from market research or venture capital meetings. It was born from desperation, determination, and unconditional love for two extraordinary boys.
            </p>

            <h3 className="text-3xl font-bold text-neutral-900 mb-4">The Kitchen Table Moment</h3>
            <p className="text-neutral-700 mb-6">
              Picture a Tuesday evening. Homework time. Jason (then 12, 7th grade) is in tears over a reading assignment. Jayden (then 9, 4th grade) has shut down completely after a sensory overload at school. Two brilliant boys, two different diagnoses—ADHD and dyslexia for Jason, autism for Jayden—and a one-size-fits-all education system that worked for neither.
            </p>
            <p className="text-neutral-700 mb-6">
              As a data scientist with over 12 years of experience in AI and data analytics, I had built complex machine learning systems for Fortune 500 companies. But I couldn&apos;t build something to help my own sons learn.
            </p>
            <p className="text-neutral-700 mb-8">
              That Tuesday night, exhausted and heartbroken, I asked myself: &apos;What if I could build an AI tutor that actually learned how Jayden and Jason learn? Not how textbooks say they should learn, but how their brains actually work?&apos;
            </p>

            <h3 className="text-3xl font-bold text-neutral-900 mb-4">The Question That Changed Everything</h3>
            <p className="text-neutral-700 mb-8">
              I had the technical skills—12+ years in full-stack AI development, deep expertise in data analytics and machine learning. But more importantly, I had the desperate motivation of a father watching his brilliant sons struggle.
            </p>

            <h3 className="text-3xl font-bold text-neutral-900 mb-4">Building AIVO With My Boys</h3>
            <p className="text-neutral-700 mb-4">
              Jayden and Jason became my first users. Every algorithm I wrote, every feature I built, was tested at our kitchen table:
            </p>
            <ul className="space-y-2 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="w-6 h-6 text-success-500 flex-shrink-0 mt-1" />
                <span className="text-neutral-700">Did the visual schedule help Jayden feel less anxious?</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="w-6 h-6 text-success-500 flex-shrink-0 mt-1" />
                <span className="text-neutral-700">Did the focus timer keep Jason on track?</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="w-6 h-6 text-success-500 flex-shrink-0 mt-1" />
                <span className="text-neutral-700">Did the text-to-speech reduce reading frustration?</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="w-6 h-6 text-success-500 flex-shrink-0 mt-1" />
                <span className="text-neutral-700">Did the AI adapt fast enough when they got bored or stuck?</span>
              </li>
            </ul>
            <p className="text-neutral-700 mb-8">
              I failed a lot. The first versions were terrible. But Jayden and Jason gave me honest feedback (brutally honest—kids don&apos;t sugarcoat). I iterated. I improved. I never compromised on what they needed.
            </p>

            <h3 className="text-3xl font-bold text-neutral-900 mb-4">The First Time It Clicked</h3>
            <p className="text-neutral-700 mb-6">
              Three months into development, Jason finished an entire lesson. Independently. No tears. No meltdowns. He looked up and said: &apos;Can I do another one?&apos;
            </p>
            <p className="text-neutral-700 mb-6 italic font-semibold">
              I cried.
            </p>
            <p className="text-neutral-700 mb-8">
              A week later, Jayden used AIVO for 30 straight minutes—the longest he&apos;d ever engaged with academic content without a break. He was calm. Focused. Learning.
            </p>
            <p className="text-neutral-700 mb-8">
              That&apos;s when I knew: If this could work for Jayden and Jason, it could work for thousands of kids just like them.
            </p>

            <h3 className="text-3xl font-bold text-neutral-900 mb-4">From Two Boys to Successful Pilot Program</h3>
            <p className="text-neutral-700 mb-6">
              Today, AIVO is helping over 350 neurodiverse children across 12 schools in our pilot program. But it started with two.
            </p>
            <p className="text-neutral-700 mb-8">
              Every child who uses AIVO gets the same thing Jayden and Jason get: a personal AI learning companion that learns how THEY learn. That adapts to THEIR attention span. That accommodates THEIR sensory needs. That celebrates THEIR progress.
            </p>

            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-8 my-12">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Where We Are Now</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h4 className="text-xl font-bold text-primary-600 mb-3">Jason (now 14, 9th grade)</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">Reading at grade level (up from 2 years behind)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">Completing homework independently</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">Advocating for himself at school</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">Talking about college</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h4 className="text-xl font-bold text-accent-600 mb-3">Jayden (now 11, 6th grade)</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">Engaging with lessons for 45+ minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">Managing sensory needs with AIVO&apos;s accommodations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">Thriving in math (his favorite subject)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">More confident, less overwhelmed</span>
                    </li>
                  </ul>
                </div>
              </div>

              <p className="text-neutral-700 mt-6 italic">
                Are they &apos;fixed&apos;? No. They&apos;re not broken. They never were.
              </p>
              <p className="text-neutral-700 font-semibold">
                But they&apos;re learning. They&apos;re confident. They believe in themselves. And that&apos;s everything.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Our Mission & Values
            </h2>
            <p className="text-2xl text-primary-600 font-semibold max-w-3xl mx-auto">
              Every neurodiverse child deserves learning that adapts to them—not the other way around.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg">
                <value.icon className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">👨‍💻</div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
                Ofem Ekapong Ofem
              </h2>
              <p className="text-xl text-primary-600 font-semibold mb-4">
                Founder & Chief Technology Officer (CTO)
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Background</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">Father of Jason (14, 9th grade) and Jayden (11, 6th grade)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">Data Scientist with 12+ years of full-stack AI and data analytics experience</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">Expert in machine learning, personalized recommendation systems, and educational technology</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">Former AI architect for Fortune 500 companies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">Built AIVO&apos;s core AI personalization engine from scratch</span>
                  </li>
                </ul>
              </div>

              <div className="bg-primary-50 rounded-xl p-6">
                <p className="text-neutral-700 italic text-lg mb-4">
                  &quot;I&apos;ve built AI systems for billion-dollar companies, but nothing has been more important than building one that helps my sons learn. Every algorithm in AIVO was tested on Jayden and Jason first. If it doesn&apos;t work for them, it doesn&apos;t go into the product.&quot;
                </p>
                <p className="text-neutral-600 text-sm">
                  — Ofem Ekapong Ofem, Founder & CTO
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Technical Expertise</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="font-semibold text-neutral-900 mb-2">Machine Learning & AI</p>
                    <p className="text-sm text-neutral-600">Architecture, personalized systems, predictive modeling</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="font-semibold text-neutral-900 mb-2">Full-Stack Development</p>
                    <p className="text-sm text-neutral-600">Python, TypeScript, React, Node.js</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="font-semibold text-neutral-900 mb-2">Data Analytics</p>
                    <p className="text-sm text-neutral-600">Big data processing, insights generation</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="font-semibold text-neutral-900 mb-2">EdTech Innovation</p>
                    <p className="text-sm text-neutral-600">Personalized learning algorithms, accessibility</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advisory Board */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Guided by Leading Experts
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Our Advisory Board brings together leaders in medicine, education, special education, and business to ensure AIVO serves families safely, effectively, and at scale.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {advisoryBoard.map((advisor, idx) => (
              <div key={idx} className="bg-gradient-to-br from-neutral-50 to-white rounded-2xl p-8 shadow-lg border-2 border-neutral-200">
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-5xl">{advisor.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-neutral-900">{advisor.name}</h3>
                    <p className="text-lg text-primary-600 font-semibold">{advisor.title}</p>
                    <p className="text-neutral-600">{advisor.subtitle}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-neutral-900 mb-3">Credentials:</h4>
                  <ul className="space-y-2">
                    {advisor.credentials.map((cred, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircleIcon className={`w-5 h-5 text-${advisor.color}-500 flex-shrink-0 mt-0.5`} />
                        <span className="text-sm text-neutral-700">{cred}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-neutral-900 mb-3">Key Contributions:</h4>
                  <ul className="space-y-2">
                    {advisor.contributions.slice(0, 3).map((contrib, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary-600">•</span>
                        <span className="text-sm text-neutral-700">{contrib}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`bg-${advisor.color}-50 rounded-xl p-4`}>
                  <p className="text-neutral-700 italic text-sm mb-2">
                    &quot;{advisor.quote}&quot;
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
              Why This Team?
            </h3>
            <p className="text-neutral-700 mb-6 text-center max-w-3xl mx-auto">
              &quot;I didn&apos;t want to build AIVO alone. These advisors bring expertise I don&apos;t have: Medical knowledge to ensure we&apos;re supporting the whole child. Educational expertise to ensure academic rigor. Special education frontline experience. Business acumen to ensure we can scale and reach every family who needs us.&quot;
            </p>
            <p className="text-neutral-600 text-sm text-center italic">
              — Ofem Ekapong Ofem, Founder & CTO
            </p>

            <div className="grid md:grid-cols-4 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl mb-2">⚕️</div>
                <p className="font-semibold text-neutral-900">Medical</p>
                <p className="text-sm text-neutral-600">Holistic child health</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎓</div>
                <p className="font-semibold text-neutral-900">Educational</p>
                <p className="text-sm text-neutral-600">Academic excellence</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🛡️</div>
                <p className="font-semibold text-neutral-900">Special Ed</p>
                <p className="text-sm text-neutral-600">25+ years frontline</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">⚓</div>
                <p className="font-semibold text-neutral-900">Business</p>
                <p className="text-sm text-neutral-600">Strategic growth</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Our Partnership
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border-2 border-primary-200">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-neutral-900 mb-4">
                Rewired for Autism
              </h3>
              <p className="text-lg text-neutral-600">
                AIVO is proud to partner with Rewired for Autism, a leading organization dedicated to supporting families and individuals affected by autism through innovative programs, resources, and community support.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-xl font-bold text-neutral-900 mb-4">About Rewired for Autism</h4>
                <p className="text-neutral-700 mb-4">
                  Rewired for Autism provides comprehensive support services, educational resources, and advocacy for the autism community. Their mission aligns perfectly with AIVO&apos;s commitment to empowering neurodiverse learners.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-bold text-neutral-900 mb-4">What This Partnership Means</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">Collaborative resources for autism families</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">Shared expertise in autism-friendly learning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">Community outreach and family support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">Evidence-based autism education approaches</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <a
                href="https://rewiredforautism.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-lg"
              >
                Learn More at rewiredforautism.org
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-neutral-600 mb-4">
              Interested in partnering with AIVO to serve neurodiverse learners?
            </p>
            <a
              href="mailto:partnerships@aivolearning.com"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              partnerships@aivolearning.com
            </a>
          </div>
        </div>
      </section>

      {/* The Invitation */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-accent-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              The Invitation
            </h2>
            <div className="prose prose-lg max-w-none text-white">
              <p className="text-xl text-primary-100 mb-6">
                Every child is someone&apos;s Jayden or Jason. If you&apos;re a parent who&apos;s had that kitchen table moment—exhausted, heartbroken, desperate for something that works—I built AIVO for you.
              </p>
              <p className="text-xl text-primary-100 mb-6">
                If you&apos;re an educator who sees potential in every student but doesn&apos;t have the tools to unlock it—I built AIVO for you.
              </p>
              <p className="text-xl text-primary-100 mb-10">
                If you&apos;re a researcher, advisor, or partner who believes neurodiverse children deserve better—join us.
              </p>
            </div>
            <p className="text-lg text-primary-100 italic mb-8">
              — Ofem Ekapong Ofem, Founder & CTO
            </p>
          </div>

          <div className="text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartAssessment}
              className="bg-white text-primary-600 hover:bg-neutral-50"
            >
              See If AIVO Can Help Your Child
            </Button>
            <p className="mt-4 text-primary-100 text-sm">
              No credit card required • See results in minutes
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
