import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from '@aivo/auth';
import { ThemeProvider, LearnerErrorBoundary } from '@aivo/ui';
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
import { BaselineAssessment } from './pages/BaselineAssessment';
import { AssessmentResults } from './pages/AssessmentResults';
import { ReadingActivity } from './pages/activities/Reading';
import { MathActivity } from './pages/activities/Math';
import { SpeechActivity } from './pages/activities/Speech';
import { Rewards } from './pages/Rewards';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { GradeBasedThemeSync } from './components/GradeBasedThemeSync';
import { ConnectivityBanner } from './components/ConnectivityBanner';

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
  { path: '/assessment', screen: 'BaselineAssessment', title: 'Assessment', category: 'learner', roles: ['learner'] },
  { path: '/assessment-results', screen: 'AssessmentResults', title: 'Assessment Results', category: 'learner', roles: ['learner'] },
  { path: '/activity/reading', screen: 'ReadingActivity', title: 'Reading Activity', category: 'learner', roles: ['learner'] },
  { path: '/activity/math', screen: 'MathActivity', title: 'Math Activity', category: 'learner', roles: ['learner'] },
  { path: '/activity/speech', screen: 'SpeechActivity', title: 'Speech Activity', category: 'learner', roles: ['learner'] },
  { path: '/rewards', screen: 'Rewards', title: 'Rewards', category: 'learner', roles: ['learner'] },
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
]);

