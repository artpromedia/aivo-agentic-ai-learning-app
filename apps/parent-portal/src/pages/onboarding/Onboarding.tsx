import { useNavigate } from 'react-router-dom';
import { EnrollmentWizard, type LearnerData } from '../../components/Enrollment';
import { analyticsService } from '../../services/analytics';

export function Onboarding() {
  const navigate = useNavigate();

  const handleEnrollmentComplete = async (learnerData: LearnerData) => {
    console.log('📋 Enrollment completed:', learnerData);
    console.log('📋 Required fields check:', {
      firstName: learnerData.firstName,
      lastName: learnerData.lastName,
      dateOfBirth: learnerData.dateOfBirth,
      grade: learnerData.grade,
    });
    
    // Validate required fields before sending
    if (!learnerData.firstName || !learnerData.lastName || !learnerData.dateOfBirth || !learnerData.grade) {
      const missingFields = [];
      if (!learnerData.firstName) missingFields.push('First Name');
      if (!learnerData.lastName) missingFields.push('Last Name');
      if (!learnerData.dateOfBirth) missingFields.push('Date of Birth');
      if (!learnerData.grade) missingFields.push('Grade Level');
      
      alert(`⚠️ Missing required fields:\n${missingFields.join('\n')}\n\nPlease go back and fill in all required information.`);
      console.error('❌ Missing required fields:', missingFields);
      return;
    }
    
    // Track enrollment completion
    analyticsService.trackEnrollmentComplete({
      hasIEP: learnerData.hasIEP,
      diagnosesCount: learnerData.diagnoses?.length || 0,
      accommodationsCount: learnerData.accommodations?.length || 0,
      gradeLevel: learnerData.grade,
      accessibilityFeaturesEnabled: Object.values(learnerData.accessibilityPrefs || {}).filter(Boolean).length,
    });
    
    try {
      // TEMPORARY: Skip API call and redirect directly to test the flow
      const learnerId = 'temp-' + Date.now();
      console.log('🧪 TESTING: Skipping API call, using temp learner ID:', learnerId);
      
      localStorage.setItem('current_learner_id', learnerId);
      localStorage.setItem('learner_profile', JSON.stringify({
        id: learnerId,
        first_name: learnerData.firstName || 'Test',
        last_name: learnerData.lastName || 'Learner',
        grade_level: learnerData.grade || 'K',
        accessibility_prefs: learnerData.accessibilityPrefs || {},
      }));

      const parentToken = localStorage.getItem('access_token');
      
      if (!parentToken) {
        console.error('❌ No parent auth token found');
        alert('⚠️ No authentication token found. Please log in again.');
        navigate('/login');
        return;
      }
      
      // IMPORTANT: Store the learner data in a way the learner app can access it
      // across different origins (parent portal -> learner app)
      const crossOriginData = {
        learnerId,
        firstName: learnerData.firstName || 'Test',
        lastName: learnerData.lastName || 'Learner',
        grade: learnerData.grade || 'K',
        token: parentToken,
        timestamp: Date.now(),
      };
      
      // Store in localStorage (will be accessible after redirect since it's same machine)
      localStorage.setItem('pending_learner_session', JSON.stringify(crossOriginData));
      
      const learnerAppUrl = `http://localhost:3003/#/onboarding/assessment?learner_id=${learnerId}&token=${parentToken}&return_to=model_cloning`;
      console.log('='.repeat(80));
      console.log('🚀 REDIRECTING TO LEARNER APP');
      console.log('='.repeat(80));
      console.log('📍 Current URL:', window.location.href);
      console.log('� Target URL:', learnerAppUrl);
      console.log('👤 Learner ID:', learnerId);
      console.log('🔑 Token (first 20 chars):', parentToken.substring(0, 20) + '...');
      console.log('⏰ Timestamp:', new Date().toISOString());
      console.log('='.repeat(80));
      
      // Force immediate full page navigation to learner app
      console.log('✈️ REDIRECTING NOW (immediate, no delay)...');
      window.location.href = learnerAppUrl;
      
      return; // Exit early to test redirect
      
      // ORIGINAL CODE BELOW (commented out for testing)
      /*
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
      */

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


