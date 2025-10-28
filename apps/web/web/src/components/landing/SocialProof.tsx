export function SocialProof() {
  const stats = [
    { number: '350+', label: 'Students in Pilot Program' },
    { number: '92%', label: 'Improved Learning Engagement' },
    { number: '4.9/5', label: 'Parent Satisfaction Score' },
    { number: '85%', label: 'Report Better Focus' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-center text-neutral-900 mb-4">
          Proven Results from Our Pilot Program
        </h2>
        <p className="text-center text-neutral-600 mb-12 max-w-2xl mx-auto">
          Real data from real families across 12 schools in our pilot program
        </p>

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

        {/* HIPAA Compliance Note */}
        <p className="text-xs text-neutral-500 text-center mt-8">
          All statistics represent aggregated, de-identified data from our pilot program. No individual student information disclosed.
        </p>
      </div>
    </section>
  );
}
