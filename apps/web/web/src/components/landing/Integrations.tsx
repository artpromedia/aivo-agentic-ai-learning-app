export function Integrations() {
  const integrations = [
    { name: 'Google Classroom', category: 'School' },
    { name: 'Seesaw', category: 'School' },
    { name: 'ClassDojo', category: 'School' },
    { name: 'Khan Academy', category: 'Learning' },
    { name: 'Epic Books', category: 'Reading' },
    { name: 'Prodigy Math', category: 'Math' },
    { name: 'Speech Blubs', category: 'Therapy' },
    { name: 'Understood.org', category: 'Resources' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <h3 className="text-3xl font-bold text-center text-neutral-900 mb-4">
          Integrates With Your Existing Tools
        </h3>
        <p className="text-center text-neutral-600 mb-12">
          Works with the learning apps and therapy tools your child already loves
        </p>

        {/* Logo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {integrations.map((integration, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-6 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition group">
              <div className="w-16 h-16 rounded-lg bg-white shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition">
                <span className="text-2xl font-bold text-neutral-400">
                  {integration.name.substring(0, 2)}
                </span>
              </div>
              <div className="text-sm font-semibold text-neutral-900 text-center mb-1">
                {integration.name}
              </div>
              <div className="text-xs text-neutral-500">
                {integration.category}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a 
            href="/signup/select-role" 
            className="inline-flex items-center text-lg font-semibold text-primary-600 hover:text-primary-700 transition"
          >
            View All Integrations
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
