import { useNavigate } from 'react-router-dom';
import { EnrollmentWizard, type LearnerData } from '../../components/Enrollment';
import { analyticsService } from '../../services/analytics';

export function Onboarding() {
  const navigate = useNavigate();

  const handleEnrollmentComplete = async (learnerData: LearnerData) => {
    console.log('📋 Enrollment completed:', learnerData);
    
    // Track enrollment completion
    analyticsService.trackEnrollmentComplete({
      hasIEP: learnerData.hasIEP,
      diagnosesCount: learnerData.diagnoses?.length || 0,
      accommodationsCount: learnerData.accommodations?.length || 0,
      gradeLevel: learnerData.grade,
      accessibilityFeaturesEnabled: Object.values(learnerData.accessibilityPrefs || {}).filter(Boolean).length,
    });
    
    try {
      // 1. Get authentication token
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        console.error('No access token found');
        analyticsService.trackError('No auth token during enrollment');
        navigate('/login');
        return;
      }

      // 2. Get parent info from localStorage
      const userStr = localStorage.getItem('user');
      let parentEmail = '';
      let parentName = '';
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          parentEmail = user.email || '';
          parentName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Parent';
        } catch (e) {
          console.warn('Could not parse user data');
        }
      }

      // 3. Send learner data to backend API
      const response = await fetch('http://localhost:9000/api/v1/learners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: learnerData.firstName,
          last_name: learnerData.lastName,
          preferred_name: learnerData.preferredName,
          date_of_birth: learnerData.dateOfBirth,
          grade_level: learnerData.grade,
          gender: learnerData.gender,
          diagnoses: learnerData.diagnoses || [],
          accommodations: learnerData.accommodations || [],
          learning_strengths: learnerData.learningStrengths || [],
          learning_challenges: learnerData.learningChallenges || [],
          accessibility_preferences: learnerData.accessibilityPrefs || {},
          has_iep: learnerData.hasIEP || false,
          iep_details: learnerData.iepDetails || null,
          parent_email: parentEmail,
          parent_name: parentName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        
        // Format validation errors if present
        let errorMessage = 'Failed to create learner account';
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Pydantic validation errors
            errorMessage = errorData.detail.map((err: any) => 
              `${err.loc?.join('.')}: ${err.msg}`
            ).join('\n');
          } else {
            errorMessage = errorData.detail;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const learnerId = result.id || result.learner_id;

      console.log('✅ Learner created:', learnerId);
      if (result.email_sent) {
        console.log('📧 Enrollment confirmation email sent to:', parentEmail);
      }

      // 3. Store learner ID and profile in localStorage
      localStorage.setItem('current_learner_id', learnerId);
      localStorage.setItem('learner_profile', JSON.stringify({
        id: learnerId,
        first_name: learnerData.firstName,
        last_name: learnerData.lastName,
        grade_level: learnerData.grade,
        accessibility_prefs: learnerData.accessibilityPrefs,
      }));

      // 4. Get parent's auth token to pass to learner app
      const parentToken = localStorage.getItem('access_token');
      
      // 5. Redirect to learner app for baseline assessment
      // After assessment completes, learner app will redirect back to parent portal for model cloning
      const learnerAppUrl = `http://localhost:3003/#/onboarding/assessment?learner_id=${learnerId}&token=${parentToken}&return_to=model_cloning`;
      console.log('🚀 REDIRECTING to learner app assessment:', learnerAppUrl);
      
      // Force immediate full page navigation to learner app
      window.location.href = learnerAppUrl;

    } catch (error) {
      console.error('❌ Error creating learner:', error);
      analyticsService.trackError('Enrollment failed', {
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
      alert(`Failed to create learner account: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-12">
      <EnrollmentWizard onComplete={handleEnrollmentComplete} />
    </div>
  );
}