function App() {
  return (
    <LearnerErrorBoundary>
      <AuthProvider apiBaseUrl={import.meta.env.VITE_API_URL || '/api'}>
          <ThemeProvider defaultTheme="MS" persistTheme>
          <GradeBasedThemeSync />
          <HashRouter>
          <RouteTestWrapper>
          <ConnectivityBanner />
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Dev Routes - Public for testing */}
          <Route path="/dev/routes" element={<DevRoutes />} />
          
          {/* Protected Routes for Learners */}
          <Route path="/" element={<ProtectedRoute allowedRoles={['learner']}><Lock /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['learner']}><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={['learner']}><Settings /></ProtectedRoute>} />
          <Route 
            path="/sensory-profile" 
            element={
              <ProtectedRoute allowedRoles={['learner']}>
                <SensoryProfileSetup 
                  learnerId="demo_learner_123" 
                  onComplete={() => window.location.href = '/'} 
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/calm" 
            element={
              <ProtectedRoute allowedRoles={['learner']}>
                <SelfRegulationHub 
                  learnerId="demo_learner_123" 
                  onClose={() => window.location.href = '/'} 
                />
              </ProtectedRoute>
            } 
          />
          <Route path="/organize" element={<ProtectedRoute allowedRoles={['learner']}><ExecutiveFunctionPage /></ProtectedRoute>} />
          <Route path="/subjects" element={<ProtectedRoute allowedRoles={['learner']}><SubjectSelection /></ProtectedRoute>} />
          <Route path="/cloning" element={<ProtectedRoute allowedRoles={['learner']}><ModelCloning /></ProtectedRoute>} />
          <Route path="/assessment" element={<ProtectedRoute allowedRoles={['learner']}><BaselineAssessment /></ProtectedRoute>} />
          <Route path="/assessment-results" element={<ProtectedRoute allowedRoles={['learner']}><AssessmentResults /></ProtectedRoute>} />
          <Route path="/activity/reading" element={<ProtectedRoute allowedRoles={['learner']}><ReadingActivity /></ProtectedRoute>} />
          <Route path="/activity/math" element={<ProtectedRoute allowedRoles={['learner']}><MathActivity /></ProtectedRoute>} />
          <Route path="/activity/speech" element={<ProtectedRoute allowedRoles={['learner']}><SpeechActivity /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute allowedRoles={['learner']}><Rewards /></ProtectedRoute>} />
          
          {/* Homework Helper */}
          <Route path="/homework-helper" element={<ProtectedRoute allowedRoles={['learner']}><HomeworkInbox learnerId="demo_learner_123" /></ProtectedRoute>} />
          <Route path="/homework-helper/new" element={<ProtectedRoute allowedRoles={['learner']}><HomeworkHelperPage /></ProtectedRoute>} />
          <Route path="/homework-helper/:sessionId" element={<ProtectedRoute allowedRoles={['learner']}><HomeworkSession /></ProtectedRoute>} />
          
          {/* Activity Route - For individual lessons/activities */}
          <Route path="/learner/:theme/subject/:subjectId/activity/:activityId" element={<ProtectedRoute allowedRoles={['learner']}><ActivityPage /></ProtectedRoute>} />
          
          {/* Subject Detail Route - Dynamic for all themes */}
          <Route path="/learner/:theme/subject/:subjectId" element={<ProtectedRoute allowedRoles={['learner']}><SubjectDetailPage /></ProtectedRoute>} />
          
          {/* K5 Subject Routes */}
          <Route path="/learner/k5/math" element={<ProtectedRoute allowedRoles={['learner']}><K5Math /></ProtectedRoute>} />
          <Route path="/learner/k5/science" element={<ProtectedRoute allowedRoles={['learner']}><K5Science /></ProtectedRoute>} />
          <Route path="/learner/k5/reading" element={<ProtectedRoute allowedRoles={['learner']}><K5Reading /></ProtectedRoute>} />
          <Route path="/learner/k5/writing" element={<ProtectedRoute allowedRoles={['learner']}><K5Writing /></ProtectedRoute>} />
          <Route path="/learner/k5/socialstudies" element={<ProtectedRoute allowedRoles={['learner']}><K5SocialStudies /></ProtectedRoute>} />
          <Route path="/learner/k5/art" element={<ProtectedRoute allowedRoles={['learner']}><K5Art /></ProtectedRoute>} />
          <Route path="/learner/k5/music" element={<ProtectedRoute allowedRoles={['learner']}><K5Music /></ProtectedRoute>} />
          <Route path="/learner/k5/pe" element={<ProtectedRoute allowedRoles={['learner']}><K5PE /></ProtectedRoute>} />
          <Route path="/learner/k5/health" element={<ProtectedRoute allowedRoles={['learner']}><K5Health /></ProtectedRoute>} />
          <Route path="/learner/k5/technology" element={<ProtectedRoute allowedRoles={['learner']}><K5Technology /></ProtectedRoute>} />
          
          {/* MS Subject Routes */}
          <Route path="/learner/ms/math" element={<ProtectedRoute allowedRoles={['learner']}><MSMath /></ProtectedRoute>} />
          <Route path="/learner/ms/science" element={<ProtectedRoute allowedRoles={['learner']}><MSScience /></ProtectedRoute>} />
          <Route path="/learner/ms/ela" element={<ProtectedRoute allowedRoles={['learner']}><MSELA /></ProtectedRoute>} />
          <Route path="/learner/ms/socialstudies" element={<ProtectedRoute allowedRoles={['learner']}><MSSocialStudies /></ProtectedRoute>} />
          <Route path="/learner/ms/worldlanguages" element={<ProtectedRoute allowedRoles={['learner']}><MSWorldLanguages /></ProtectedRoute>} />
          <Route path="/learner/ms/arts" element={<ProtectedRoute allowedRoles={['learner']}><MSArts /></ProtectedRoute>} />
          <Route path="/learner/ms/pehealth" element={<ProtectedRoute allowedRoles={['learner']}><MSPEHealth /></ProtectedRoute>} />
          <Route path="/learner/ms/technologycs" element={<ProtectedRoute allowedRoles={['learner']}><MSTechnologyCS /></ProtectedRoute>} />
          
          {/* HS Math Routes */}
          <Route path="/learner/hs/algebrai" element={<ProtectedRoute allowedRoles={['learner']}><AlgebraIPage /></ProtectedRoute>} />
          <Route path="/learner/hs/geometry" element={<ProtectedRoute allowedRoles={['learner']}><GeometryPage /></ProtectedRoute>} />
          <Route path="/learner/hs/algebraii" element={<ProtectedRoute allowedRoles={['learner']}><AlgebraIIPage /></ProtectedRoute>} />
          <Route path="/learner/hs/precalculus" element={<ProtectedRoute allowedRoles={['learner']}><PrecalculusPage /></ProtectedRoute>} />
          <Route path="/learner/hs/calculus" element={<ProtectedRoute allowedRoles={['learner']}><CalculusPage /></ProtectedRoute>} />
          
          {/* HS Science Routes */}
          <Route path="/learner/hs/biology" element={<ProtectedRoute allowedRoles={['learner']}><BiologyPage /></ProtectedRoute>} />
          <Route path="/learner/hs/chemistry" element={<ProtectedRoute allowedRoles={['learner']}><ChemistryPage /></ProtectedRoute>} />
          <Route path="/learner/hs/physics" element={<ProtectedRoute allowedRoles={['learner']}><PhysicsPage /></ProtectedRoute>} />
          
          {/* HS Other Routes */}
          <Route path="/learner/hs/ela" element={<ProtectedRoute allowedRoles={['learner']}><HSELA /></ProtectedRoute>} />
          <Route path="/learner/hs/ushistory" element={<ProtectedRoute allowedRoles={['learner']}><USHistoryPage /></ProtectedRoute>} />
          <Route path="/learner/hs/worldhistory" element={<ProtectedRoute allowedRoles={['learner']}><WorldHistoryPage /></ProtectedRoute>} />
          <Route path="/learner/hs/govecon" element={<ProtectedRoute allowedRoles={['learner']}><GovEconPage /></ProtectedRoute>} />
          <Route path="/learner/hs/computerscience" element={<ProtectedRoute allowedRoles={['learner']}><ComputerSciencePage /></ProtectedRoute>} />
          <Route path="/learner/hs/worldlanguages" element={<ProtectedRoute allowedRoles={['learner']}><HSWorldLanguages /></ProtectedRoute>} />
          <Route path="/learner/hs/arts" element={<ProtectedRoute allowedRoles={['learner']}><HSArts /></ProtectedRoute>} />
          <Route path="/learner/hs/pehealth" element={<ProtectedRoute allowedRoles={['learner']}><HSPEHealth /></ProtectedRoute>} />
          
          {/* 404 Catch-all - Must be last and public to show 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </RouteTestWrapper>
        
        {/* Global PWA Components */}
        <OfflineIndicator />
        <PWAInstallPrompt />
      </HashRouter>
      </ThemeProvider>
    </AuthProvider>
    </LearnerErrorBoundary>
  );
}

export default App;
