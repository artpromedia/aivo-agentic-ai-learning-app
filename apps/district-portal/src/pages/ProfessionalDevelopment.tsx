import { useState, useEffect, useCallback } from 'react';
import { trainingAPI, type TrainingModule, type CertificationStats, type TrainingEnrollment } from '../services/api';

export default function ProfessionalDevelopment() {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [certStats, setCertStats] = useState<CertificationStats | null>(null);
  const [userProgress, setUserProgress] = useState<TrainingEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user ID from localStorage (assuming it's stored during login)
  const getCurrentUserId = () => {
    return localStorage.getItem('user_id') || '';
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load modules and stats in parallel
      const [modulesData, statsData, progressData] = await Promise.all([
        trainingAPI.listModules(),
        trainingAPI.getCertificationStats(),
        trainingAPI.getProgress({ user_id: getCurrentUserId() })
      ]);

      setModules(modulesData);
      setCertStats(statsData);
      setUserProgress(progressData);
    } catch (err) {
      console.error('Error loading training data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load training data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartLearning = async (moduleId: string) => {
    const userId = getCurrentUserId();
    
    if (!userId) {
      alert('Please log in to enroll in training modules');
      return;
    }

    try {
      // Check if already enrolled
      const existingEnrollment = userProgress.find(p => p.module_id === moduleId);
      
      if (existingEnrollment) {
        // Already enrolled - open content
        const module = modules.find(m => m.id === moduleId);
        if (module?.content_url) {
          window.open(module.content_url, '_blank');
          
          // Update progress if it's the first time
          if (existingEnrollment.progress === 0) {
            await trainingAPI.updateProgress(existingEnrollment.id, { progress: 1 });
            // Reload progress
            const updatedProgress = await trainingAPI.getProgress({ user_id: userId });
            setUserProgress(updatedProgress);
          }
        }
      } else {
        // Enroll user
        const enrollment = await trainingAPI.enroll({ user_id: userId, module_id: moduleId });
        
        // Add to user progress
        setUserProgress([...userProgress, enrollment]);
        
        // Open content
        const module = modules.find(m => m.id === moduleId);
        if (module?.content_url) {
          window.open(module.content_url, '_blank');
        }
        
        alert('Successfully enrolled in training module!');
      }
    } catch (err) {
      console.error('Error enrolling in training:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('409')) {
        alert('You are already enrolled in this module');
      } else {
        alert('Failed to enroll in training module. Please try again.');
      }
    }
  };

  const getEnrollmentStatus = (moduleId: string) => {
    const enrollment = userProgress.find(p => p.module_id === moduleId);
    return enrollment;
  };

  const getButtonText = (moduleId: string) => {
    const enrollment = getEnrollmentStatus(moduleId);
    
    if (!enrollment) return 'Start Learning';
    if (enrollment.status === 'completed') return 'View Again';
    if (enrollment.status === 'in_progress') return `Resume (${enrollment.progress}%)`;
    return 'Start Learning';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Professional Development</h1>
          <p className="text-neutral-600 mt-1">
            Training resources and certification programs for educators
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-neutral-600">Loading training modules...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Professional Development</h1>
          <p className="text-neutral-600 mt-1">
            Training resources and certification programs for educators
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error loading training data</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={loadData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }


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
          <p className="text-3xl font-bold text-neutral-900 mt-2">{modules.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Total Completions</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">
            {modules.reduce((sum, m) => sum + (m.completion_count || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Avg Rating</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">
            {modules.length > 0
              ? (modules.reduce((sum, m) => sum + m.rating, 0) / modules.length).toFixed(1)
              : '0.0'}{' '}
            ⭐
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">My Progress</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">
            {userProgress.filter(p => p.status === 'completed').length}/{userProgress.length}
          </p>
        </div>
      </div>

      {/* Training Resources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {modules.map((module) => {
          const enrollment = getEnrollmentStatus(module.id);
          const buttonText = getButtonText(module.id);
          
          return (
            <div
              key={module.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-24 h-24 bg-neutral-100 rounded-lg overflow-hidden">
                  <img
                    src={module.thumbnail_url}
                    alt={module.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-neutral-900">{module.title}</h3>
                    <span
                      className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-semibold ml-2 ${
                        module.type === 'video'
                          ? 'bg-red-100 text-red-700'
                          : module.type === 'guide'
                          ? 'bg-blue-100 text-blue-700'
                          : module.type === 'template'
                          ? 'bg-green-100 text-green-700'
                          : module.type === 'workshop'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {module.type}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">{module.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-neutral-500 mb-3">
                    <span>📚 {module.category}</span>
                    <span>⏱️ {module.duration} min</span>
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        module.difficulty === 'beginner'
                          ? 'bg-green-100 text-green-700'
                          : module.difficulty === 'intermediate'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {module.difficulty}
                    </span>
                  </div>
                  
                  {/* Progress Bar for enrolled modules */}
                  {enrollment && enrollment.status !== 'not_started' && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
                        <span>Progress</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            enrollment.status === 'completed'
                              ? 'bg-green-500'
                              : 'bg-indigo-500'
                          }`}
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-neutral-600">
                        {module.completion_count || 0} completions
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm">⭐</span>
                        <span className="text-xs font-semibold text-neutral-900">
                          {module.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartLearning(module.id)}
                      className={`px-3 py-1.5 rounded-lg transition-colors font-medium text-xs ${
                        enrollment?.status === 'completed'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {buttonText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Teacher Certification Tracking */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Teacher Certification Tracking
        </h2>
        {certStats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <p className="text-4xl font-bold text-green-600">{certStats.certified_teachers}</p>
              <p className="text-sm text-green-700 font-medium mt-2">Certified Teachers</p>
              <p className="text-xs text-green-600 mt-1">{certStats.certification_rate.toFixed(1)}% of total staff</p>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <p className="text-4xl font-bold text-blue-600">{certStats.in_progress_teachers}</p>
              <p className="text-sm text-blue-700 font-medium mt-2">In Progress</p>
              <p className="text-xs text-blue-600 mt-1">
                {certStats.total_teachers > 0
                  ? ((certStats.in_progress_teachers / certStats.total_teachers) * 100).toFixed(1)
                  : '0'}% of total staff
              </p>
            </div>
            <div className="text-center p-6 bg-amber-50 rounded-lg">
              <p className="text-4xl font-bold text-amber-600">{certStats.not_started_teachers}</p>
              <p className="text-sm text-amber-700 font-medium mt-2">Not Started</p>
              <p className="text-xs text-amber-600 mt-1">
                {certStats.total_teachers > 0
                  ? ((certStats.not_started_teachers / certStats.total_teachers) * 100).toFixed(1)
                  : '0'}% of total staff
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-500">
            Loading certification statistics...
          </div>
        )}
      </div>
    </div>
  );
}
