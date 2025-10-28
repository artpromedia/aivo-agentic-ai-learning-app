export function Testimonials() {
  const testimonials = [
    {
      quote: "AIVO reduced our IEP writing time by 60%. The AI suggestions are incredibly accurate and IDEA-compliant.",
      author: "Sarah Johnson",
      title: "Special Education Director, Lincoln USD",
      rating: 5,
    },
    {
      quote: "The progress tracking features have transformed how we communicate with parents. Everyone stays informed in real-time.",
      author: "Michael Chen",
      title: "Special Education Teacher, Riverside Elementary",
      rating: 5,
    },
    {
      quote: "Finally, a platform that understands the complexity of IEP management. The compliance alerts alone are worth it.",
      author: "Dr. Emily Rodriguez",
      title: "Director of Student Services, Metro School District",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <h2 className="text-4xl md:text-5xl font-bold text-center text-neutral-900 mb-16">
          Hear From Our Community
        </h2>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="bg-white rounded-xl p-8 shadow-card hover:shadow-card-hover transition-shadow">
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <svg key={j} className="w-5 h-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-neutral-700 leading-relaxed mb-6">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                  {testimonial.author[0]}
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">{testimonial.author}</div>
                  <div className="text-sm text-neutral-600">{testimonial.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
