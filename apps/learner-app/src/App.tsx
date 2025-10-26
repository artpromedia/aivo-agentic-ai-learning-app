import { HashRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ThemeProvider, LearnerErrorBoundary } from '@aivo/ui';
import { LearnerProtectedRoute } from './components/LearnerProtectedRoute';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { Lock } from './pages/Lock';
import { NotFound } from './pages/NotFound';
import { DevRoutes } from './pages/DevRoutes';
import { RouteTestWrapper } from './components/RouteTestWrapper';
import { SensoryProfileSetup } from './components/SensoryProfile';
import { SelfRegulationHub } from './components/SelfRegulation';
import { ExecutiveFunctionPage } from './pages/ExecutiveFunction';
import { SubjectSelection } from './pages/SubjectSelection';
import { ModelCloning } from './pages/ModelCloning';
import { BaselineAssessment } from './pages/BaselineAssessment'; // OLD - kept for backwards compatibility
import { NewBaselineAssessment } from './pages/NewBaselineAssessment'; // NEW comprehensive assessment
import { OnboardingAssessment } from './pages/OnboardingAssessment';
import { SetupPin } from './pages/SetupPin';
import { AssessmentResults } from './pages/AssessmentResults';
import { AssessmentResultsPage } from './pages/Assessment/AssessmentResultsPage';
import { ReadingActivity } from './pages/activities/Reading';
import { MathActivity } from './pages/activities/Math';
import { SpeechActivity } from './pages/activities/Speech';
import { Rewards } from './pages/Rewards';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { GradeBasedThemeSync } from './components/GradeBasedThemeSync';
import { ConnectivityBanner } from './components/ConnectivityBanner';

// Lazy load heavy components
const LearnerResultsPage = lazy(() =>
  import('./pages/baseline/LearnerResultsPage').then(module => ({
    default: module.LearnerResultsPage,
  }))
);

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// K5 Subject Pages
import { MathPage as K5Math } from './pages/subjects/k5/Math';
import { SciencePage as K5Science } from './pages/subjects/k5/Science';
import { ReadingPage as K5Reading } from './pages/subjects/k5/Reading';
import { WritingPage as K5Writing } from './pages/subjects/k5/Writing';
import { SocialStudiesPage as K5SocialStudies } from './pages/subjects/k5/SocialStudies';
import { ArtPage as K5Art } from './pages/subjects/k5/Art';
import { MusicPage as K5Music } from './pages/subjects/k5/Music';
import { PEPage as K5PE } from './pages/subjects/k5/PE';
import { HealthPage as K5Health } from './pages/subjects/k5/Health';
import { TechnologyPage as K5Technology } from './pages/subjects/k5/Technology';

// MS Subject Pages
import { MathPage as MSMath } from './pages/subjects/ms/Math';
import { SciencePage as MSScience } from './pages/subjects/ms/Science';
import { ELAPage as MSELA } from './pages/subjects/ms/ELA';
import { SocialStudiesPage as MSSocialStudies } from './pages/subjects/ms/SocialStudies';
import { WorldLanguagesPage as MSWorldLanguages } from './pages/subjects/ms/WorldLanguages';
import { ArtsPage as MSArts } from './pages/subjects/ms/Arts';
import { PEHealthPage as MSPEHealth } from './pages/subjects/ms/PEHealth';
import { TechnologyCSPage as MSTechnologyCS } from './pages/subjects/ms/TechnologyCS';

// HS Subject Pages
import { AlgebraIPage, GeometryPage, AlgebraIIPage, PrecalculusPage, CalculusPage } from './pages/subjects/hs/Math';
import { BiologyPage, ChemistryPage, PhysicsPage } from './pages/subjects/hs/Science';
import { ELAPage as HSELA } from './pages/subjects/hs/ELA';
import { USHistoryPage, WorldHistoryPage, GovEconPage } from './pages/subjects/hs/SocialStudies';
import { ComputerSciencePage } from './pages/subjects/hs/ComputerScience';
import { WorldLanguagesPage as HSWorldLanguages } from './pages/subjects/hs/WorldLanguages';
import { ArtsPage as HSArts } from './pages/subjects/hs/Arts';
import { PEHealthPage as HSPEHealth } from './pages/subjects/hs/PEHealth';
import { SubjectDetailPage } from './pages/SubjectDetail';
import { ActivityPage } from './pages/ActivityPage';
import HomeworkHelperPage from './pages/HomeworkHelper';
import HomeworkChat from './pages/HomeworkChat';
import { HomeworkSession, HomeworkInbox } from './components/HomeworkHelper';
import { routeRegistry } from '@aivo/utils';

