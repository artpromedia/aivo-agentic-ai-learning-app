export function SocialProof() {
  const stats = [
    { number: '50,000+', label: 'Students Supported' },
    { number: '500+', label: 'Schools & Districts' },
    { number: '98%', label: 'Compliance Rate' },
    { number: '15hrs', label: 'Saved Per IEP' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">
          Trusted by Leading Educational Institutions
        </h2>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                {stat.number}
              </div>
              <div className="text-sm md:text-base text-neutral-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
