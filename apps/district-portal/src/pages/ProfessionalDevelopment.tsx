import { getTrainingResources } from '../utils/mockData';

export default function ProfessionalDevelopment() {
  const resources = getTrainingResources();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Professional Development</h1>
        <p className="text-neutral-600 mt-1">
          Training resources and certification programs for educators
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Total Resources</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{resources.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Total Completions</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">
            {resources.reduce((sum, r) => sum + r.completionCount, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Avg Rating</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">
            {(resources.reduce((sum, r) => sum + r.rating, 0) / resources.length).toFixed(1)} ⭐
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Certifications</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">
            {resources.filter(r => r.type === 'certification').length}
          </p>
        </div>
      </div>

      {/* Training Resources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-24 h-24 bg-neutral-100 rounded-lg overflow-hidden">
                <img
                  src={resource.thumbnailUrl}
                  alt={resource.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-neutral-900">{resource.title}</h3>
                  <span
                    className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-semibold ml-2 ${
                      resource.type === 'video'
                        ? 'bg-red-100 text-red-700'
                        : resource.type === 'guide'
                        ? 'bg-blue-100 text-blue-700'
                        : resource.type === 'template'
                        ? 'bg-green-100 text-green-700'
                        : resource.type === 'workshop'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {resource.type}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mb-3">{resource.description}</p>
                <div className="flex items-center space-x-4 text-xs text-neutral-500 mb-3">
                  <span>📚 {resource.category}</span>
                  <span>⏱️ {resource.duration} min</span>
                  <span
                    className={`px-2 py-0.5 rounded-full ${
                      resource.difficulty === 'beginner'
                        ? 'bg-green-100 text-green-700'
                        : resource.difficulty === 'intermediate'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {resource.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-neutral-600">
                      {resource.completionCount} completions
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">⭐</span>
                      <span className="text-xs font-semibold text-neutral-900">
                        {resource.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-xs">
                    Start Learning
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Teacher Certification Tracking */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Teacher Certification Tracking
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <p className="text-4xl font-bold text-green-600">45</p>
            <p className="text-sm text-green-700 font-medium mt-2">Certified Teachers</p>
            <p className="text-xs text-green-600 mt-1">38% of total staff</p>
          </div>
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <p className="text-4xl font-bold text-blue-600">23</p>
            <p className="text-sm text-blue-700 font-medium mt-2">In Progress</p>
            <p className="text-xs text-blue-600 mt-1">19% of total staff</p>
          </div>
          <div className="text-center p-6 bg-amber-50 rounded-lg">
            <p className="text-4xl font-bold text-amber-600">52</p>
            <p className="text-sm text-amber-700 font-medium mt-2">Not Started</p>
            <p className="text-xs text-amber-600 mt-1">43% of total staff</p>
          </div>
        </div>
      </div>
    </div>
  );
}