// Register all routes for E2E testing and navigation
routeRegistry.registerMany([
  { path: '/login', screen: 'Login', title: 'Login', category: 'learner' },
  { path: '/unauthorized', screen: 'Unauthorized', title: 'Unauthorized', category: 'learner' },
  { path: '/', screen: 'Lock', title: 'Home', category: 'learner', roles: ['learner'] },
  { path: '/profile', screen: 'Profile', title: 'Profile', category: 'settings', roles: ['learner'] },
  { path: '/settings', screen: 'Settings', title: 'Settings', category: 'settings', roles: ['learner'] },
  { path: '/sensory-profile', screen: 'SensoryProfile', title: 'Sensory Profile', category: 'learner', roles: ['learner'] },
  { path: '/calm', screen: 'SelfRegulation', title: 'Calm Corner', category: 'learner', roles: ['learner'] },
  { path: '/organize', screen: 'ExecutiveFunction', title: 'Executive Function', category: 'learner', roles: ['learner'] },
  { path: '/subjects', screen: 'SubjectSelection', title: 'Subject Selection', category: 'learner', roles: ['learner'] },
  { path: '/cloning', screen: 'ModelCloning', title: 'Model Cloning', category: 'learner', roles: ['learner'] },
  { path: '/setup-pin', screen: 'SetupPin', title: 'Setup PIN', category: 'learner' },
  { path: '/assessment', screen: 'BaselineAssessment', title: 'Assessment', category: 'learner', roles: ['learner'] },
  { path: '/assessment-results', screen: 'AssessmentResults', title: 'Assessment Results', category: 'learner', roles: ['learner'] },
  { path: '/assessment/:assessmentId/results', screen: 'AssessmentResultsPage', title: 'Assessment Results Detail', category: 'learner', roles: ['learner'], params: { assessmentId: 'string' } },
  { path: '/baseline/results/:sessionId', screen: 'LearnerResultsPage', title: 'Baseline Results', category: 'learner', roles: ['learner'], params: { sessionId: 'string' } },
  { path: '/activity/reading', screen: 'ReadingActivity', title: 'Reading Activity', category: 'learner', roles: ['learner'] },
  { path: '/activity/math', screen: 'MathActivity', title: 'Math Activity', category: 'learner', roles: ['learner'] },
  { path: '/activity/speech', screen: 'SpeechActivity', title: 'Speech Activity', category: 'learner', roles: ['learner'] },
  { path: '/rewards', screen: 'Rewards', title: 'Rewards', category: 'learner', roles: ['learner'] },
  { path: '/homework-chat', screen: 'HomeworkChat', title: 'Homework Chat', category: 'learner', roles: ['learner'] },
  { path: '/homework-helper', screen: 'HomeworkInbox', title: 'Homework Inbox', category: 'learner', roles: ['learner'] },
  { path: '/homework-helper/new', screen: 'HomeworkHelper', title: 'New Homework Session', category: 'learner', roles: ['learner'] },
  { path: '/homework-helper/:sessionId', screen: 'HomeworkSession', title: 'Homework Session', category: 'learner', roles: ['learner'], params: { sessionId: 'string' } },
  { path: '/learner/:theme/subject/:subjectId/activity/:activityId', screen: 'ActivityPage', title: 'Activity', category: 'learner', roles: ['learner'], params: { theme: 'string', subjectId: 'string', activityId: 'string' } },
  { path: '/learner/:theme/subject/:subjectId', screen: 'SubjectDetail', title: 'Subject Detail', category: 'learner', roles: ['learner'], params: { theme: 'string', subjectId: 'string' } },
  { path: '/learner/k5/math', screen: 'K5Math', title: 'Math (K-5)', category: 'learner', roles: ['learner'] },
  { path: '/learner/k5/science', screen: 'K5Science', title: 'Science (K-5)', category: 'learner', roles: ['learner'] },
  { path: '/learner/k5/reading', screen: 'K5Reading', title: 'Reading (K-5)', category: 'learner', roles: ['learner'] },
  { path: '/learner/k5/writing', screen: 'K5Writing', title: 'Writing (K-5)', category: 'learner', roles: ['learner'] },
  { path: '/learner/k5/socialstudies', screen: 'K5SocialStudies', title: 'Social Studies (K-5)', category: 'learner', roles: ['learner'] },
  { path: '/learner/k5/art', screen: 'K5Art', title: 'Art (K-5)', category: 'learner', roles: ['learner'] },
  { path: '/learner/k5/music', screen: 'K5Music', title: 'Music (K-5)', category: 'learner', roles: ['learner'] },
  { path: '/learner/k5/pe', screen: 'K5PE', title: 'PE (K-5)', category: 'learner', roles: ['learner'] },
  { path: '/learner/k5/health', screen: 'K5Health', title: 'Health (K-5)', category: 'learner', roles: ['learner'] },
  { path: '/learner/k5/technology', screen: 'K5Technology', title: 'Technology (K-5)', category: 'learner', roles: ['learner'] },
  { path: '/learner/ms/math', screen: 'MSMath', title: 'Math (MS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/ms/science', screen: 'MSScience', title: 'Science (MS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/ms/ela', screen: 'MSELA', title: 'ELA (MS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/ms/socialstudies', screen: 'MSSocialStudies', title: 'Social Studies (MS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/ms/worldlanguages', screen: 'MSWorldLanguages', title: 'World Languages (MS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/ms/arts', screen: 'MSArts', title: 'Arts (MS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/ms/pehealth', screen: 'MSPEHealth', title: 'PE/Health (MS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/ms/technologycs', screen: 'MSTechnologyCS', title: 'Technology/CS (MS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/hs/algebrai', screen: 'AlgebraI', title: 'Algebra I (HS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/hs/geometry', screen: 'Geometry', title: 'Geometry (HS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/hs/algebraii', screen: 'AlgebraII', title: 'Algebra II (HS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/hs/precalculus', screen: 'Precalculus', title: 'Precalculus (HS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/hs/calculus', screen: 'Calculus', title: 'Calculus (HS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/hs/biology', screen: 'Biology', title: 'Biology (HS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/hs/chemistry', screen: 'Chemistry', title: 'Chemistry (HS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/hs/physics', screen: 'Physics', title: 'Physics (HS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/hs/ela', screen: 'HSELA', title: 'ELA (HS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/hs/ushistory', screen: 'USHistory', title: 'US History (HS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/hs/worldhistory', screen: 'WorldHistory', title: 'World History (HS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/hs/govecon', screen: 'GovEcon', title: 'Gov/Econ (HS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/hs/computerscience', screen: 'ComputerScience', title: 'Computer Science (HS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/hs/worldlanguages', screen: 'HSWorldLanguages', title: 'World Languages (HS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/hs/arts', screen: 'HSArts', title: 'Arts (HS)', category: 'learner', roles: ['learner'] },
  { path: '/learner/hs/pehealth', screen: 'HSPEHealth', title: 'PE/Health (HS)', category: 'learner', roles: ['learner'] },
  // Demo routes - no authentication required
  { path: '/demo/assessment', screen: 'BaselineAssessment', title: 'Demo: Assessment', category: 'developer' },
  { path: '/demo/cloning', screen: 'ModelCloning', title: 'Demo: Cloning', category: 'developer' },
  { path: '/demo/results', screen: 'AssessmentResults', title: 'Demo: Results', category: 'developer' },
  { path: '/demo/subjects', screen: 'SubjectSelection', title: 'Demo: Subjects', category: 'developer' },
  { path: '/demo/homework', screen: 'HomeworkHelper', title: 'Demo: Homework', category: 'developer' },
  { path: '/demo/homework-chat', screen: 'HomeworkChat', title: 'Demo: Homework Chat', category: 'developer' },
]);

