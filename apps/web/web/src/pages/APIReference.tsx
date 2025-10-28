import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '@aivo/ui';
import { useState } from 'react';
import {
  CodeBracketIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  BoltIcon,
  CheckCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

export function APIReference() {
  const [activeTab, setActiveTab] = useState('authentication');
  const [activeLanguage, setActiveLanguage] = useState('javascript');
  const [openEndpoint, setOpenEndpoint] = useState<number | null>(null);

  const handleGetAPIKey = () => {
    window.location.href = '/signup/select-role';
  };

  const apiBadges = [
    'REST API',
    'JSON',
    'OAuth 2.0',
    'Webhook Events',
  ];

  const coreEndpoints = [
    {
      method: 'POST',
      path: '/v1/students',
      description: 'Create a new student profile',
      params: ['name', 'age', 'grade', 'diagnoses'],
    },
    {
      method: 'GET',
      path: '/v1/students/{id}',
      description: 'Get student profile and progress',
      params: ['id'],
    },
    {
      method: 'POST',
      path: '/v1/assessments',
      description: 'Create and start a baseline assessment',
      params: ['student_id', 'assessment_type'],
    },
    {
      method: 'GET',
      path: '/v1/assessments/{id}/results',
      description: 'Get assessment results and AI insights',
      params: ['id'],
    },
    {
      method: 'POST',
      path: '/v1/lessons',
      description: 'Generate a personalized lesson',
      params: ['student_id', 'subject', 'topic', 'difficulty'],
    },
    {
      method: 'GET',
      path: '/v1/progress/{student_id}',
      description: 'Get detailed progress tracking',
      params: ['student_id', 'start_date', 'end_date'],
    },
  ];

  const sdks = [
    {
      language: 'JavaScript / Node.js',
      install: 'npm install @aivo/sdk',
      link: '#',
    },
    {
      language: 'Python',
      install: 'pip install aivo-sdk',
      link: '#',
    },
    {
      language: 'Ruby',
      install: 'gem install aivo-sdk',
      link: '#',
    },
  ];

  const useCases = [
    {
      icon: '🏫',
      title: 'LMS Integration',
      description: 'Sync student rosters, push assignments, and pull progress data into your learning management system.',
    },
    {
      icon: '📊',
      title: 'Custom Reporting',
      description: 'Build custom dashboards and reports using AIVO progress data and AI insights.',
    },
    {
      icon: '🔔',
      title: 'Real-Time Notifications',
      description: 'Subscribe to webhook events for student progress milestones, assessment completions, and alerts.',
    },
  ];

  const errorCodes = [
    { code: '200', meaning: 'OK - Request successful' },
    { code: '201', meaning: 'Created - Resource created successfully' },
    { code: '400', meaning: 'Bad Request - Invalid parameters' },
    { code: '401', meaning: 'Unauthorized - Invalid API key' },
    { code: '403', meaning: 'Forbidden - Insufficient permissions' },
    { code: '404', meaning: 'Not Found - Resource does not exist' },
    { code: '429', meaning: 'Too Many Requests - Rate limit exceeded' },
    { code: '500', meaning: 'Internal Server Error - Contact support' },
  ];

  const codeExamples = {
    javascript: `// Initialize the AIVO SDK
import { Aivo } from '@aivo/sdk';

const aivo = new Aivo({
  apiKey: 'your_api_key_here'
});

// Create a student profile
const student = await aivo.students.create({
  name: 'Emma Johnson',
  age: 8,
  grade: 3,
  diagnoses: ['ADHD', 'Dyslexia']
});

// Start a baseline assessment
const assessment = await aivo.assessments.create({
  studentId: student.id,
  assessmentType: 'comprehensive'
});

// Get progress data
const progress = await aivo.progress.get(student.id, {
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

console.log(progress);`,
    python: `# Initialize the AIVO SDK
from aivo import Aivo

aivo = Aivo(api_key='your_api_key_here')

# Create a student profile
student = aivo.students.create(
    name='Emma Johnson',
    age=8,
    grade=3,
    diagnoses=['ADHD', 'Dyslexia']
)

# Start a baseline assessment
assessment = aivo.assessments.create(
    student_id=student.id,
    assessment_type='comprehensive'
)

# Get progress data
progress = aivo.progress.get(
    student.id,
    start_date='2024-01-01',
    end_date='2024-01-31'
)

print(progress)`,
    curl: `# Create a student profile
curl -X POST https://api.aivo.ai/v1/students \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Emma Johnson",
    "age": 8,
    "grade": 3,
    "diagnoses": ["ADHD", "Dyslexia"]
  }'

# Get progress data
curl -X GET "https://api.aivo.ai/v1/progress/student_123?start_date=2024-01-01&end_date=2024-01-31" \\
  -H "Authorization: Bearer your_api_key_here"`,
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-20 lg:py-32 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                AIVO API
                <br />
                <span className="text-primary-400">Reference</span>
              </h1>
              <p className="text-xl text-neutral-300 mb-8 leading-relaxed">
                Build powerful integrations with AIVO&apos;s RESTful API. Access student progress, create assessments, and leverage AI-powered personalization.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {apiBadges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="bg-primary-500/20 text-primary-300 px-4 py-2 rounded-full text-sm font-semibold border border-primary-500/30"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <Button variant="primary" size="lg" onClick={handleGetAPIKey}>
                Get API Key
              </Button>
            </div>
            <div className="relative">
              <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700 shadow-2xl">
                <pre className="text-sm text-neutral-300 overflow-x-auto">
                  <code>{`GET /v1/students/12345

{
  "id": "12345",
  "name": "Emma Johnson",
  "progress": {
    "reading": 85,
    "math": 78
  },
  "ai_model": "optimized",
  "learning_style": "visual"
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-20 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Quick Start
            </h2>
            <p className="text-xl text-neutral-400">
              Get started with AIVO API in 3 steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-neutral-800 rounded-2xl p-8 border border-neutral-700">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary-400">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Get API Key</h3>
              <p className="text-neutral-400 mb-4">
                Sign up for a free account and generate your API key from the developer dashboard.
              </p>
              <code className="text-sm text-primary-400 bg-neutral-900 px-3 py-1 rounded">
                Authorization: Bearer your_api_key
              </code>
            </div>

            <div className="bg-neutral-800 rounded-2xl p-8 border border-neutral-700">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary-400">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Install SDK</h3>
              <p className="text-neutral-400 mb-4">
                Install the official SDK for your language of choice.
              </p>
              <code className="text-sm text-primary-400 bg-neutral-900 px-3 py-1 rounded block">
                npm install @aivo/sdk
              </code>
            </div>

            <div className="bg-neutral-800 rounded-2xl p-8 border border-neutral-700">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary-400">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Make First Request</h3>
              <p className="text-neutral-400 mb-4">
                Start making API calls to create students, run assessments, and track progress.
              </p>
              <code className="text-sm text-primary-400 bg-neutral-900 px-3 py-1 rounded">
                aivo.students.create()
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-20 bg-neutral-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Code Examples
            </h2>
          </div>

          {/* Language Tabs */}
          <div className="flex gap-2 mb-6 justify-center">
            {['javascript', 'python', 'curl'].map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLanguage(lang)}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  activeLanguage === lang
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                {lang === 'javascript' ? 'JavaScript' : lang === 'python' ? 'Python' : 'cURL'}
              </button>
            ))}
          </div>

          <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-700">
            <pre className="text-sm text-neutral-300 overflow-x-auto">
              <code>{codeExamples[activeLanguage as keyof typeof codeExamples]}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Core Endpoints */}
      <section className="py-20 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Core Endpoints
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {coreEndpoints.map((endpoint, idx) => (
              <div key={idx} className="bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700">
                <button
                  onClick={() => setOpenEndpoint(openEndpoint === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-700/50 transition"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded text-sm font-bold ${
                        endpoint.method === 'GET'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-success-500/20 text-success-400'
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <code className="text-primary-400">{endpoint.path}</code>
                  </div>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-neutral-400 transition-transform ${
                      openEndpoint === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openEndpoint === idx && (
                  <div className="px-6 pb-4 border-t border-neutral-700 pt-4">
                    <p className="text-neutral-300 mb-4">{endpoint.description}</p>
                    <div className="bg-neutral-900 rounded-lg p-4">
                      <p className="text-sm font-semibold text-neutral-400 mb-2">Parameters:</p>
                      <ul className="space-y-1">
                        {endpoint.params.map((param, i) => (
                          <li key={i} className="text-sm text-primary-400">
                            <code>{param}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDKs */}
      <section className="py-20 bg-neutral-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Official SDKs
            </h2>
            <p className="text-xl text-neutral-400">
              Pre-built libraries for popular languages
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {sdks.map((sdk, idx) => (
              <div key={idx} className="bg-neutral-800 rounded-2xl p-8 border border-neutral-700">
                <CodeBracketIcon className="w-12 h-12 text-primary-400 mb-4" />
                <h3 className="text-xl font-bold mb-3">{sdk.language}</h3>
                <code className="text-sm text-primary-400 bg-neutral-900 px-3 py-2 rounded block mb-4">
                  {sdk.install}
                </code>
                <a href={sdk.link} className="text-primary-400 hover:text-primary-300 text-sm font-semibold">
                  View Documentation →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Common Use Cases
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, idx) => (
              <div key={idx} className="bg-neutral-800 rounded-2xl p-8 border border-neutral-700">
                <div className="text-5xl mb-4">{useCase.icon}</div>
                <h3 className="text-xl font-bold mb-3">{useCase.title}</h3>
                <p className="text-neutral-400 leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="py-20 bg-neutral-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Rate Limits
            </h2>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-8 border border-neutral-700">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary-400 mb-2">1,000</div>
                <p className="text-neutral-400">Requests per hour</p>
                <p className="text-sm text-neutral-500 mt-2">Free Tier</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-400 mb-2">10,000</div>
                <p className="text-neutral-400">Requests per hour</p>
                <p className="text-sm text-neutral-500 mt-2">Pro Tier</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-400 mb-2">Unlimited</div>
                <p className="text-neutral-400">Custom rate limits</p>
                <p className="text-sm text-neutral-500 mt-2">Enterprise Tier</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Error Codes */}
      <section className="py-20 bg-neutral-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              HTTP Status Codes
            </h2>
          </div>

          <div className="bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-700">
            <table className="w-full">
              <thead className="bg-neutral-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-400">Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-400">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {errorCodes.map((error, idx) => (
                  <tr key={idx} className="border-t border-neutral-700">
                    <td className="px-6 py-4">
                      <code className="text-primary-400 font-mono">{error.code}</code>
                    </td>
                    <td className="px-6 py-4 text-neutral-300">{error.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Developer Support */}
      <section className="py-20 bg-gradient-to-br from-primary-900 to-accent-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Need Developer Support?
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Our developer relations team is here to help you build amazing integrations
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGetAPIKey}
              className="bg-white text-primary-900 hover:bg-neutral-50"
            >
              Get API Key
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => window.location.href = 'mailto:developers@aivo.ai'}
              className="bg-neutral-800 text-white hover:bg-neutral-700 border-neutral-700"
            >
              Contact Developer Support
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
