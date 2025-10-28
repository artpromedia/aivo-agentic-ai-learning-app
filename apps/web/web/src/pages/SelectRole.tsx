import { useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon, 
  AcademicCapIcon 
} from '@heroicons/react/24/outline';

export function SelectRole() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'parent',
      title: 'Parent',
      description: 'Create an account to support your child\'s learning journey and track their progress.',
      icon: UserGroupIcon,
      color: 'primary',
      url: 'http://localhost:3001/signup/parent',
      features: [
        'Monitor your child\'s progress',
        'Access personalized AI insights',
        'Collaborate with teachers',
        'View IEP goals and achievements'
      ]
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'Join as an educator to manage IEPs, track student progress, and access teaching resources.',
      icon: AcademicCapIcon,
      color: 'accent',
      url: 'http://localhost:3002/signup',
      features: [
        'Create and manage IEPs',
        'Track multiple students',
        'Generate progress reports',
        'Access professional development'
      ]
    }
  ];

  const handleRoleSelect = (url: string) => {
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/aivo-icon.svg" 
                alt="AIVO Icon" 
                className="w-10 h-10"
              />
              <span className="text-xl font-bold text-neutral-900">AIVO</span>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-neutral-600 hover:text-neutral-900 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Welcome to AIVO
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Choose your role to get started with personalized AI learning for neurodiverse children
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                className="bg-white rounded-2xl p-8 shadow-lg border-2 border-neutral-100 hover:border-primary-300 hover:shadow-xl transition-all duration-300 group"
              >
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
                  role.color === 'primary' ? 'bg-primary-100' : 'bg-accent-100'
                }`}>
                  <Icon className={`w-9 h-9 ${
                    role.color === 'primary' ? 'text-primary-600' : 'text-accent-600'
                  }`} />
                </div>

                {/* Title & Description */}
                <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                  I'm a {role.title}
                </h2>
                <p className="text-neutral-600 mb-6 leading-relaxed">
                  {role.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-neutral-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleRoleSelect(role.url)}
                  className={`w-full py-4 px-6 text-white rounded-lg font-semibold transition shadow-md hover:shadow-lg ${
                    role.color === 'primary' 
                      ? 'bg-primary-600 hover:bg-primary-700' 
                      : 'bg-accent-600 hover:bg-accent-700'
                  }`}
                >
                  Continue as {role.title}
                </button>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-neutral-500">
            Already have an account?{' '}
            <a href="/signin/select-role" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