function App() {
  return (
    <LearnerErrorBoundary>
          <ThemeProvider defaultTheme="MS" persistTheme>
          <GradeBasedThemeSync />
          <HashRouter>
          <RouteTestWrapper>
          <ConnectivityBanner />
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Onboarding Routes - Public for new learners */}
          <Route path="/onboarding/assessment" element={<OnboardingAssessment />} />
          <Route path="/setup-pin" element={<SetupPin />} />
          <Route path="/cloning" element={<ModelCloning />} />
          <Route path="/subjects" element={<SubjectSelection />} />
          
          {/* Dev Routes - Public for testing */}
          <Route path="/dev/routes" element={<DevRoutes />} />
          
          {/* Protected Routes for Learners - Simple localStorage-based session check */}
          <Route path="/" element={<LearnerProtectedRoute><Lock /></LearnerProtectedRoute>} />
          <Route path="/profile" element={<LearnerProtectedRoute><Profile /></LearnerProtectedRoute>} />
          <Route path="/settings" element={<LearnerProtectedRoute><Settings /></LearnerProtectedRoute>} />
          <Route 
            path="/sensory-profile" 
            element={
              <LearnerProtectedRoute>
                <SensoryProfileSetup 
                  learnerId="demo_learner_123" 
                  onComplete={() => window.location.href = '/'} 
                />
              </LearnerProtectedRoute>
            } 
          />
          <Route 
            path="/calm" 
            element={
              <LearnerProtectedRoute>
                <SelfRegulationHub 
                  learnerId="demo_learner_123" 
                  onClose={() => window.location.href = '/'} 
                />
              </LearnerProtectedRoute>
            } 
          />
          <Route path="/organize" element={<LearnerProtectedRoute><ExecutiveFunctionPage /></LearnerProtectedRoute>} />
          <Route path="/assessment" element={<LearnerProtectedRoute><NewBaselineAssessment /></LearnerProtectedRoute>} />
          <Route path="/assessment-results" element={<LearnerProtectedRoute><AssessmentResults /></LearnerProtectedRoute>} />
          <Route path="/assessment/:assessmentId/results" element={<LearnerProtectedRoute><AssessmentResultsPage /></LearnerProtectedRoute>} />
          <Route 
            path="/baseline/results/:sessionId" 
            element={
              <LearnerProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <LearnerResultsPage />
                </Suspense>
              </LearnerProtectedRoute>
            } 
          />
          
          {/* Demo Routes - No Authentication Required */}
          <Route path="/demo/assessment" element={<NewBaselineAssessment />} />
          <Route path="/demo/cloning" element={<ModelCloning />} />
          <Route path="/demo/results" element={<AssessmentResults />} />
          <Route path="/demo/assessment-results" element={<AssessmentResultsPage />} />
          <Route 
            path="/demo/baseline-results/:sessionId" 
            element={
              <Suspense fallback={<PageLoader />}>
                <LearnerResultsPage />
              </Suspense>
            } 
          />
          <Route path="/demo/subjects" element={<SubjectSelection />} />
          <Route path="/demo/homework" element={<HomeworkHelperPage />} />
          <Route path="/demo/homework-chat" element={<HomeworkChat />} />
          
          <Route path="/activity/reading" element={<LearnerProtectedRoute><ReadingActivity /></LearnerProtectedRoute>} />
          <Route path="/activity/math" element={<LearnerProtectedRoute><MathActivity /></LearnerProtectedRoute>} />
          <Route path="/activity/speech" element={<LearnerProtectedRoute><SpeechActivity /></LearnerProtectedRoute>} />
          <Route path="/rewards" element={<LearnerProtectedRoute><Rewards /></LearnerProtectedRoute>} />
          
          {/* Homework Helper */}
          <Route path="/homework-chat" element={<LearnerProtectedRoute><HomeworkChat /></LearnerProtectedRoute>} />
          <Route path="/homework-helper" element={<LearnerProtectedRoute><HomeworkInbox learnerId="demo_learner_123" /></LearnerProtectedRoute>} />
          <Route path="/homework-helper/new" element={<LearnerProtectedRoute><HomeworkHelperPage /></LearnerProtectedRoute>} />
          <Route path="/homework-helper/:sessionId" element={<LearnerProtectedRoute><HomeworkSession /></LearnerProtectedRoute>} />
          
          {/* Activity Route - For individual lessons/activities */}
          <Route path="/learner/:theme/subject/:subjectId/activity/:activityId" element={<LearnerProtectedRoute><ActivityPage /></LearnerProtectedRoute>} />
          
          {/* Subject Detail Route - Dynamic for all themes */}
          <Route path="/learner/:theme/subject/:subjectId" element={<LearnerProtectedRoute><SubjectDetailPage /></LearnerProtectedRoute>} />
          
          {/* K5 Subject Routes */}
          <Route path="/learner/k5/math" element={<LearnerProtectedRoute><K5Math /></LearnerProtectedRoute>} />
          <Route path="/learner/k5/science" element={<LearnerProtectedRoute><K5Science /></LearnerProtectedRoute>} />
          <Route path="/learner/k5/reading" element={<LearnerProtectedRoute><K5Reading /></LearnerProtectedRoute>} />
          <Route path="/learner/k5/writing" element={<LearnerProtectedRoute><K5Writing /></LearnerProtectedRoute>} />
          <Route path="/learner/k5/socialstudies" element={<LearnerProtectedRoute><K5SocialStudies /></LearnerProtectedRoute>} />
          <Route path="/learner/k5/art" element={<LearnerProtectedRoute><K5Art /></LearnerProtectedRoute>} />
          <Route path="/learner/k5/music" element={<LearnerProtectedRoute><K5Music /></LearnerProtectedRoute>} />
          <Route path="/learner/k5/pe" element={<LearnerProtectedRoute><K5PE /></LearnerProtectedRoute>} />
          <Route path="/learner/k5/health" element={<LearnerProtectedRoute><K5Health /></LearnerProtectedRoute>} />
          <Route path="/learner/k5/technology" element={<LearnerProtectedRoute><K5Technology /></LearnerProtectedRoute>} />
          
          {/* MS Subject Routes */}
          <Route path="/learner/ms/math" element={<LearnerProtectedRoute><MSMath /></LearnerProtectedRoute>} />
          <Route path="/learner/ms/science" element={<LearnerProtectedRoute><MSScience /></LearnerProtectedRoute>} />
          <Route path="/learner/ms/ela" element={<LearnerProtectedRoute><MSELA /></LearnerProtectedRoute>} />
          <Route path="/learner/ms/socialstudies" element={<LearnerProtectedRoute><MSSocialStudies /></LearnerProtectedRoute>} />
          <Route path="/learner/ms/worldlanguages" element={<LearnerProtectedRoute><MSWorldLanguages /></LearnerProtectedRoute>} />
          <Route path="/learner/ms/arts" element={<LearnerProtectedRoute><MSArts /></LearnerProtectedRoute>} />
          <Route path="/learner/ms/pehealth" element={<LearnerProtectedRoute><MSPEHealth /></LearnerProtectedRoute>} />
          <Route path="/learner/ms/technologycs" element={<LearnerProtectedRoute><MSTechnologyCS /></LearnerProtectedRoute>} />
          
          {/* HS Math Routes */}
          <Route path="/learner/hs/algebrai" element={<LearnerProtectedRoute><AlgebraIPage /></LearnerProtectedRoute>} />
          <Route path="/learner/hs/geometry" element={<LearnerProtectedRoute><GeometryPage /></LearnerProtectedRoute>} />
          <Route path="/learner/hs/algebraii" element={<LearnerProtectedRoute><AlgebraIIPage /></LearnerProtectedRoute>} />
          <Route path="/learner/hs/precalculus" element={<LearnerProtectedRoute><PrecalculusPage /></LearnerProtectedRoute>} />
          <Route path="/learner/hs/calculus" element={<LearnerProtectedRoute><CalculusPage /></LearnerProtectedRoute>} />
          
          {/* HS Science Routes */}
          <Route path="/learner/hs/biology" element={<LearnerProtectedRoute><BiologyPage /></LearnerProtectedRoute>} />
          <Route path="/learner/hs/chemistry" element={<LearnerProtectedRoute><ChemistryPage /></LearnerProtectedRoute>} />
          <Route path="/learner/hs/physics" element={<LearnerProtectedRoute><PhysicsPage /></LearnerProtectedRoute>} />
          
          {/* HS Other Routes */}
          <Route path="/learner/hs/ela" element={<LearnerProtectedRoute><HSELA /></LearnerProtectedRoute>} />
          <Route path="/learner/hs/ushistory" element={<LearnerProtectedRoute><USHistoryPage /></LearnerProtectedRoute>} />
          <Route path="/learner/hs/worldhistory" element={<LearnerProtectedRoute><WorldHistoryPage /></LearnerProtectedRoute>} />
          <Route path="/learner/hs/govecon" element={<LearnerProtectedRoute><GovEconPage /></LearnerProtectedRoute>} />
          <Route path="/learner/hs/computerscience" element={<LearnerProtectedRoute><ComputerSciencePage /></LearnerProtectedRoute>} />
          <Route path="/learner/hs/worldlanguages" element={<LearnerProtectedRoute><HSWorldLanguages /></LearnerProtectedRoute>} />
          <Route path="/learner/hs/arts" element={<LearnerProtectedRoute><HSArts /></LearnerProtectedRoute>} />
          <Route path="/learner/hs/pehealth" element={<LearnerProtectedRoute><HSPEHealth /></LearnerProtectedRoute>} />
          
          {/* 404 Catch-all - Must be last and public to show 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </RouteTestWrapper>
        
        {/* Global PWA Components */}
        <OfflineIndicator />
        <PWAInstallPrompt />
      </HashRouter>
      </ThemeProvider>
    </LearnerErrorBoundary>
  );
}

export default App;

